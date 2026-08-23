#!/usr/bin/env python3
"""
Download YouTube music-video sources and cut [start, end) segments (lrnz26 game C).

Timestamps in the manifest accept whole or fractional seconds, e.g.:
  115.5 | 1:55.5 | 0:01:55.500  (M:SS, MM:SS, H:MM:SS; ms precision)

Requires on PATH: yt-dlp, ffmpeg

  python3 scripts/lrnz26/extract_c.py
  python3 scripts/lrnz26/extract_c.py --manifest src/routes/lrnz26/c/manifest.json --out-dir static/lrnz26/c
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def parse_timestamp(raw: str) -> float:
	"""Parse seconds, M:SS, MM:SS, or H:MM:SS (fractional seconds allowed)."""
	s = raw.strip()
	if not s:
		raise ValueError("empty timestamp")
	if ":" not in s:
		return float(s)
	parts = s.split(":")
	if len(parts) > 3:
		raise ValueError(f"invalid timestamp: {raw!r}")
	try:
		nums = [float(p) for p in parts]
	except ValueError as e:
		raise ValueError(f"invalid timestamp: {raw!r}") from e
	if len(nums) == 1:
		return nums[0]
	if len(nums) == 2:
		minutes, seconds = nums
		if seconds < 0 or seconds >= 60:
			raise ValueError(f"invalid timestamp (seconds 0–59): {raw!r}")
		return minutes * 60 + seconds
	if len(nums) == 3:
		hours, minutes, seconds = nums
		if minutes < 0 or minutes >= 60 or seconds < 0 or seconds >= 60:
			raise ValueError(f"invalid timestamp (minutes/seconds 0–59): {raw!r}")
		return hours * 3600 + minutes * 60 + seconds
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


def download_video(url: str, dest_dir: Path, force: bool) -> Path:
	dest_dir.mkdir(parents=True, exist_ok=True)
	vid = video_id_from_url(url)
	out_tmpl = str(dest_dir / f"{vid}.%(ext)s")
	candidates = list(dest_dir.glob(f"{vid}.*"))
	video_like = [p for p in candidates if p.suffix.lower() in {".mp4", ".mkv", ".webm"}]
	if video_like and not force:
		return video_like[0]

	run(
		[
			"yt-dlp",
			"--no-playlist",
			"--js-runtimes",
			"node",
			"--remote-components",
			"ejs:github",
			"-f",
			"bv*+ba/b",
			"--merge-output-format",
			"mp4",
			"-o",
			out_tmpl,
			url,
		]
	)
	video_like = [p for p in dest_dir.glob(f"{vid}.*") if p.suffix.lower() in {".mp4", ".mkv", ".webm"}]
	if not video_like:
		sys.stderr.write(f"yt-dlp finished but no video file found for id {vid}\n")
		sys.exit(1)
	return video_like[0]


def extract_segment(
	src: Path,
	out_file: Path,
	start_sec: float,
	duration_sec: float,
) -> None:
	out_file.parent.mkdir(parents=True, exist_ok=True)
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
			"-c:v",
			"libx264",
			"-preset",
			"fast",
			"-crf",
			"20",
			"-c:a",
			"aac",
			"-b:a",
			"160k",
			"-movflags",
			"+faststart",
			str(out_file),
		]
	)


def extract_poster(out_mp4: Path, poster_file: Path) -> None:
	"""First-frame JPEG for level-1 still (iOS Safari won't paint a paused video)."""
	poster_file.parent.mkdir(parents=True, exist_ok=True)
	run(
		[
			"ffmpeg",
			"-hide_banner",
			"-loglevel",
			"warning",
			"-y",
			"-i",
			str(out_mp4),
			"-vframes",
			"1",
			"-q:v",
			"2",
			str(poster_file),
		]
	)


def main() -> None:
	root = Path(__file__).resolve().parents[2]
	default_manifest = root / "src" / "routes" / "lrnz26" / "c" / "manifest.json"
	parser = argparse.ArgumentParser(description="Cut music-video clips from YouTube URLs (lrnz26 C).")
	parser.add_argument(
		"--manifest",
		type=Path,
		default=default_manifest,
		help="JSON manifest path",
	)
	parser.add_argument(
		"--out-dir",
		type=Path,
		default=root / "static" / "lrnz26" / "c",
		help="Directory for output .mp4 segments",
	)
	parser.add_argument(
		"--cache-dir",
		type=Path,
		default=root / ".cache" / "lrnz26",
		help="Directory for full yt-dlp downloads (reused across runs)",
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
	clips = data.get("clips")
	if not isinstance(clips, list):
		sys.stderr.write('manifest must contain a "clips" array\n')
		sys.exit(1)

	entries = list(clips)
	alternates = data.get("alternates")
	if isinstance(alternates, list):
		entries.extend(alternates)

	for entry in entries:
		url = entry["url"]
		if "PLACEHOLDER" in url:
			print(f"=== {entry['id']}: skipped (placeholder URL) ===")
			continue
		cid = entry["id"]
		start = parse_timestamp(str(entry["start"]))
		end = parse_timestamp(str(entry["end"]))
		if end <= start:
			sys.stderr.write(f"[{cid}] end must be after start ({start=} {end=})\n")
			sys.exit(1)
		duration = end - start

		print(f"=== {cid}: {entry.get('band', '')} ({entry['start']}–{entry['end']}, {duration:.3f}s) ===")
		src = download_video(url, args.cache_dir, args.force_download)
		out_mp4 = args.out_dir / f"{cid}.mp4"
		print(f"  source: {src.name}")
		print(f"  -> {out_mp4.relative_to(root)}")
		extract_segment(src, out_mp4, start, duration)
		poster = args.out_dir / f"{cid}-poster.jpg"
		print(f"  -> {poster.relative_to(root)}")
		extract_poster(out_mp4, poster)

	print("Done.")


if __name__ == "__main__":
	main()
