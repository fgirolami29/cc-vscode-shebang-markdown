#!/bin/bash
set -euo pipefail

PKG_NAME="${PKG_NAME:-$(node -p "require('./package.json').name")}"
VERSION="${VERSION:-$(node -p "require('./package.json').version")}"
REMOTE_NAME="${REMOTE_NAME:-origin}"

PUBLISH_NEEDED=1
PUBLISH_OK=0
NPM_AUTH_OK=0
NPM_USER=""

echo "===== PACKAGE META ====="
echo "PKG_NAME: $PKG_NAME"
echo "VERSION:  $VERSION"
echo

echo "===== NPM AUTH CHECK ====="
if NPM_USER="$(npm whoami 2>/dev/null)"; then
  NPM_AUTH_OK=1
  echo "NPM_USER: $NPM_USER"
else
  NPM_AUTH_OK=0
  echo "WARN: npm non è loggato oppure la sessione è scaduta."
  echo "      Esegui: npm login"
  echo "      Publish e tag verranno saltati, ma build/commit continuano."
fi

echo
echo "===== INSTALL / LOCK REFRESH ====="
npm install

echo
echo "===== VSIX BUILD ====="
npm run pack:vsix

echo
echo "===== NPM PACK DRY RUN ====="
npm run pack:npm

echo
echo "===== NPM VERSION CHECK ====="
EXISTING_LATEST="$(npm view "$PKG_NAME" version 2>/dev/null || true)"
EXISTING_THIS_VERSION="$(npm view "${PKG_NAME}@${VERSION}" version 2>/dev/null || true)"

if [ -n "$EXISTING_LATEST" ]; then
  echo "Package npm già esistente: $PKG_NAME"
  echo "Latest npm version: $EXISTING_LATEST"
else
  echo "Package npm non ancora esistente: $PKG_NAME"
fi

if [ -n "$EXISTING_THIS_VERSION" ]; then
  echo "Versione già pubblicata su npm: ${PKG_NAME}@${VERSION}"
  echo "Publish non necessario."
  PUBLISH_NEEDED=0
else
  echo "Versione pubblicabile: ${PKG_NAME}@${VERSION}"
  PUBLISH_NEEDED=1
fi

echo
echo "===== GIT COMMIT ====="
git add package.json package-lock.json README.md README_IT.md CHANGELOG.md SECURITY.md CONTRIBUTING.md .npmignore .vscodeignore extension.js LICENSE scripts/cc-npm-publish.sh scripts/cc-npm-bump.sh scripts/cc-install-local.sh 2>/dev/null || true

if ! git diff --cached --quiet; then
  git commit -m "chore: prepare npm package ${VERSION}"
else
  echo "Nothing to commit."
fi

echo
echo "===== GIT PUSH MAIN ====="
if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git push "$REMOTE_NAME" main
else
  echo "WARN: remote '$REMOTE_NAME' non configurato. Push main saltato."
fi

echo
echo "===== NPM PUBLISH ====="
if [ "$PUBLISH_NEEDED" = "0" ]; then
  echo "SKIP: ${PKG_NAME}@${VERSION} è già pubblicato."
  PUBLISH_OK=1
elif [ "$NPM_AUTH_OK" != "1" ]; then
  echo "SKIP: npm auth non disponibile."
  echo
  echo "Dopo login puoi rilanciare:"
  echo "npm run publish"
  PUBLISH_OK=0
else
  if npm publish; then
    PUBLISH_OK=1
    echo "OK: pubblicato ${PKG_NAME}@${VERSION}"
  else
    PUBLISH_OK=0
    echo "WARN: npm publish fallito."
    echo "      Possibili cause: sessione scaduta, 2FA/OTP, permessi package, nome già riservato."
    echo "      Nessun tag git verrà creato."
  fi
fi

echo
echo "===== GIT TAG ====="
if [ "$PUBLISH_OK" = "1" ]; then
  TAG="v${VERSION}"

  if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Tag già esistente localmente: $TAG"
  else
    git tag "$TAG"
  fi

  if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
    git push "$REMOTE_NAME" "$TAG"
  else
    echo "WARN: remote '$REMOTE_NAME' non configurato. Push tag saltato."
  fi
else
  echo "SKIP: tag saltato perché npm publish non è andato a buon fine."
fi

echo
echo "===== DONE ====="
echo "Package: ${PKG_NAME}@${VERSION}"

if npm view "$PKG_NAME" version >/dev/null 2>&1; then
  echo "NPM VERSION:"
  npm view "$PKG_NAME" version
  echo "NPM HOMEPAGE:"
  npm view "$PKG_NAME" homepage 2>/dev/null || true
else
  echo "Npm package non ancora visibile/pubblicato."
fi
