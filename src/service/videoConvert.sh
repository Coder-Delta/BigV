#!/usr/bin/env bash
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

INPUT_REL="$1"
[ -n "$INPUT_REL" ] || { echo "Usage: $0 <project-relative-input-path>"; exit 1; }

PROJECT_ROOT="$BASE_DIR/../.."

INPUT="$PROJECT_ROOT/$INPUT_REL"
OUTDIR="$PROJECT_ROOT/public/output"

FILENAME="$(basename "$INPUT")"
BASENAME="${FILENAME%.*}"

mkdir -p "$OUTDIR"

[ -f "$INPUT" ] || { echo "Input not found: $INPUT"; exit 1; }

VIDEO_CODEC="libx264"
AUDIO_CODEC="aac"
GOP="keyint=24:min-keyint=24:no-scenecut"

PROFILES=(
  "1080|4500k|4500k|6000k|192k|48000|2"
  "720|1500k|1500k|1000k|128k|48000|2"
  "540|800k|800k|500k|96k|44100|2"
  "360|400k|400k|400k|64k|22050|2"
  "144|120k|120k|120k|32k|16000|1"
)

for PROFILE in "${PROFILES[@]}"; do
  IFS="|" read -r RES VB MAXR BUF AB AR AC <<< "$PROFILE"

  ffmpeg -y -i "$INPUT" \
    -c:v "$VIDEO_CODEC" -x264opts "$GOP" \
    -b:v "$VB" -maxrate "$MAXR" -bufsize "$BUF" \
    -vf "scale=trunc(iw*${RES}/ih/2)*2:trunc(${RES}/2)*2" \
    -c:a "$AUDIO_CODEC" -ac "$AC" -ab "$AB" -ar "$AR" \
    -movflags +faststart \
    "$OUTDIR/${BASENAME}_${RES}.mp4"
done
