#!/bin/sh
# Render assets/og-card.svg to public/og-card.png using the project's own Inter,
# so no system font install is needed. Requires rsvg-convert and woff2_decompress.
set -eu
cd "$(dirname "$0")/.."

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# rsvg-convert can't draw glyphs from WOFF2, so convert Inter to TTF first.
cp node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2 "$tmp/inter.woff2"
woff2_decompress "$tmp/inter.woff2"
rm "$tmp/inter.woff2"

cat > "$tmp/fonts.conf" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig><dir>$tmp</dir><cachedir>$tmp/cache</cachedir></fontconfig>
EOF

FONTCONFIG_FILE="$tmp/fonts.conf" rsvg-convert -w 1200 -h 630 assets/og-card.svg -o public/og-card.png
echo "Rendered public/og-card.png"
