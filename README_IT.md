# CodeCorn Shebang Markdown

**CodeCorn Shebang Markdown** è una piccola estensione per Visual Studio Code che legge la prima riga di un file e, se trova uno shebang configurato, forza il language mode a Markdown.

Serve quando hai file senza estensione `.md`, oppure file operativi/script-like, che devono comunque essere trattati come Markdown da VS Code, markdownlint e formatter.

---

## Esempio

```text
#!/usr/bin/env cc-md

# Checklist deploy

- backup database
- dump env
- patch
- verifica log
```

Anche senza estensione `.md`, VS Code imposta il file come `markdown`.

---

## Shebang supportati

Pattern default:

```text
^#!.*\bcc-(md|markdown)\b
```

Esempi:

```text
#!/usr/bin/env cc-md
```

```text
#!cc-md
```

```text
#!/usr/bin/env cc-markdown
```

---

## Configurazione

```json
{
  "ccShebangMarkdown.pattern": "^#!.*\\bcc-(md|markdown)\\b",
  "ccShebangMarkdown.targetLanguage": "markdown"
}
```

---

## Nota markdownlint

Se `markdownlint` segnala che la prima riga non è un heading, puoi disattivare `MD041` per questo workflow:

```json
{
  "markdownlint.config": {
    "MD041": false
  }
}
```

---

## Installazione locale

```bash
npm install
npm run reinstall
```

Questo genera il `.vsix` e lo installa in VS Code.

---

## Licenza

MIT.

---

## Maintainer

Federico Girolami / CodeCorn Technology.

CodeCorn™ — We build software that Corn.
