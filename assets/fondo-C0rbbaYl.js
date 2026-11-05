import{Clock as e,LinearFilter as t,Mesh as n,OrthographicCamera as r,PlaneGeometry as i,Scene as a,ShaderMaterial as o,Vector2 as s,VideoTexture as c,WebGLRenderTarget as l}from"./three.module-BHyxiH0Q.js";var u=`varying vec2 vUv;\r
\r
void main() {\r
  vUv = uv;\r
  gl_Position = vec4(position.xy, 0.0, 1.0);\r
}\r
`,d=`precision highp float;\r
\r
uniform sampler2D tVideo;\r
uniform float uTime;\r
uniform float uPulso;\r
uniform vec2 uPuntero;\r
uniform float uIntensidad;\r
uniform float uRojo;\r
uniform float uEntrada;\r
uniform float uNoche;\r
uniform vec2 uResolucion;\r
uniform float uVideoAspect;\r
\r
varying vec2 vUv;\r
\r
float hash(vec2 p) {\r
  p = fract(p * vec2(123.34, 456.21));\r
  p += dot(p, p + 45.32);\r
  return fract(p.x * p.y);\r
}\r
\r
float hash2D(vec2 p, float t) {\r
  return hash(p + vec2(t * 13.17, t * 71.31)) * 2.0 - 1.0;\r
}\r
\r
void main() {\r
  float screenAspect = uResolucion.x / max(uResolucion.y, 1.0);\r
  vec2 uv = vUv;\r
  if (screenAspect > uVideoAspect) {\r
    float scale = uVideoAspect / screenAspect;\r
    uv.y = (vUv.y - 0.5) * scale + 0.5;\r
  } else {\r
    float scale = screenAspect / uVideoAspect;\r
    uv.x = (vUv.x - 0.5) * scale + 0.5;\r
  }\r
\r
  // Puntero: distorsion radial suave (radio 0.18)\r
  vec2 toPtr = vUv - uPuntero;\r
  toPtr.x *= screenAspect;\r
  float distPtr = length(toPtr);\r
  float heatRad = 0.18;\r
  if (distPtr < heatRad) {\r
    float heat = 1.0 - distPtr / heatRad;\r
    float wave = sin(distPtr * 40.0 - uTime * 6.0) * 0.008 * heat;\r
    uv += normalize(vUv - uPuntero + 0.0001) * wave;\r
  }\r
\r
  // Shift de pixeles en bloques con el pulso del kick\r
  float blockPx = mix(24.0, 8.0, uPulso);\r
  vec2 pixelCoord = vUv * uResolucion;\r
  vec2 blockCoord = floor(pixelCoord / blockPx);\r
  float timeStep = floor(uTime * 8.0);\r
  float blockNoise = hash2D(blockCoord, timeStep);\r
  float shiftX = blockNoise * uPulso * uIntensidad * 0.04;\r
  uv.x += shiftX;\r
\r
  vec4 vid = texture2D(tVideo, clamp(uv, 0.0, 1.0));\r
\r
  // Luminancia -> B/N con contraste fuerte\r
  float lum = dot(vid.rgb, vec3(0.299, 0.587, 0.114));\r
  float bn = smoothstep(0.08, 0.92, lum);\r
  bn = pow(bn, 1.25);\r
\r
  // Grano de pelicula (amplitud 0.06)\r
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 43.17)) * 2.0 - 1.0) * 0.06;\r
  bn = clamp(bn + grain, 0.0, 1.0);\r
\r
  // Vineta normal (durante Arrival)\r
  vec2 cDist = (vUv - 0.5) * vec2(1.2, 1.0);\r
  float vigNormal = clamp(1.0 - dot(cDist, cDist) * 0.85, 0.1, 1.0);\r
\r
  // Vineta fuerte y halo para la entrada (uEntrada = 0)\r
  vec2 centerVec = (vUv - 0.5);\r
  centerVec.x *= screenAspect;\r
  float distCenter = length(centerVec);\r
\r
  // Halo suave detras del centro (radio ~= 0.35 de la altura, +0.06 de brillo)\r
  float halo = (1.0 - smoothstep(0.0, 0.35, distCenter)) * 0.06;\r
\r
  // Vineta fuerte de entrada: bordes oscurecidos hasta 0\r
  float vigEntrada = 1.0 - smoothstep(0.25, 0.75, distCenter);\r
  vigEntrada = clamp(vigEntrada, 0.0, 1.0);\r
\r
  float vig = mix(vigEntrada, vigNormal, uEntrada);\r
  bn = (bn + halo * (1.0 - uEntrada)) * vig;\r
\r
  // Entrada: uEntrada = 0 baja a brillo 0.10. Noche: se oscurece un 25% al llegar a 00:00\r
  float brightness = mix(0.10, 0.45, uEntrada);\r
  brightness *= (1.0 - 0.25 * clamp(uNoche, 0.0, 1.0));\r
  // 00:00 (Inner Circle): uIntensidad baja a 0.05 y la noche se apaga a ~12 % (la entrada usa >= 0.15, no le afecta)\r
  brightness *= mix(0.12, 1.0, smoothstep(0.05, 0.12, uIntensidad));\r
  bn *= brightness;\r
\r
  vec3 col = vec3(bn);\r
\r
  // Mix hacia rojo (--rojo: #ff1a1a)\r
  vec3 rojoCol = vec3(1.0, 0.102, 0.102);\r
  col = mix(col, col * rojoCol, uRojo);\r
\r
  gl_FragColor = vec4(col, 1.0);\r
}\r
`;function f(f,p=!1){let m=new a,h=new r(-1,1,1,-1,0,1),g=document.createElement(`video`);g.muted=!0,g.playsInline=!0,g.loop=!0,g.autoplay=!0,g.preload=`auto`,g.crossOrigin=`anonymous`,g.style.display=`none`;let _=document.createElement(`source`);_.src=`/media/fondo_puente.webm`,_.type=`video/webm`,g.appendChild(_);let v=document.createElement(`source`);v.src=`/media/fondo_puente.mp4`,v.type=`video/mp4`,g.appendChild(v),document.body.appendChild(g),g.play().catch(()=>{});let y=new c(g);y.minFilter=t,y.magFilter=t;let b={tVideo:{value:y},uTime:{value:0},uPulso:{value:0},uPuntero:{value:new s(.5,.5)},uIntensidad:{value:.15},uRojo:{value:0},uEntrada:{value:0},uNoche:{value:0},uResolucion:{value:new s(window.innerWidth,window.innerHeight)},uVideoAspect:{value:960/640}},x=new o({vertexShader:u,fragmentShader:d,uniforms:b,depthWrite:!1,depthTest:!1}),S=new n(new i(2,2),x);m.add(S);let C=null,w=null,T=null,E=null;p&&(C=new l(Math.max(1,Math.round(window.innerWidth)),Math.max(1,Math.round(window.innerHeight)),{minFilter:t,magFilter:t,depthBuffer:!1,stencilBuffer:!1}),T=new o({vertexShader:u,fragmentShader:`precision mediump float;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tDiffuse, vUv);
}`,uniforms:{tDiffuse:{value:C.texture}},depthWrite:!1,depthTest:!1}),E=new n(new i(2,2),T),w=new a,w.add(E));let D=async()=>{if(typeof f.compileAsync==`function`){if(C&&w){let e=f.getRenderTarget();f.setRenderTarget(C),await f.compileAsync(m,h),f.setRenderTarget(null),await f.compileAsync(w,h),f.setRenderTarget(e)}else await f.compileAsync(m,h)}},O=new e;return{material:x,video:g,scene:m,camera:h,compileAsync:D,render:()=>{if(b.uTime.value=O.getElapsedTime(),C&&w){let e=f.getRenderTarget();f.setRenderTarget(C),f.render(m,h),f.setRenderTarget(e),f.render(w,h)}else f.render(m,h)},setPuntero:(e,t)=>{b.uPuntero.value.set(e,1-t)},setPulso:e=>{b.uPulso.value=e},setIntensidad:e=>{b.uIntensidad.value=e},getIntensidad:()=>b.uIntensidad.value,setEntrada:e=>{b.uEntrada.value=e},setNoche:e=>{b.uNoche.value=e},resize:(e,t)=>{b.uResolucion.value.set(e,t),C&&C.setSize(Math.max(1,Math.round(e)),Math.max(1,Math.round(t)))},destroy:()=>{g.pause(),g.remove(),x.dispose(),S.geometry.dispose(),y.dispose(),C&&C.dispose(),T&&T.dispose(),E&&E.geometry.dispose()}}}export{f as crearFondoVivo};