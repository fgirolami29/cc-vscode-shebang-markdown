# CodeCorn Shebang Markdown

[![npm version](https://img.shields.io/npm/v/cc-vscode-shebang-markdown.svg)](https://www.npmjs.com/package/cc-vscode-shebang-markdown)
[![npm downloads](https://img.shields.io/npm/dm/cc-vscode-shebang-markdown.svg)](https://www.npmjs.com/package/cc-vscode-shebang-markdown)
[![license](https://img.shields.io/npm/l/cc-vscode-shebang-markdown.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.80.0-blue.svg)](https://code.visualstudio.com/)

**CodeCorn Shebang Markdown** is a tiny Visual Studio Code extension that detects a custom shebang on the first line of a file and switches the editor language mode to Markdown.

It is designed for workflows where Markdown-like operational files, scripts, notes or generated artifacts do not use the `.md` extension, but still need to be handled as Markdown by VS Code, markdownlint, formatters and language-aware tooling.

Italian documentation: [README_IT.md](README_IT.md)

---

## Why

VS Code file associations are path/name based. They are great when a file extension or filename is predictable, but they do not inspect the first line of a document.

This extension fills that gap with a small content-based rule:

```text
first line contains a CodeCorn Markdown shebang
→ switch document language mode to markdown
```

Example:

```text
#!/usr/bin/env cc-md

# Deployment checklist

- backup database
- dump environment
- apply patch
- verify logs
```

Even if the file has no `.md` extension, VS Code will treat it as Markdown.

---

## Features

- Detects custom Markdown shebangs on the first line.
- Forces VS Code language mode to `markdown`.
- Works with untitled files, extensionless files and script-like notes.
- Configurable regex pattern.
- Configurable target VS Code language id.
- Useful with `markdownlint`, Markdown formatters and editor tooling.
- No runtime dependencies.
- Minimal extension footprint.

---

## Default shebangs

The default pattern is:

```text
^#!.*\bcc-(md|markdown)\b
```

Supported examples:

```text
#!/usr/bin/env cc-md
```

```text
#!cc-md
```

```text
#!/usr/bin/env cc-markdown
```

```text
#!cc-markdown
```

---

## Installation

### Local VSIX install

This package is primarily a VS Code extension. For local development or internal usage:

```bash
npm install
npm run reinstall
```

This builds the `.vsix` package and installs it in VS Code.

### npm package

The package is also published on npm for traceability, reuse and source distribution:

```bash
npm install cc-vscode-shebang-markdown
```

Installing from npm does not automatically install the extension into VS Code. For actual editor installation, use a generated `.vsix` file or publish the extension to the Visual Studio Code Marketplace.

---

## Usage

Create or open any file whose first line matches the configured shebang pattern:

```text
#!/usr/bin/env cc-md

# Server audit

## Build log

- collect build output
- inspect warnings
- normalize report
```

When the document opens, the extension switches its language mode to:

```text
markdown
```

You can verify this in the bottom-right language selector in VS Code.

---

## Configuration

### `ccShebangMarkdown.pattern`

Regex applied to the first line of the document.

Default:

```json
{
  "ccShebangMarkdown.pattern": "^#!.*\\bcc-(md|markdown)\\b"
}
```

### `ccShebangMarkdown.targetLanguage`

VS Code language id to apply when the pattern matches.

Default:

```json
{
  "ccShebangMarkdown.targetLanguage": "markdown"
}
```

Advanced example:

```json
{
  "ccShebangMarkdown.pattern": "^#!.*\\bcompany-doc\\b",
  "ccShebangMarkdown.targetLanguage": "markdown"
}
```

---

## markdownlint note

Some lint configurations require the first line of a Markdown document to be a heading. A shebang intentionally violates that rule.

For shebang-based Markdown files, you may want to disable `MD041`:

```json
{
  "markdownlint.config": {
    "MD041": false
  }
}
```

---

## Development

Clone the repository and install dependencies:

```bash
npm install
```

Package the VS Code extension:

```bash
npm run pack:vsix
```

Install it locally:

```bash
npm run reinstall
```

Check npm package contents before publishing:

```bash
npm run pack:npm
```

---

## Release flow

Bump the version in `package.json`, then run:

```bash
npm install
npm run pack:vsix
npm run pack:npm
npm publish
```

For scoped npm packages, npm requires public scoped packages to be published with `npm publish --access public`. This package is intentionally unscoped, so plain `npm publish` is enough.

---

## Design principles

- Do one thing.
- Avoid filename conventions when the contract belongs in the file content.
- Keep the rule explicit and visible.
- Do not hijack unrelated files.
- Prefer configurable detection over hardcoded project paths.

---

## Security

This extension only reads the first line of open text documents and changes VS Code language mode through the VS Code API.

It does not:

- execute file contents;
- send telemetry;
- perform network requests;
- read secrets;
- modify files on disk.

Please report security issues privately when possible. See [SECURITY.md](SECURITY.md).

---

## Contributing

Issues and pull requests are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT. See [LICENSE](LICENSE).

---

## Maintainer

Built and maintained by **Federico Girolami** / **CodeCorn Technology**.

CodeCorn™ — We build software that Corn.

## Language fallback rules

Besides CodeCorn Markdown shebangs, the extension also ships with defensive fallback rules for common script/config files.

### Shell scripts

The extension reinforces VS Code detection for:

```text
#!/bin/bash
#!/bin/zsh
#!/bin/sh
#!/usr/bin/bash
#!/usr/bin/zsh
#!/usr/bin/sh
#!/usr/local/bin/bash
#!/usr/bin/env bash
#!/usr/bin/env zsh
#!/usr/bin/env sh
#!/usr/bin/env -S bash -euo pipefail
```

Matching files are switched to:

```text
shellscript
```

### nginx

The extension includes a defensive fallback for:

```text
nginx.conf
conf.d/*.conf
```

and for files containing common nginx blocks near the top:

```nginx
events {
}

http {
}

server {
}

upstream backend {
}
```

Matching files are switched to:

```text
nginx
```

If the `nginx` language id is not available in the current VS Code installation, the rule falls back to `plaintext` instead of throwing.
