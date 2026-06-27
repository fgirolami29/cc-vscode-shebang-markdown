# Changelog

## 0.1.0

Initial public release.

### Added

- Custom shebang detection on the first line.
- Automatic language mode switch to Markdown.
- Configurable detection pattern.
- Configurable target language id.
- Local VSIX packaging scripts.
- npm package metadata and documentation.

## 0.1.1

### Added

- POSIX shell shebang fallback for `bash`, `zsh` and `sh`.
- Support for `/bin/*`, `/usr/bin/*`, `/usr/local/bin/*` and `/usr/bin/env` shebang variants.
- Support for `/usr/bin/env -S bash ...` style shebangs.
- Fallback detection for `nginx.conf` and `conf.d/*.conf`.
- Content-based nginx fallback for common nginx blocks.

### Fixed

- Removed `.vscodeignore` because VSCE does not support using `.vscodeignore` together with the `files` property in `package.json`.
