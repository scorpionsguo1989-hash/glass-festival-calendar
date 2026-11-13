export const EFFECTS = {
  snow: { label: "飘雪", accent: "140 185 255", sheen: "134 176 236" },
  fireworks: { label: "金色烟花", accent: "255 176 72", sheen: "248 165 76" },
  lanterns: { label: "红灯笼", accent: "255 104 61", sheen: "255 113 77" },
  hearts: { label: "心形光点", accent: "255 130 171", sheen: "251 123 169" },
  petals: { label: "花瓣雨", accent: "249 167 162", sheen: "250 176 173" },
  starlight: { label: "流星与星光", accent: "145 200 255", sheen: "120 175 249" },
  birthday: { label: "气球和彩纸", accent: "196 159 255", sheen: "194 153 255" },
  ripples: { label: "碧水波纹", accent: "90 226 191", sheen: "94 213 180" },
  moon: { label: "月光与流萤", accent: "243 212 146", sheen: "237 203 140" },
  clock: { label: "新年时钟", accent: "255 206 141", sheen: "240 183 116", glow: ["#675334", "#393146", "#222645"] },
  crackers: { label: "爆竹金屑", accent: "255 122 74", sheen: "255 147 87", glow: ["#71382b", "#401917", "#331f2d"] },
  riddles: { label: "灯谜彩笺", accent: "239 184 143", sheen: "224 166 162", glow: ["#57405e", "#372538", "#302142"] },
  rain: { label: "斜雨青叶", accent: "145 203 181", sheen: "144 203 196", glow: ["#3b5557", "#243b44", "#132d35"] },
  sparks: { label: "锻火流金", accent: "244 159 95", sheen: "229 152 115", glow: ["#533f35", "#333344", "#222a3f"] },
  kites: { label: "纸鸢游风", accent: "159 216 235", sheen: "165 213 235", glow: ["#34566f", "#24425e", "#1a3048"] },
  magpies: { label: "鹊桥星河", accent: "196 167 255", sheen: "183 151 241", glow: ["#514377", "#302953", "#262147"] },
  silk: { label: "红绸金辉", accent: "255 124 99", sheen: "255 138 105", glow: ["#7c302f", "#4c1c25", "#321827"] },
  chrysanthemums: { label: "秋菊舒展", accent: "251 192 114", sheen: "224 180 122", glow: ["#5d4a2e", "#3e3128", "#302632"] },
  frost: { label: "霜花凝结", accent: "171 199 246", sheen: "163 185 249", glow: ["#384766", "#253250", "#1c2343"] },
  idle: { label: "青色流光", accent: "70 200 215", sheen: "85 183 197" },
};

export function sceneColors(scene) {
  const { accent, sheen } = EFFECTS[scene];
  return { "--selected": accent, "--sheen": sheen };
}

export function auraColors(scene) {
  const glow = EFFECTS[scene].glow;
  return glow && { "--sky-center": glow[0], "--sky-middle": glow[1], "--sky-lower": glow[2] };
}
