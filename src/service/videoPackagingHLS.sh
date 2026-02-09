#!/usr/bin/env bash
set -e

export MSYS_NO_PATHCONV=1

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

INPUT_DIR="public/output"
OUT_DIR="public/output/hls"

BASENAME="${1:-sample}"

RESOLUTIONS=(1080 720 540 360 144)

mkdir -p "$ROOT_DIR/$OUT_DIR"

command -v docker >/dev/null 2>&1 || { echo "Docker not found"; exit 1; }

AVAILABLE_RES=()

for RES in "${RESOLUTIONS[@]}"; do
  FILE="$ROOT_DIR/$INPUT_DIR/${BASENAME}_${RES}.mp4"
  if [ -s "$FILE" ]; then
    AVAILABLE_RES+=("$RES")
  fi
done

[ "${#AVAILABLE_RES[@]}" -gt 0 ] || { echo "No valid renditions found"; exit 1; }

AUDIO_RES="${AVAILABLE_RES[0]}"

CMD=(
  docker run --rm
  -v "$ROOT_DIR":/work
  -w /work
  --entrypoint packager
  google/shaka-packager
)

CMD+=(
  in=/work/$INPUT_DIR/${BASENAME}_${AUDIO_RES}.mp4,stream=audio,segment_template=/work/$OUT_DIR/audio_\$Number\$.aac,playlist_name=audio.m3u8,hls_group_id=audio,hls_name=English
)

for RES in "${AVAILABLE_RES[@]}"; do
  CMD+=(
    in=/work/$INPUT_DIR/${BASENAME}_${RES}.mp4,stream=video,segment_template=/work/$OUT_DIR/${RES}p_\$Number\$.ts,playlist_name=video_${RES}.m3u8,iframe_playlist_name=iframe_${RES}.m3u8
  )
done

CMD+=(
  --hls_master_playlist_output /work/$OUT_DIR/master.m3u8
  --segment_duration 3
  --single_threaded
)

"${CMD[@]}"
