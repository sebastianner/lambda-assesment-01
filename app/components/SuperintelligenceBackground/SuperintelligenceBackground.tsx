"use client";

import { useEffect, useRef, useCallback } from "react";

const VERT = `#version 300 es
precision mediump float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uTextureMatrix;
out vec2 vTextureCoord;
out vec3 vVertexPosition;
void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
}`;

const VERT_BG = `#version 300 es
precision mediump float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
out vec2 vTextureCoord;
out vec3 vVertexPosition;
void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
}`;

const FS_BG = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform vec2 uMousePos;
out vec4 fragColor;
void main() {
  fragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

// Original wisps shader from JSON — only the color vec3 at the end is changed to rainbow
const FS_WISPS = `#version 300 es
precision highp float;
in vec3 vVertexPosition; in vec2 vTextureCoord; uniform sampler2D uTexture; uniform float uTime; uniform vec2 uMousePos; uniform vec2 uResolution; vec3 blend (int blendMode, vec3 src, vec3 dst) { return src + dst; }
out vec4 fragColor; const float PI = 3.14159265359; mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
vec2 hash(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453123); }
float luma(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }
vec3 hsv2rgb(float h) {
  vec3 k = vec3(1.0, 2.0/3.0, 1.0/3.0);
  vec3 p = abs(fract(vec3(h) + k) * 6.0 - vec3(3.0));
  return clamp(p - vec3(1.0), 0.0, 1.0);
}
float voronoi_additive(vec2 st, float radius, vec2 mouse_pos, float scale) {
  vec2 i_st = floor(st); vec2 f_st = fract(st);
  float wander = 0.0000 * uTime * 0.2; float total_contribution = 0.0;
  for (int y = -2; y <= 2; y++) { for (int x = -2; x <= 2; x++) {
    vec2 neighbor = vec2(float(x), float(y)); vec2 cell_id = i_st + neighbor;
    vec2 point = hash(cell_id);
    point = 0.5 + 0.5 * sin(5. + wander + 6.2831 * point);
    vec2 starAbsPos = cell_id + point;
    vec2 dirToMouse = mouse_pos - starAbsPos; float distToMouse = length(dirToMouse);
    float attractStrength = 0.0000 * exp(-distToMouse * mix(2.0 + 0.9280 * 2., 0.5, 0.5000)) * 2.;
    starAbsPos += dirToMouse * attractStrength;
    vec2 diff = starAbsPos - st; float dist = length(diff);
    float contribution = radius / max(dist, radius * 0.1);
    float shimmer_phase = dot(point, vec2(1.0)) * 10. + hash(cell_id).x * 5.0 + uTime * 0.5;
    float shimmer = mix(1., (sin(shimmer_phase) + 1.), 0.9300);
    contribution *= shimmer;
    total_contribution += mix(contribution*contribution, contribution * 2., 0.0800);
  } }
  return total_contribution;
}
vec4 randomStyle() {
  vec2 uv = vTextureCoord; vec4 bg = texture(uTexture, uv); vec4 color = vec4(0.0);
  vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 mPos = mix(vec2(0.0), (uMousePos - 0.5), 0.0000);
  uv -= vec2(0.5, 0.5); uv *= aspectRatio; uv = uv * rot(0.2511 * 2.0 * PI);
  uv *= 40.0 * 0.9280; uv *= mix(vec2(1.0), vec2(1.0, 0.0), 0.9700); uv /= aspectRatio;
  mPos = mPos * rot(0.2511 * 2.0 * PI);
  vec2 mouseGrid = uMousePos; mouseGrid -= vec2(0.5, 0.5); mouseGrid *= aspectRatio;
  mouseGrid = mouseGrid * rot(0.2511 * 2.0 * PI); mouseGrid *= 40.0 * 0.9280;
  mouseGrid *= mix(vec2(1.0), vec2(1.0, 0.0), 0.9700); mouseGrid /= aspectRatio;
  vec2 movementOffset = vec2(0.0, uTime * 0.5000 * -0.05);
  vec2 mouseGrid1 = mouseGrid - (mPos * 38.0 * 0.9280) + movementOffset;
  vec2 mouseGrid2 = mouseGrid - (mPos * 48.0 * 0.9280) + movementOffset;
  vec2 st1 = uv - (mPos * 38.0 * 0.9280); vec2 st2 = uv - (mPos * 48.0 * 0.9280);
  vec2 mouse1 = st1 + vec2(0.0, uTime * 0.5000 * -0.05);
  vec2 mouse2 = st2 + vec2(0.0, uTime * 0.5000 * -0.05);
  float radius1 = 0.5 * 0.3800; float radius2 = 0.5 * 0.3800;
  float pass1 = voronoi_additive(mouse1 * aspectRatio, radius1, mouseGrid1 * aspectRatio, 38.0 * 0.9280);
  float pass2 = voronoi_additive(mouse2 * aspectRatio + vec2(10), radius2, mouseGrid2 * aspectRatio + vec2(10.0), 48.0 * 0.9280);
  pass1 *= 0.02; pass2 *= 0.04;
  float intensity = pass1 + pass2;
  // Rainbow: derive hue from the cell position so each streak has a different color
  vec2 cell = floor(mouse1 * aspectRatio);
  float hue = fract(hash(cell).x * 0.5 + 0.5);
  // Low saturation (0.55) and low value (0.45) for Lambda's muted diffused look
  vec3 k = vec3(1.0, 2.0/3.0, 1.0/3.0);
  vec3 pp = abs(fract(vec3(hue) + k) * 6.0 - vec3(3.0));
  vec3 spectrum = 0.45 * mix(vec3(1.0), clamp(pp - vec3(1.0), 0.0, 1.0), 0.55);
  // Subtle white core only at very high intensity
  spectrum = mix(spectrum, vec3(0.6), pow(clamp(intensity * 1.5, 0.0, 1.0), 5.0) * 0.3);
  color.rgb = intensity * spectrum * 2.5 * mix(1.0, bg.r, 0.2000);
  color.rgb = clamp(color.rgb, 0.0, 1.0); color.rgb = blend(1, bg.rgb, color.rgb);
  color = vec4(color.rgb, max(bg.a, luma(color.rgb))); return color;
}
void main() { fragColor = randomStyle(); }`;

const FS_VIGNETTE = `#version 300 es
precision highp float;
in vec3 vVertexPosition; in vec2 vTextureCoord; uniform sampler2D uTexture; uniform vec2 uMousePos; uniform vec2 uResolution;
out vec4 fragColor; mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
void main() {
  vec2 uv = vTextureCoord; vec4 color = texture(uTexture, uv);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float displacement = (luma - 0.5) * 0.0 * 0.5;
  vec2 aspectRatio = vec2(uResolution.x/uResolution.y, 1.0);
  vec2 skew = vec2(0.0, 1.0);
  float halfRadius = 0.44 * 0.5; float innerEdge = halfRadius - 1.0 * halfRadius * 0.5; float outerEdge = halfRadius + 1.0 * halfRadius * 0.5;
  vec2 pos = vec2(0.5, 0.5); pos += (uMousePos - 0.5) * 0.28;
  const float TWO_PI = 6.28318530718;
  vec2 scaledUV = uv * aspectRatio * rot(0.0) * skew;
  vec2 scaledPos = pos * aspectRatio * rot(0.0) * skew;
  float radius = distance(scaledUV, scaledPos);
  float falloff = smoothstep(innerEdge + displacement, outerEdge + displacement, radius);
  vec3 finalColor = mix(color.rgb, mix(color.rgb, vec3(0.0, 0.0, 0.0), 1.0), falloff);
  color = mix(color * (1.-falloff), vec4(finalColor * color.a, color.a), 1.0);
  fragColor = color;
}`;

const FS_CHROMAB = `#version 300 es
precision highp float;
in vec3 vVertexPosition; in vec2 vTextureCoord; uniform sampler2D uTexture; uniform float uTime; uniform vec2 uMousePos; uniform vec2 uResolution;
float ease (int easingFunc, float t) { return t; }
out vec4 fragColor; const float PI = 3.1415926;
vec3 getAbberatedColor(vec3 color, vec3 left, vec3 center, vec3 right) { return vec3(left.r, mix(color.g, center.g, float(0)), right.b); }
void main() {
  vec2 uv = vTextureCoord; float aspectRatio = uResolution.x/uResolution.y;
  vec2 mPos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0);
  vec2 pos = vec2(0.5, 0.5);
  float angle = ((0.2592 + uTime * 0.05) * 360.0) * PI / 180.0;
  vec2 rotation = vec2(sin(angle), cos(angle));
  vec4 color = texture(uTexture, uv);
  float mDist = ease(0, max(0., 1. - distance(uv * vec2(aspectRatio, 1.), mPos * vec2(aspectRatio, 1.)) * 4. * (1. - 1.0)));
  vec2 aberrated = 0.6920 * rotation * 0.03 * mix(1.0, distance(uv, pos) * (1.0 + 0.0), 0.0);
  aberrated *= mDist;
  float amt = length(aberrated);
  if(amt < 0.001) { fragColor = color; return; }
  vec4 left = texture(uTexture, uv - aberrated); vec4 right = texture(uTexture, uv + aberrated); vec4 center = vec4(0);
  color.rgb = getAbberatedColor(color.rgb, left.rgb, center.rgb, right.rgb);
  color.a = max(max(left.a, center.a), right.a); fragColor = color;
}`;

const FS_VORONOI = `#version 300 es
precision mediump float;
in vec3 vVertexPosition; in vec2 vTextureCoord; uniform sampler2D uTexture; uniform float uTime; uniform vec2 uMousePos; uniform vec2 uResolution;
float ease (int easingFunc, float t) { return t; }
vec2 random2(vec2 p) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }
const float PI = 3.14159265359; mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
out vec4 fragColor;
vec2 voronoidNoise(vec2 st) {
  vec2 i_st = floor(st); vec2 f_st = fract(st); float m_dist = 15.; vec2 m_point; vec2 d;
  for (int j=-1; j<=1; j++) { for (int i=-1; i<=1; i++) {
    vec2 neighbor = vec2(float(i),float(j)); vec2 point = random2(i_st + neighbor);
    point = 0.5 + 0.5 * sin(5. + uTime * 0.2 + 6.2831*point);
    vec2 diff = neighbor + point - f_st; float dist = length(diff);
    if(dist < m_dist) { m_dist = dist; m_point = point; d = diff; }
  } }
  return m_point;
}
vec2 voronoiFBM(vec2 st) {
  vec2 value = vec2(0.0); vec2 shift = vec2(100.0); float xp = sqrt(2.); mat2 r = rot(0.5);
  for (int i = 0; i < 8; i++) { value += voronoidNoise(st); st = st * xp + shift; st = r * st; }
  return value / float(8);
}
void main() {
  vec2 uv = vTextureCoord; float aspectRatio = uResolution.x/uResolution.y;
  vec2 skew = mix(vec2(1), vec2(1, 0), 1.0);
  vec2 st = (uv - vec2(0.5, 0.5009487666034156)) * vec2(aspectRatio, 1.) * 50. * 0.8;
  st = st * rot(0.2511 * 2. * PI) * skew;
  vec2 m_point = voronoiFBM(st);
  vec2 offset = (m_point * 0.2 * 0.7 * 2.) - (0.7 * 0.2);
  vec2 mPos = vec2(0.5, 0.5009487666034156) + mix(vec2(0), (uMousePos-0.5), 0.0);
  vec2 pos = mix(vec2(0.5, 0.5009487666034156), mPos, floor(1.0));
  float dist = ease(0, max(0.,1.-distance(uv * vec2(aspectRatio, 1), mPos * vec2(aspectRatio, 1)) * 4. * (1. - 1.0)));
  vec4 color = texture(uTexture, uv + offset * dist); fragColor = color;
}`;

const FS_BLOOM = `#version 300 es
precision highp float;
in vec3 vVertexPosition; in vec2 vTextureCoord; uniform sampler2D uTexture; uniform sampler2D uBgTexture; uniform vec2 uResolution;
out vec4 fragColor;
float luma(vec4 color) { return dot(color.rgb, vec3(0.299, 0.587, 0.114)); }
float getExponentialWeight(int index) {
  if(index==0) return 1.0; if(index==1) return 0.7165; if(index==2) return 0.5134;
  if(index==3) return 0.3679; if(index==4) return 0.2636; if(index==5) return 0.1889;
  if(index==6) return 0.1353; if(index==7) return 0.0970; if(index==8) return 0.0695;
  return 0.0;
}
vec4 blur(vec2 uv, vec2 dir) {
  vec4 color = vec4(0.0); float total_weight = 0.0;
  float aspectRatio = uResolution.x/uResolution.y;
  dir *= vec2(0.61, 1. - 0.61); dir.x /= aspectRatio;
  vec4 center = texture(uTexture, uv); float cw = getExponentialWeight(0);
  color += center * cw; total_weight += cw;
  for (int i = 1; i <= 8; i++) {
    float weight = getExponentialWeight(i);
    float offset = mix(0.015, 0.025, 0.2) * float(i)/8.;
    color += texture(uTexture, uv + offset * dir) * weight;
    color += texture(uTexture, uv - offset * dir) * weight;
    total_weight += 2.0 * weight;
  }
  return color / total_weight;
}
uvec2 pcg2d(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u;
  v ^= v >> 16u;
  v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u;
  return v;
}
float randFibo(vec2 p) { uvec2 v = floatBitsToUint(p); v = pcg2d(v); uint r = v.x ^ v.y; return float(r) / float(0xffffffffu); }
void main() {
  vec2 uv = vTextureCoord;
  vec4 bloomColor = blur(uv, vec2(1,1));
  bloomColor = (bloomColor + blur(uv, vec2(1,-1))) * 0.5;
  float dither = (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;
  bloomColor.rgb += dither; bloomColor.a = luma(bloomColor);
  vec4 sceneColor = texture(uBgTexture, uv);
  vec4 finalColor = mix(sceneColor, sceneColor + bloomColor, 0.55 * 1.75);
  fragColor = finalColor;
}`;

const FS_PROJECTION = `#version 300 es
precision highp float;
in vec3 vVertexPosition; in vec2 vTextureCoord;
uniform sampler2D uTexture; uniform float uTime; uniform vec2 uMousePos;
const float PI = 3.14159265;
vec3 getRayDirection(vec2 uv, vec2 mousePos, float aspect) {
  vec2 screenPos = (uv - 0.5) * 2.0;
  screenPos.x *= aspect; screenPos.y *= -1.0;
  float fov = mix(radians(20.0), radians(120.0), 0.75);
  vec3 rayDir = normalize(vec3(screenPos.x * tan(fov/2.0), screenPos.y * tan(fov/2.0), -1.0));
  float rotX = (mousePos.y - 0.5) * PI;
  float rotY = (mousePos.x - 0.5) * PI * 2.0;
  mat3 rotateY = mat3(cos(rotY),0.,-sin(rotY), 0.,1.,0., sin(rotY),0.,cos(rotY));
  mat3 rotateX = mat3(1.,0.,0., 0.,cos(rotX),sin(rotX), 0.,-sin(rotX),cos(rotX));
  return normalize(rotateX * rotateY * rayDir);
}
vec2 directionToUVHorizontal(vec3 dir) {
  float longitude = atan(dir.z, dir.x);
  float latitude = acos(dir.y);
  vec2 uv;
  uv.x = longitude / (2.0 * PI) + 0.5;
  uv.y = latitude / PI;
  uv.x += 0.25;
  return uv;
}
out vec4 fragColor;
void main() {
  float aspect = 2.;
  vec2 mPos = vec2(0.5, 0.5);
  vec3 rayDir = getRayDirection(vTextureCoord, mPos, aspect);
  vec2 sphereUV = directionToUVHorizontal(rayDir);
  float fov = mix(radians(20.0), radians(120.0), 0.75);
  float compensatedScale = (mix(-0.1, 0.4, 0.29) * 12.0 + 2.0) * (1.0/tan(fov/2.0));
  sphereUV = (sphereUV - 0.5) * compensatedScale + 0.5;
  sphereUV = clamp(sphereUV, 0.0, 1.0);
  fragColor = texture(uTexture, sphereUV);
}`;

interface Pass {
  program: WebGLProgram;
  fbo: WebGLFramebuffer | null;
  texture: WebGLTexture | null;
}
interface State {
  passes: Pass[];
  buf: WebGLBuffer;
  raf: number;
  time: number;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const e = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(e!);
  }
  return s;
}
function mkProgram(
  gl: WebGL2RenderingContext,
  vert: string,
  fs: string,
): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p)!);
  return p;
}
function mkFBO(gl: WebGL2RenderingContext, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { fbo, tex };
}

const IDENTITY = new Float32Array([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export default function SuperintelligenceBackground({
  className,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const stateRef = useRef<State | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - r.left) / r.width,
      y: 1.0 - (e.clientY - r.top) / r.height,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const verts = new Float32Array([
      -1, -1, 0, 0, 0, 1, -1, 0, 1, 0, -1, 1, 0, 0, 1, 1, 1, 0, 1, 1,
    ]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const bindQuad = (prog: WebGLProgram) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const pl = gl.getAttribLocation(prog, "aVertexPosition");
      const ul = gl.getAttribLocation(prog, "aTextureCoord");
      if (pl >= 0) {
        gl.enableVertexAttribArray(pl);
        gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 20, 0);
      }
      if (ul >= 0) {
        gl.enableVertexAttribArray(ul);
        gl.vertexAttribPointer(ul, 2, gl.FLOAT, false, 20, 12);
      }
      const mv = gl.getUniformLocation(prog, "uMVMatrix");
      if (mv) gl.uniformMatrix4fv(mv, false, IDENTITY);
      const pp = gl.getUniformLocation(prog, "uPMatrix");
      if (pp) gl.uniformMatrix4fv(pp, false, IDENTITY);
      const tm = gl.getUniformLocation(prog, "uTextureMatrix");
      if (tm) gl.uniformMatrix4fv(tm, false, IDENTITY);
    };

    const shaderPairs: [string, string][] = [
      [VERT_BG, FS_BG],
      [VERT, FS_WISPS],
      [VERT, FS_VIGNETTE],
      [VERT, FS_CHROMAB],
      [VERT, FS_VORONOI],
      [VERT, FS_BLOOM],
      [VERT, FS_PROJECTION],
    ];

    let passes: Pass[] = [];

    const buildPasses = (w: number, h: number) => {
      passes.forEach((p) => {
        gl.deleteProgram(p.program);
        if (p.fbo) gl.deleteFramebuffer(p.fbo);
        if (p.texture) gl.deleteTexture(p.texture);
      });
      passes = shaderPairs.map(([vs, fs], i) => {
        const program = mkProgram(gl, vs, fs);
        if (i === shaderPairs.length - 1)
          return { program, fbo: null, texture: null };
        const { fbo, tex } = mkFBO(gl, w, h);
        return { program, fbo, texture: tex };
      });
      if (stateRef.current) stateRef.current.passes = passes;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.max(1, Math.floor(canvas.offsetWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.offsetHeight * dpr));
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      buildPasses(w, h);
    };

    resize();
    const state: State = { passes, buf, raf: 0, time: 0 };
    stateRef.current = state;

    const draw = () => {
      const w = canvas.width,
        h = canvas.height;
      const { x: mx, y: my } = mouseRef.current;

      state.passes.forEach((pass, i) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, pass.fbo);
        gl.viewport(0, 0, w, h);
        gl.useProgram(pass.program);
        bindQuad(pass.program);

        const u = (n: string) => gl.getUniformLocation(pass.program, n);
        const tl = u("uTime");
        if (tl) gl.uniform1f(tl, state.time);
        const rl = u("uResolution");
        if (rl) gl.uniform2f(rl, w, h);
        const ml = u("uMousePos");
        if (ml) gl.uniform2f(ml, mx, my);

        if (i > 0 && state.passes[i - 1].texture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, state.passes[i - 1].texture);
          const sl = u("uTexture");
          if (sl) gl.uniform1i(sl, 0);
        }
        if (i === 5 && state.passes[4].texture) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, state.passes[4].texture);
          const bl = u("uBgTexture");
          if (bl) gl.uniform1i(bl, 1);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });

      state.time += 0.004;
      state.raf = requestAnimationFrame(draw);
    };

    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(state.raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      state.passes.forEach((p) => {
        gl.deleteProgram(p.program);
        if (p.fbo) gl.deleteFramebuffer(p.fbo);
        if (p.texture) gl.deleteTexture(p.texture);
      });
      gl.deleteBuffer(buf);
      stateRef.current = null;
    };
  }, [onMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
