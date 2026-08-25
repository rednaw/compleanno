#!/usr/bin/env bash
# Styled GPS coordinate cards for lrnz26 puzzle rewards (hub + code ordering thumbs).
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

echo "Wrote coordinate cards to $OUT"
