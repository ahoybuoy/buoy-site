uniform vec3 uGround, uInk, uMist, uLine;
void main(){
  vec2 p = px();
  float sy = surfaceY(p.x);
  float d = p.y - sy;
  float aa = 1.0 / uDpr;
  float t = uT;
  // soft light above the line (a breath of haze), water body below
  float below = smoothstep(-aa, aa, d);
  vec2 q = vec2(p.x * 0.0042, d * 0.0062);
  // domain-warped fbm (warp of a warp); plumes rise slowly while the field drifts with the swell
  vec2 a = vec2(fbm(q + vec2(0.0, t*0.05)), fbm(q + vec2(5.2, 1.3) - vec2(t*0.04, 0.0)));
  vec2 b = vec2(fbm(q + 3.0*a + vec2(1.7, 9.2) + t*0.07), fbm(q + 3.0*a + vec2(8.3, 2.8) - t*0.06));
  float ink = fbm(q + 3.2*b + vec2(t*0.03, t*0.09));
  float plume = smoothstep(0.38, 0.85, ink);
  float wisps = smoothstep(0.55, 0.95, length(b)*0.8) * smoothstep(0.3, 0.7, ink);
  float fallOff = exp(-d / max(60.0, (uRes.y - uWaterY) * 0.7));
  vec3 col = uGround * (1.0 + 0.4*fallOff);
  col = mix(col, uInk, plume*0.75);
  col = mix(col, uMist, wisps*0.35*(0.5 + 0.5*fallOff));
  // subsurface glow under the line
  col += uMist * 0.07 * exp(-d/40.0);
  float line = smoothstep(1.4, 0.0, abs(d)) * 0.85 + smoothstep(10.0, 0.0, abs(d)) * 0.12;
  float alpha = below * (0.94) ;
  vec3 outc = col * alpha;
  gl_FragColor = vec4(outc, alpha);
}
