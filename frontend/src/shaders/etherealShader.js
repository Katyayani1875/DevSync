const glsl = (x) => x[0];

export const vertexShader = glsl`
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vPosition = modelPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
`;

export const fragmentShader = glsl`
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel effect: Glow is strongest on the edges facing away from the camera
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - dot(vNormal, viewDirection);
  fresnel = pow(fresnel, 2.0); // Power makes the glow tighter to the edge

  float finalOpacity = fresnel * uOpacity;

  gl_FragColor = vec4(uGlowColor, finalOpacity);
}
`;