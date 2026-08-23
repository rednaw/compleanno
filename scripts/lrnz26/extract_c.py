#!/usr/bin/env python3
"""
Download YouTube music-video sources and cut 2s [start, end) segments (lrnz26 game C).

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

		print(f"=== {cid}: {entry.get('band', '')} ({duration:.2f}s) ===")
		src = download_video(url, args.cache_dir, args.force_download)
		out_mp4 = args.out_dir / f"{cid}.mp4"
		print(f"  source: {src.name}")
		print(f"  -> {out_mp4.relative_to(root)}")
		extract_segment(src, out_mp4, start, duration)

	print("Done.")


if __name__ == "__main__":
	main()
