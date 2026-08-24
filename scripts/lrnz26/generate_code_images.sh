#!/usr/bin/env bash
# Styled GPS coordinate cards for lrnz26/code rewards.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/static/lrnz26/code"
mkdir -p "$OUT"

render_card() {
	local file="$1"
	local lat="$2"
	local lon="$3"
	local accent="$4"

	convert -size 512x512 \
		"gradient:${accent}-#111827" \
		-fill '#ffffff22' -draw "roundrectangle 24,24 488,488 28,28" \
		-fill '#dbeafe' -gravity Center -pointsize 38 -font DejaVu-Sans-Mono-Bold \
		-annotate +0-18 "$lat" \
		-fill '#dbeafe' -gravity Center -pointsize 38 -font DejaVu-Sans-Mono-Bold \
		-annotate +0+34 "$lon" \
		"$OUT/$file"
}

render_card "van-ostade.webp" "52.3521° N" "4.8906° E" "#1e3a5f"
render_card "darlingstraat.webp" "52.3209° N" "4.9532° E" "#1e3a5f"
render_card "castillejos.webp" "41.4082° N" "2.1763° E" "#7c2d12"
render_card "termini.webp" "52.4023° N" "4.9317° E" "#1e3a5f"

convert -size 512x512 gradient:'#0f172a-#1e293b' \
	-fill '#ffffff' -gravity North -pointsize 24 -font DejaVu-Sans-Bold \
	-annotate +0+36 "In ordine" \
	-fill '#dbeafe' -gravity Center -pointsize 17 -font DejaVu-Sans-Mono \
	-annotate +0-90 "1  41.4082, 2.1763" \
	-annotate +0-50 "2  52.4023, 4.9317" \
	-annotate +0-10 "3  52.3209, 4.9532" \
	-annotate +0+30 "4  52.3521, 4.8906" \
	"$OUT/all-homes.webp"

echo "Wrote images to $OUT"
