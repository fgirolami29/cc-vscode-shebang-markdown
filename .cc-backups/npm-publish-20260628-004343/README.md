# CodeCorn Shebang Markdown

Detects a custom shebang on the first line and switches the file to Markdown language mode.

Useful for files without `.md` extension that must still be treated as Markdown by VS Code, markdownlint, formatters and language-aware tooling.

## Supported shebangs

Default regex:

~~~text
^#!.*\bcc-(md|markdown)\b
~~~

Examples:

~~~text
#!/usr/bin/env cc-md
~~~

~~~text
#!cc-md
~~~

~~~text
#!/usr/bin/env cc-markdown
~~~

## Settings

~~~json
{
  "ccShebangMarkdown.pattern": "^#!.*\\bcc-(md|markdown)\\b",
  "ccShebangMarkdown.targetLanguage": "markdown"
}
~~~

## Local install

~~~bash
npm install
npm run reinstall
~~~
