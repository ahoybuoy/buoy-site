uniform vec3 uGround, uBlue, uTeal, uLine;
float band(float v, float c, float w){ float x = (v - c)/w; return exp(-x*x); }
void main(){
  vec2 p = px();
  float sy = surfaceY(p.x);
  float d = p.y - sy;
  float aa = 1.0 / uDpr;
  float t = uT;
  float below = smoothstep(-aa, aa, d);
  float H = max(60.0, uRes.y - uWaterY);
  float v = d / H;               // 0 at the line, ~1 at the bottom
  float x = p.x / max(uRes.x, 1.0);
  // ribbons follow the swell (dampened with depth) and slide sideways
  float warp = 0.08*sin(x*5.0 + t*0.35) + 0.05*sin(x*11.0 - t*0.5) + 0.06*(fbm(vec2(x*3.0 - t*0.06, t*0.05)) - 0.5);
  float vv = v + warp;
  // vertical shimmer of reflected curtains
  float streak = 0.65 + 0.35*fbm(vec2(p.x*0.018 + t*0.25, v*1.2));
  float b1 = band(vv, 0.18 + 0.05*sin(t*0.3), 0.12) * streak;
  float b2 = band(vv, 0.45 + 0.06*sin(t*0.23 + 1.0), 0.16) * (0.6 + 0.4*fbm(vec2(p.x*0.01 - t*0.2, 3.0)));
  float b3 = band(vv, 0.78, 0.2) * 0.6;
  float hue = 0.5 + 0.5*sin(x*3.2 - t*0.28 + v*2.0);
  vec3 c1 = mix(uBlue, uTeal, hue);
  vec3 c2 = mix(uTeal, uBlue, hue);
  vec3 col = uGround;
  col = mix(col, c1, b1*0.6);
  col = mix(col, c2, b2*0.45);
  col = mix(col, uBlue*0.7, b3*0.35);
  col = mix(col, uGround, smoothstep(0.6, 1.1, v)*0.5);
  // glow just under the crisp line
  col += uTeal * 0.05 * exp(-d/30.0);
  float line = smoothstep(1.2, 0.0, abs(d - 0.3));
  vec3 outc = col*below*0.97;
  // faint reflection of light above the line
  float above = (1.0 - below) * exp(d/30.0) * 0.08;
  outc += c1 * above;
  gl_FragColor = vec4(outc, max(below*0.97, above));
}
