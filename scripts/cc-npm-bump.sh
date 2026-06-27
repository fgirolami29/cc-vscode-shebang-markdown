#!/bin/bash
set -euo pipefail

BUMP="${1:-patch}"
NO_COMMIT="${NO_COMMIT:-0}"

if [ ! -f package.json ]; then
  echo "ERRORE: package.json non trovato."
  exit 1
fi

CURRENT_VERSION="$(node -p "require('./package.json').version")"
PKG_NAME="$(node -p "require('./package.json').name")"

echo "===== CC NPM BUMP ====="
echo "PKG_NAME:        $PKG_NAME"
echo "CURRENT_VERSION: $CURRENT_VERSION"
echo "BUMP:            $BUMP"
echo

BACKUP_DIR=".cc-backups/npm-bump-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -p package.json "$BACKUP_DIR/package.json"
[ -f package-lock.json ] && cp -p package-lock.json "$BACKUP_DIR/package-lock.json"

echo "Backup: $BACKUP_DIR"
echo

echo "===== VERSION UPDATE ====="
npm version "$BUMP" --no-git-tag-version

NEW_VERSION="$(node -p "require('./package.json').version")"

echo
echo "===== LOCK REFRESH ====="
npm install --package-lock-only

echo
echo "===== INSTALL SCRIPT VERSION CHECK ====="
node <<'NODE'
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const name = pkg.name;

if (!pkg.scripts) pkg.scripts = {};

pkg.scripts['install:local'] = 'bash scripts/cc-install-local.sh';
pkg.scripts['reinstall'] = 'npm run pack:vsix && npm run install:local';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

console.log(`${name}@${version}`);
NODE

echo
echo "===== GIT DIFF ====="
git diff -- package.json package-lock.json || true

if [ "$NO_COMMIT" = "1" ]; then
  echo
  echo "NO_COMMIT=1: commit saltato."
else
  echo
  echo "===== GIT COMMIT ====="
  git add package.json package-lock.json

  if ! git diff --cached --quiet; then
    git commit -m "chore: bump version to ${NEW_VERSION}"
  else
    echo "Nothing to commit."
  fi
fi

echo
echo "===== DONE ====="
echo "${PKG_NAME}: ${CURRENT_VERSION} -> ${NEW_VERSION}"
echo
echo "Next:"
echo "npm run publish"
