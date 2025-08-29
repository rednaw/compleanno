#!/bin/bash

# Usage: ./make_fragments.sh VIDEO_ID SONG_NUMBER
# Example: ./make_fragments.sh WEQnzs8wl6E 1

VIDEO_ID="$1"
SONG_NUMBER="$2"
DEST_DIR="static/lrnz25"

if [ -z "$VIDEO_ID" ] || [ -z "$SONG_NUMBER" ]; then
  echo "Usage: $0 VIDEO_ID SONG_NUMBER"
  exit 1
fi

mkdir -p "$DEST_DIR"

# Download and extract audio as mp3
yt-dlp -x --audio-format mp3 -o "$DEST_DIR/%(title)s [%(id)s].%(ext)s" "https://www.youtube.com/watch?v=$VIDEO_ID"

# Find the downloaded mp3 file (match literal brackets)
MP3_FILE=$(find "$DEST_DIR" -type f -name "*\[$VIDEO_ID\].mp3" | head -n1)

if [ ! -f "$MP3_FILE" ]; then
  echo "Error: MP3 file not found."
  exit 2
fi

BASENAME="$DEST_DIR/song${SONG_NUMBER}_"

for DURATION in 1 2 5 20; do
  ffmpeg -y -i "$MP3_FILE" -ss 0 -t $DURATION -acodec copy "${BASENAME}${DURATION}.mp3"
done

# Remove the original full mp3
rm -f "$MP3_FILE"

echo "Fragments created: ${BASENAME}5.mp3, ${BASENAME}10.mp3, ${BASENAME}15.mp3" 