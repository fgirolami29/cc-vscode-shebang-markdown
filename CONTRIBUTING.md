# Contributing

Contributions are welcome.

## Development

```bash
npm install
npm run pack:vsix
npm run reinstall
```

## Before opening a pull request

Please check:

```bash
npm run pack:npm
npm run pack:vsix
```

## Guidelines

- Keep the extension small.
- Avoid project-specific hardcoding.
- Preserve the configurable shebang pattern.
- Document behavior changes in `CHANGELOG.md`.
