#!/usr/bin/env python3
"""
Game B (cacophony): download YouTube audio, cut [start, end), loudnorm, write MP3.

Requires on PATH: yt-dlp, ffmpeg (with libmp3lame)

  python3 scripts/gcm26/extract_b.py
  python3 scripts/gcm26/extract_b.py --manifest src/routes/gcm26/b/manifest.json --out-dir static/gcm26/b
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

# Files we reuse from cache after yt-dlp (audio-only *or* video+audio — ffmpeg uses -vn).
CACHE_MEDIA_SUFFIXES = frozenset(
	{".m4a", ".opus", ".webm", ".mp3", ".ogg", ".aac", ".flac", ".wav", ".mp4", ".mkv"}
)


def parse_timestamp(raw: str) -> float:
	"""Parse M:SS, MM:SS, or H:MM:SS into seconds."""
	s = raw.strip()
	if not s:
		raise ValueError("empty timestamp")
	parts = s.split(":")
	nums = [int(p, 10) for p in parts]
	if len(nums) == 1:
		return float(nums[0])
	if len(nums) == 2:
		return nums[0] * 60 + nums[1]
	if len(nums) == 3:
		return nums[0] * 3600 + nums[1] * 60 + nums[2]
	raise ValueError(f"invalid timestamp: {raw!r}")


def video_id_from_url(url: str) -> str:
	m = re.search(r"(?:v=|/shorts/|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
	if m:
		return m.group(1)
	raise ValueError(f"could not parse YouTube video id from {url!r}")


def run(cmd: list[str]) -> None:
	r = subprocess.run(cmd, check=False)
	if r.returncode != 0:
		sys.stderr.write(f"command failed ({r.returncode}): {' '.join(cmd)}\n")
		sys.exit(r.returncode)


def ensure_binary(name: str) -> None:
	from shutil import which

	if which(name) is None:
		sys.stderr.write(f"missing `{name}` on PATH (install yt-dlp / ffmpeg)\n")
		sys.exit(1)


def download_best_audio(url: str, dest_dir: Path, force: bool) -> Path:
	dest_dir.mkdir(parents=True, exist_ok=True)
	vid = video_id_from_url(url)
	candidates = [p for p in dest_dir.glob(f"{vid}.*") if p.suffix.lower() in CACHE_MEDIA_SUFFIXES]
	if candidates and not force:
		return candidates[0]

	out_tmpl = str(dest_dir / f"{vid}.%(ext)s")
	run(
		[
			"yt-dlp",
			"--no-playlist",
			"--js-runtimes",
			"node",
			"--remote-components",
			"ejs:github",
			"--extractor-args",
			"youtube:player_client=web",
			# Prefer audio-only; may fall back to progressive mp4 (e.g. format 18) — ffmpeg still extracts with -vn.
			"-f",
			"ba/bestaudio/best",
			"-o",
			out_tmpl,
			url,
		]
	)
	candidates = [p for p in dest_dir.glob(f"{vid}.*") if p.suffix.lower() in CACHE_MEDIA_SUFFIXES]
	if not candidates:
		sys.stderr.write(f"yt-dlp finished but no cached media file found for id {vid}\n")
		sys.exit(1)
	return candidates[0]


def extract_audio_segment_norm_mp3(
	src: Path,
	out_mp3: Path,
	start_sec: float,
	duration_sec: float,
) -> None:
	out_mp3.parent.mkdir(parents=True, exist_ok=True)
	# -ss after -i: accurate cuts. loudnorm: comparable loudness across tracks for the mashup.
	run(
		[
			"ffmpeg",
			"-hide_banner",
			"-loglevel",
			"warning",
			"-y",
			"-i",
			str(src),
			"-ss",
			f"{start_sec:.3f}",
			"-t",
			f"{duration_sec:.3f}",
			"-af",
			"loudnorm=I=-14:TP=-1.5:LRA=11",
			"-vn",
			"-c:a",
			"libmp3lame",
			"-b:a",
			"192k",
			str(out_mp3),
		]
	)


def main() -> None:
	root = Path(__file__).resolve().parents[2]
	default_manifest = root / "src" / "routes" / "gcm26" / "b" / "manifest.json"
	parser = argparse.ArgumentParser(description="Cut normalized MP3 loops for gcm26 game B (manifest tracks).")
	parser.add_argument(
		"--manifest",
		type=Path,
		default=default_manifest,
		help="JSON manifest path (expects a 'tracks' array)",
	)
	parser.add_argument(
		"--out-dir",
		type=Path,
		default=root / "static" / "gcm26" / "b",
		help="Directory for output .mp3 files",
	)
	parser.add_argument(
		"--cache-dir",
		type=Path,
		default=root / ".cache" / "gcm26" / "b",
		help="Directory for full yt-dlp audio downloads (reused across runs)",
	)
	parser.add_argument(
		"--force-download",
		action="store_true",
		help="Re-download even if a cached file exists",
	)
	args = parser.parse_args()

	ensure_binary("yt-dlp")
	ensure_binary("ffmpeg")

	data = json.loads(args.manifest.read_text(encoding="utf-8"))
	tracks = data.get("tracks")
	if not isinstance(tracks, list):
		sys.stderr.write('manifest must contain a "tracks" array\n')
		sys.exit(1)

	for entry in tracks:
		tid = entry["id"]
		url = entry["url"]
		start = parse_timestamp(str(entry["start"]))
		end = parse_timestamp(str(entry["end"]))
		if end <= start:
			sys.stderr.write(f"[{tid}] end must be after start ({start=} {end=})\n")
			sys.exit(1)
		duration = end - start

		print(f"=== {tid}: {entry.get('title', '')} ({duration:.2f}s) ===")
		src = download_best_audio(url, args.cache_dir, args.force_download)
		out_mp3 = args.out_dir / f"{tid}.mp3"
		print(f"  source: {src.name}")
		print(f"  -> {out_mp3.relative_to(root)}")
		extract_audio_segment_norm_mp3(src, out_mp3, start, duration)

	print("Done.")


if __name__ == "__main__":
	main()
