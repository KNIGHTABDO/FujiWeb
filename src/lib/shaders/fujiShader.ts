// FujiFilm Simulation Shader: Ultra-High Precision "Master" Version
// Focus: Extreme Sharpness + High-Fidelity Detail Preservation

export const fujiFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;

// Parameters
uniform float uExposure;
uniform float uContrast;
uniform float uGrainStrength;
uniform float uHalationThreshold;
uniform float uHalationIntensity;

varying vec2 vUv;

// Rec 709 Luminance
float getLuma(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

// Ultra-Sharpness Filter (3x3 Kernel)
vec3 applySharpness(vec3 color, sampler2D tex, vec2 uv, vec2 res) {
    vec2 step = 1.0 / res;
    
    // Kernel for sharpening
    vec3 center = color;
    vec3 n = texture2D(tex, uv + vec2(0.0, step.y)).rgb;
    vec3 s = texture2D(tex, uv - vec2(0.0, step.y)).rgb;
    vec3 e = texture2D(tex, uv + vec2(step.x, 0.0)).rgb;
    vec3 w = texture2D(tex, uv - vec2(step.x, 0.0)).rgb;
    
    // High-pass sharpening logic
    vec3 sharpened = center * 5.0 - (n + s + e + w);
    return mix(center, sharpened, 0.25); // 25% sharpness injection
}

// Ultra-subtle "Master" Grading
vec3 applyFujiMaster(vec3 color) {
    float luma = getLuma(color);
    
    // 1. Intelligent Highlight Compression
    float compression = smoothstep(0.7, 1.2, luma);
    color = mix(color, 1.0 - exp(-color * 1.5), compression * 0.2);

    // 2. Pro-Grade Color Balance
    vec3 highlights = vec3(1.02, 1.0, 0.98);
    vec3 shadows = vec3(0.98, 1.0, 1.02);
    color = mix(color * shadows, color * highlights, luma);

    // 3. Clarity & Detail Enhancement
    float midToneMask = smoothstep(0.2, 0.5, luma) * smoothstep(0.8, 0.5, luma);
    color += (color - 0.5) * 0.05 * midToneMask;

    return color;
}

float random(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 applyFineGrain(vec3 color, vec2 uv) {
    float grain = random(uv + fract(uTime));
    float luma = getLuma(color);
    float weight = uGrainStrength * (1.0 - pow(abs(luma - 0.5) * 2.0, 3.0));
    return color + (grain - 0.5) * weight * 0.05;
}

vec3 applySoftHalation(vec3 color, sampler2D tex, vec2 uv) {
    float luma = getLuma(color);
    if (luma < uHalationThreshold) return color;
    
    float blur = 0.002 * uHalationIntensity;
    vec3 scatter = vec3(0.0);
    scatter += texture2D(tex, uv + vec2(blur, 0.0)).rgb;
    scatter += texture2D(tex, uv - vec2(blur, 0.0)).rgb;
    scatter += texture2D(tex, uv + vec2(0.0, blur)).rgb;
    scatter += texture2D(tex, uv - vec2(0.0, blur)).rgb;
    scatter *= 0.25;

    return mix(color, color + scatter * vec3(1.0, 0.2, 0.1), 0.1 * uHalationIntensity);
}

void main() {
    vec4 texel = texture2D(tDiffuse, vUv);
    vec3 color = texel.rgb;

    // 1. Extreme Sharpness Pass
    color = applySharpness(color, tDiffuse, vUv, uResolution);

    // 2. Master Grade
    color = applyFujiMaster(color);
    
    // 3. Physics (Ultra-Subtle)
    color = applySoftHalation(color, tDiffuse, vUv);
    color = applyFineGrain(color, vUv);

    // 4. Final Mastering
    color = (color - 0.5) * uContrast + 0.5;
    color *= pow(2.0, uExposure);

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
