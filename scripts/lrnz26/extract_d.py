#!/usr/bin/env python3
"""
Game D (lrnz26): download YouTube audio, cut [start, end), loudnorm, write reversed MP3.

  {id}-reversed.mp3  — reversed clip (game audio)

Requires on PATH: yt-dlp, ffmpeg (with libmp3lame)

  python3 scripts/lrnz26/extract_d.py
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

CACHE_MEDIA_SUFFIXES = frozenset(
	{".m4a", ".opus", ".webm", ".mp3", ".ogg", ".aac", ".flac", ".wav", ".mp4", ".mkv"}
)


def parse_timestamp(raw: str) -> float:
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


def extract_forward_mp3(
	src: Path,
	out_mp3: Path,
	start_sec: float,
	duration_sec: float,
) -> None:
	out_mp3.parent.mkdir(parents=True, exist_ok=True)
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


def reverse_mp3(forward_mp3: Path, out_mp3: Path) -> None:
	"""Build reversed clip from the forward MP3 so both are guaranteed to match."""
	out_mp3.parent.mkdir(parents=True, exist_ok=True)
	run(
		[
			"ffmpeg",
			"-hide_banner",
			"-loglevel",
			"warning",
			"-y",
			"-i",
			str(forward_mp3),
			"-af",
			"areverse",
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
	default_manifest = root / "src" / "routes" / "lrnz26" / "d" / "manifest.json"
	parser = argparse.ArgumentParser(description="Cut reversed MP3 loops for lrnz26 game D.")
	parser.add_argument("--manifest", type=Path, default=default_manifest)
	parser.add_argument("--out-dir", type=Path, default=root / "static" / "lrnz26" / "d")
	parser.add_argument("--cache-dir", type=Path, default=root / ".cache" / "gcm26" / "b")
	parser.add_argument("--force-download", action="store_true")
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
		print(f"  source: {src.name}")

		reversed_mp3 = args.out_dir / f"{tid}-reversed.mp3"
		print(f"  -> {reversed_mp3.relative_to(root)}")
		with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
			tmp_path = Path(tmp.name)
		try:
			extract_forward_mp3(src, tmp_path, start, duration)
			reverse_mp3(tmp_path, reversed_mp3)
		finally:
			tmp_path.unlink(missing_ok=True)

	print("Done.")


if __name__ == "__main__":
	main()
