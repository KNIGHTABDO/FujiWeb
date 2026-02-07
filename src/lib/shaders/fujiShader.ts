// FujiFilm Simulation Shader
// Physically-inspired model for Halation, Grain, and Color

export const fujiFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;

// Params
uniform float uExposure;
uniform float uContrast;
uniform float uGrainStrength;
uniform float uGrainScale;
uniform float uHalationThreshold;
uniform float uHalationIntensity;

varying vec2 vUv;

// Utils: Luma
float getLuma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

// Utils: Noise
float random(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Effect: Halation (Simplified single-pass approximation)
// In a real multi-pass, we'd blur a thresholded buffer.
// Here we sample neighbors to approximate glow.
vec3 applyHalation(vec3 color, sampler2D tex, vec2 uv) {
    if (uHalationIntensity <= 0.0) return color;

    float luma = getLuma(color);
    if (luma < uHalationThreshold) return color;

    // Simple scatter (very cheap approximation)
    vec3 glow = vec3(0.0);
    float total = 0.0;
    float radius = 0.005 * uHalationIntensity; // Dynamic radius
    
    // Red-tinted spread (Fuji film backplate characteristic)
    vec3 halationTint = vec3(1.0, 0.4, 0.2); 

    for(float x = -2.0; x <= 2.0; x++) {
        for(float y = -2.0; y <= 2.0; y++) {
            vec2 offset = vec2(x, y) * radius;
            vec3 neighbor = texture2D(tex, uv + offset).rgb;
            float neighborLuma = getLuma(neighbor);
            
            // Only bright neighbors contribute
            if (neighborLuma > uHalationThreshold) {
                glow += neighbor * halationTint; 
                total += 1.0;
            }
        }
    }
    
    glow /= max(total, 1.0);
    return mix(color, glow, 0.4 * uHalationIntensity); // Blend
}

// Effect: Film Grain
vec3 applyGrain(vec3 color, vec2 uv) {
    if (uGrainStrength <= 0.0) return color;

    float noise = random(uv * uTime * uGrainScale); // Animated noise
    float luma = getLuma(color);
    
    // Masking: Grain shows in midtones, less in shadows/highlights
    float mask = 1.0 - abs(luma - 0.5) * 2.0;
    mask = smoothstep(0.2, 0.8, mask);

    // Overlay blend mode approximation
    vec3 grained = color + (noise - 0.5) * uGrainStrength * mask;
    return grained;
}

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;

    // 1. Exposure
    color *= pow(2.0, uExposure);

    // 2. Contrast
    color = (color - 0.5) * uContrast + 0.5;

    // 3. Halation (Physics)
    color = applyHalation(color, tDiffuse, vUv);

    // 4. Color Grading (Placeholder for LUT)
    // Classic Chrome-ish: Desaturated shadows, punchy reds
    // (Very rough math approximation)
    vec3 gray = vec3(getLuma(color));
    color = mix(gray, color, 1.1); // Saturation boost
    color.b *= 0.95; // Warm shift

    // 5. Grain (Texture)
    color = applyGrain(color, vUv);

    gl_FragColor = vec4(color, texel.a);
}
`;

export const fujiVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
