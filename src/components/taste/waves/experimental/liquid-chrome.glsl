uniform vec3 uGround, uSky, uHorizon, uBuoy;
float field(vec2 q, float t){
  return 0.55*sin(q.x*1.25 + t*0.7 + 1.6*sin(q.y*1.5 - t*0.45))
       + 0.35*sin(q.y*2.2 + q.x*0.6 - t*0.55 + 1.2*sin(q.x*0.8 + t*0.35))
       + 0.22*sin(q.x*0.45 - q.y*1.1 + t*0.4 + 2.0*vnoise(q*0.35 + t*0.05));
}
vec3 env(vec3 r){
  // r.y < 0 looks up (screen up). Studio-like bands: dark ground, bright horizon strip, sky.
  float y = r.y;
  vec3 c = mix(uGround*0.6, uGround*1.4, smoothstep(0.9, 0.1, y));
  c = mix(c, uSky*0.75, smoothstep(0.05, -0.25, y));
  c = mix(c, uGround*1.1, smoothstep(-0.55, -0.9, y));
  float strip = smoothstep(0.07, 0.0, abs(y + 0.12)) ;
  c = mix(c, uHorizon, strip*0.95);
  float strip2 = smoothstep(0.035, 0.0, abs(y - 0.32));
  c += uSky*0.35*strip2;
  // a single small warm light off to the side (the boat's orange, reflected)
  float warm = smoothstep(0.11, 0.0, length(vec2(r.x - 0.62, y + 0.38)*vec2(1.0, 2.2)));
  c = mix(c, uBuoy, warm*0.85);
  return c;
}
void main(){
  vec2 p = px();
  float sy = surfaceY(p.x);
  float d = p.y - sy;
  float aa = 1.0 / uDpr;
  float inside = smoothstep(-aa, aa, d);
  if (inside <= 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = uT;
  vec2 q = vec2(p.x, d) * vec2(0.0105, 0.016);
  float e = 0.02;
  float f0 = field(q, t);
  float gx = (field(q + vec2(e,0.), t) - f0) / e;
  float gy = (field(q + vec2(0.,e), t) - f0) / e;
  float calm = 1.0 - exp(-d/26.0);
  vec3 n = normalize(vec3(-gx*0.42*calm, -gy*0.42*calm, 1.0));
  // rolled lip: the top curls toward the sky, tilted with the swell slope
  float slope = (swell(p.x + 2.0) - swell(p.x - 2.0)) / 4.0;
  float lip = exp(-d/14.0);
  n = normalize(n + vec3(slope*1.5*lip, -2.4*lip, 0.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  vec3 col = env(r);
  float fres = pow(1.0 - max(n.z, 0.0), 2.0);
  col = mix(col*0.8, col*1.15, fres);
  // fall into the ground toward the bottom
  float depth = smoothstep(0.0, uRes.y - uWaterY + 20.0, d);
  col = mix(col, uGround, depth*0.55);
  // crisp rim
  
  gl_FragColor = vec4(col*inside, inside);
}
