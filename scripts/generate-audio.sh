#!/usr/bin/env bash
# Generate original, royalty-free placeholder audio for the Demo composition.
# music.wav: 10s 120 BPM kick + low/mid C-major ostinato (energy stays below ~800 Hz).
# sync-hit.wav: 200ms 2 kHz ping, placed at frame 150 (5.00s) to verify A/V sync.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/public"

ffmpeg -y -f lavfi -i "aevalsrc=0.62*sin(2*PI*55*t)*exp(-16*mod(t\,0.5))+0.20*sin(2*PI*130.81*t)*(0.45+0.55*sin(2*PI*t))+0.16*sin(2*PI*196*t)+0.11*sin(2*PI*261.63*t)*max(0\,sin(2*PI*2*t)):s=44100:d=10,afade=t=in:st=0:d=0.15,afade=t=out:st=9.4:d=0.6" \
  -ac 2 -c:a pcm_s16le "$ROOT/public/music.wav"

ffmpeg -y -f lavfi -i "aevalsrc=0.95*sin(2*PI*2000*t)*exp(-14*t):s=44100:d=0.2" \
  -ac 2 -c:a pcm_s16le "$ROOT/public/sync-hit.wav"

echo "Wrote $ROOT/public/music.wav and $ROOT/public/sync-hit.wav"
