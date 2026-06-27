#!/bin/bash
set -euo pipefail

PKG_NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"
VSIX="${PKG_NAME}-${VERSION}.vsix"

echo "===== CC LOCAL VSIX INSTALL ====="
echo "PKG_NAME: $PKG_NAME"
echo "VERSION:  $VERSION"
echo "VSIX:     $VSIX"
echo

if [ ! -f "$VSIX" ]; then
  echo "VSIX non trovato, genero package..."
  npm run pack:vsix
fi

code --install-extension "$VSIX" --force
