#!/usr/bin/env bash
# CTFd asks for "<name>.min.css" / "<name>.min.js" unless it runs in debug mode,
# so every hand-written asset needs a .min twin. These are plain copies (not
# minified, and not symlinks, so the theme also works from a Windows checkout).
# Run this after editing anything in static/duca/.
set -euo pipefail
cd "$(dirname "$0")/static/duca"
for f in duca.css duca.js landing.css landing.js fonts/fonts.css; do
  cp -f "$f" "${f%.*}.min.${f##*.}"
done
echo "synced .min copies"
