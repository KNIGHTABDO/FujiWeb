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

// "Nostalgic Negative" / Sunny Classic Chrome Math
// Focuses on Amber/Gold highlights and Cyan/Teal shadows
vec3 applyNostalgicNegative(vec3 color) {
    float luma = getLuma(color);
    
    // 1. Warm "Golden Hour" Tone Mapping
    // Lift blacks slightly and tint with warm amber
    vec3 amber = vec3(1.0, 0.7, 0.4);
    vec3 cyan = vec3(0.3, 0.8, 1.0);
    
    // Split Toning: Warm highlights, Cool shadows
    color = mix(color * cyan, color, smoothstep(0.0, 0.5, luma));
    color = mix(color, color * amber, smoothstep(0.4, 1.0, luma));

    // 2. High Dynamic Range Curve (Fuji Dynamic Range 400% logic)
    // Compresses highlights to prevent clipping and keeps them "creamy"
    vec3 highlights = smoothstep(0.5, 1.2, color);
    color = color - highlights * 0.3; // Highlight roll-off

    // 3. Selective Saturation
    // Boost Oranges/Yellows (Sunlight), Desaturate Magentas (Digital artifacting)
    float warmMask = smoothstep(0.1, 0.4, color.r - color.b);
    color = mix(color, color * vec3(1.1, 1.05, 0.9), warmMask);

    // 4. Base S-Curve for that "Film Pop"
    color = pow(color, vec3(1.1)); // Deepen shadows
    color = color * 1.05; // Slight brightness boost
    
    return color;
}

// Effect: Halation (Light scattering in film layers)
vec3 applyHalation(vec3 color, sampler2D tex, vec2 uv) {
    if (uHalationIntensity <= 0.0) return color;

    float luma = getLuma(color);
    float haloSource = smoothstep(uHalationThreshold, 1.0, luma);
    
    vec3 halationColor = vec3(1.0, 0.2, 0.05); 
    vec3 bloom = vec3(0.0);
    float blurRadius = 0.008 * uHalationIntensity;
    
    bloom += texture2D(tex, uv + vec2(blurRadius, 0.0)).rgb;
    bloom += texture2D(tex, uv - vec2(blurRadius, 0.0)).rgb;
    bloom += texture2D(tex, uv + vec2(0.0, blurRadius)).rgb;
    bloom += texture2D(tex, uv - vec2(0.0, blurRadius)).rgb;
    bloom *= 0.25;

    return color + (bloom * halationColor * haloSource * uHalationIntensity);
}

// Effect: Physics-based Grain (Luminance dependent)
vec3 applyGrain(vec3 color, vec2 uv) {
    if (uGrainStrength <= 0.0) return color;

    float grain = random(uv + fract(uTime));
    float luma = getLuma(color);
    float weight = 1.0 - pow(abs(luma - 0.5) * 2.0, 2.0);
    
    return color + (grain - 0.5) * uGrainStrength * weight;
}

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;

    // 1. Exposure
    color *= pow(2.0, uExposure);
    
    // 2. Halation
    color = applyHalation(color, tDiffuse, vUv);

    // 3. Nostalgic "Sunny" Color Science
    color = applyNostalgicNegative(color);

    // 4. Final Mastering
    color = (color - 0.5) * uContrast + 0.5;
    color = applyGrain(color, vUv);

    // Vignette
    float dist = distance(vUv, vec2(0.5));
    color *= smoothstep(1.0, 0.4, dist * 0.9);

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
