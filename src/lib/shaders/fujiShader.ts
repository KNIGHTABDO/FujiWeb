// FujiFilm Simulation Shader
// Physically-inspired model for Halation, Grain, and Color

export const fujiFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;

// Parameters
uniform float uExposure;
uniform float uContrast;
uniform float uGrainStrength;
uniform float uGrainScale;
uniform float uHalationThreshold;
uniform float uHalationIntensity;

varying vec2 vUv;

// Utils: Luma (Rec 709)
float getLuma(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

// Utils: Noise for Grain
float random(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Classic Chrome Curve: High contrast, desaturated shadows
vec3 applyClassicChrome(vec3 color) {
    // 1. Desaturate shadows more than highlights
    float luma = getLuma(color);
    vec3 gray = vec3(luma);
    
    // Saturation weighting: less saturation in darks
    float satMask = smoothstep(0.0, 0.6, luma);
    color = mix(gray, color, 0.7 + 0.3 * satMask);

    // 2. Teal-ish Shadows / Warm Highlights shift
    color.r += (1.0 - luma) * -0.02 + luma * 0.02;
    color.b += (1.0 - luma) * 0.03 + luma * -0.03;

    // 3. Punchy Red (Classic Chrome characteristic)
    float redMask = max(0.0, color.r - max(color.g, color.b)) * 2.0;
    color.r += redMask * 0.1;

    // 4. Contrast Curve (S-Curve)
    color = smoothstep(0.0, 1.0, color);
    
    return color;
}

// Effect: Halation (Light scattering in film layers)
vec3 applyHalation(vec3 color, sampler2D tex, vec2 uv) {
    if (uHalationIntensity <= 0.0) return color;

    // Threshold high energy sources
    float luma = getLuma(color);
    float haloSource = smoothstep(uHalationThreshold, 1.0, luma);
    
    // Cheap 5-tap scatter
    vec3 halationColor = vec3(1.0, 0.15, 0.05); // Red-shifted scatter
    vec3 bloom = vec3(0.0);
    float blurRadius = 0.006 * uHalationIntensity;
    
    bloom += texture2D(tex, uv + vec2(blurRadius, 0.0)).rgb;
    bloom += texture2D(tex, uv - vec2(blurRadius, 0.0)).rgb;
    bloom += texture2D(tex, uv + vec2(0.0, blurRadius)).rgb;
    bloom += texture2D(tex, uv - vec2(0.0, blurRadius)).rgb;
    bloom *= 0.25;

    float bloomLuma = getLuma(bloom);
    vec3 finalHalo = smoothstep(uHalationThreshold * 0.8, 1.0, bloomLuma) * halationColor;

    return color + finalHalo * uHalationIntensity;
}

// Effect: Physics-based Grain (Luminance dependent)
vec3 applyGrain(vec3 color, vec2 uv) {
    if (uGrainStrength <= 0.0) return color;

    // Randomized offset for grain animation
    float grain = random(uv + fract(uTime));
    float luma = getLuma(color);
    
    // Grain weight: peaks at midtones (0.5), dies in extreme shadows/highlights
    float weight = 1.0 - pow(abs(luma - 0.5) * 2.0, 1.5);
    
    // Non-linear grain size (larger in shadows)
    float sizeScale = mix(1.5, 0.8, luma); 
    
    return color + (grain - 0.5) * uGrainStrength * weight * sizeScale;
}

void main() {
    // 1. Initial Sample
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;

    // 2. Exposure & Dynamic Range Handling
    color *= pow(2.0, uExposure);
    
    // 3. Halation (Physics)
    color = applyHalation(color, tDiffuse, vUv);

    // 4. Fuji Classic Chrome Color Science
    color = applyClassicChrome(color);

    // 5. Global Contrast Adjustment
    color = (color - 0.5) * uContrast + 0.5;

    // 6. Final Grain Application
    color = applyGrain(color, vUv);

    // 7. Vignette (Film characteristic)
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(0.8, 0.35, dist * 0.8);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
}
`;

export const fujiVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
