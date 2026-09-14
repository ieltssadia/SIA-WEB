#!/usr/bin/env python3
"""Gilded Court restoration sweep — emerald/forest LabAcademy → charcoal/ivory/gold/jewel.
Lightness-preserving-ish MAP applied with re.sub IGNORECASE across src/components.
Payment brand colors (bKash/Nagad/Rocket/Sonali/Cash teal) deliberately NOT in map.
"""
import re, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project/src/components")

HEX_MAP = {
    # ── dark forest surfaces → charcoal lacquer ladder ──
    "#071b14": "#0f0d08",
    "#0a241b": "#121009",
    "#10231b": "#17140d",
    "#0b2e22": "#15120b",
    "#0c2e23": "#16130c",
    "#0d3126": "#18150e",
    "#123a2b": "#1d1810",
    "#114430": "#211b10",
    "#1d382c": "#332b1a",
    "#244234": "#3e341f",
    "#2a4a3c": "#3a321e",
    "#101613": "#1e1b14",
    "#0b1a14": "#131007",
    "#16302560": "#2a241560",
    "#16332780": "#2e271580",
    # ── mint/sage text on dark bands → ivory / gold-sand / gold ──
    "#eaf4ee": "#f6ecd4",
    "#e9f2ec": "#efe6cc",
    "#e2efe6": "#ece2c6",
    "#cfe4d8": "#e4d5ae",
    "#bfe6d4": "#e4d5ae",
    "#a9c6b6": "#c6b995",
    "#7fa091": "#a3977b",
    "#8fa89b": "#a2977a",
    "#8fb3a2": "#b3a787",
    "#5fce9e": "#d9b75c",
    "#63d6a4": "#d9b75c",
    "#2fbf8a": "#c8a04a",
    # ── emerald accents → charcoal / jade / gold ──
    "#0e8a5f": "#2e7d5b",
    "#0e6b4f": "#262012",
    "#0a5a41": "#7a5a16",
    # ── pastel inks → Gilded Court jewel inks ──
    "#2c4a12": "#1f5c40",
    "#5a2410": "#7a4c12",
    "#16324f": "#2c4f8a",
    "#b9d96a": "#d9b75c",
    "#a8d96a": "#cfe4d4",
    "#c9e87f": "#cfe4d4",
    "#aecdf2": "#d5dff0",
    "#f6d98a": "#f3e3ba",
    "#e8c46e": "#e8d296",
    "#f58a52": "#c47a26",
    "#f08c8c": "#d98487",
    # ── LabAcademy warm-gray leftovers → ivory canvas family ──
    "#f1f0ea": "#f6f1e4",
    "#e9e8e0": "#ede5cf",
    "#e4e4da": "#e6dcc3",
    "#f1f2ea": "#f2ecda",
    "#ecefe6": "#efe7d1",
    "#5b6a60": "#6d6449",
    "#d7dbcc": "#ddd2b5",
    "#c8c9ba": "#d4c8a8",
    # ── amber/orange chart accents → gold family ──
    "#e8a33d": "#c8a04a",
    "#f0b254": "#d9b75c",
    "#e2705a": "#c46a7a",
    "#7c6bd6": "#a58ec7",
}

# Tailwind emerald-*/lime-*/teal-* → muted jewel-jade shades (opacity modifiers
# survive: bg-emerald-700/10 → bg-[#225941]/10). Payment-brand hexes untouched.
CLASS_MAP = {
    "emerald-50": "[#e8f0ea]",
    "emerald-100": "[#d7e7dd]",
    "emerald-200": "[#b5d4c4]",
    "emerald-300": "[#8abba2]",
    "emerald-400": "[#529b78]",
    "emerald-500": "[#2e7d5b]",
    "emerald-600": "[#28694d]",
    "emerald-700": "[#225941]",
    "emerald-800": "[#1c4835]",
    "emerald-900": "[#163a2a]",
    "lime-50": "[#f2efdc]",
    "lime-100": "[#e8e6c4]",
    "lime-200": "[#d9d69f]",
    "lime-300": "[#c6c377]",
    "lime-400": "[#adaa55]",
    "lime-500": "[#8f8c3e]",
    "lime-600": "[#757233]",
    "lime-700": "[#5c5a2a]",
    "lime-800": "[#454321]",
    "lime-900": "[#302f18]",
    "teal-50": "[#e6f0ec]",
    "teal-100": "[#cfe4db]",
    "teal-200": "[#a9d0c0]",
    "teal-300": "[#7bb8a2]",
    "teal-400": "[#4d9c82]",
    "teal-500": "[#2e7d5b]",
    "teal-600": "[#27694d]",
    "teal-700": "[#215941]",
    "teal-800": "[#1b4835]",
    "teal-900": "[#163a2a]",
}

changed = collections.Counter()
for path in sorted(ROOT.rglob("*.tsx")) + sorted(ROOT.rglob("*.ts")):
    text = path.read_text(encoding="utf-8")
    orig = text
    for old, new in HEX_MAP.items():
        n = len(re.findall(re.escape(old), text, flags=re.IGNORECASE))
        if n:
            text = re.sub(re.escape(old), new, text, flags=re.IGNORECASE)
            changed[str(path.relative_to(ROOT.parent.parent))] += n
    for old, new in CLASS_MAP.items():
        n = len(re.findall(rf"(?<!\w){re.escape(old)}(?![\w-])", text))
        if n:
            text = re.sub(rf"(?<!\w){re.escape(old)}(?![\w-])", new, text)
            changed[str(path.relative_to(ROOT.parent.parent))] += n
    if text != orig:
        path.write_text(text, encoding="utf-8")

total = sum(changed.values())
for f, n in sorted(changed.items(), key=lambda kv: -kv[1]):
    print(f"{n:4d}  {f}")
print(f"TOTAL: {total} replacements in {len(changed)} files")
