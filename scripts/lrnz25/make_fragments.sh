#!/usr/bin/env bash
set -euo pipefail

# Build lrnz25 music puzzle fragments (1s, 2s, 5s, 20s from t=0).
# Requires: yt-dlp, ffmpeg
#
# Usage: scripts/lrnz25/make_fragments.sh VIDEO_ID SONG_NUMBER
# Example: scripts/lrnz25/make_fragments.sh WEQnzs8wl6E 1

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST_DIR="$REPO_ROOT/static/lrnz25"

VIDEO_ID="${1:-}"
SONG_NUMBER="${2:-}"

if [ -z "$VIDEO_ID" ] || [ -z "$SONG_NUMBER" ]; then
	echo "Usage: $0 VIDEO_ID SONG_NUMBER" >&2
	exit 1
fi

mkdir -p "$DEST_DIR"

yt-dlp -x --audio-format mp3 -o "$DEST_DIR/%(title)s [%(id)s].%(ext)s" "https://www.youtube.com/watch?v=$VIDEO_ID"

MP3_FILE=$(find "$DEST_DIR" -type f -name "*\[$VIDEO_ID\].mp3" | head -n1)

if [ ! -f "$MP3_FILE" ]; then
	echo "Error: MP3 file not found." >&2
	exit 2
fi

BASENAME="$DEST_DIR/song${SONG_NUMBER}_"

for DURATION in 1 2 5 20; do
	ffmpeg -y -i "$MP3_FILE" -ss 0 -t "$DURATION" -acodec copy "${BASENAME}${DURATION}.mp3"
done

rm -f "$MP3_FILE"

echo "Fragments created: ${BASENAME}1.mp3, ${BASENAME}2.mp3, ${BASENAME}5.mp3, ${BASENAME}20.mp3"
