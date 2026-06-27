const vscode = require('vscode');

const applying = new WeakSet();

const DEFAULT_RULES = [
  {
    name: 'CodeCorn Markdown shebang',
    when: 'firstLine',
    pattern: '^#!.*\\bcc-(md|markdown)\\b',
    language: 'markdown'
  },
  {
    name: 'POSIX shell shebang',
    when: 'firstLine',
    pattern: '^#!\\s*(?:/(?:usr/)?(?:local/)?bin/(?:bash|zsh|sh)\\b|/usr/bin/env\\s+(?:-[^\\s]+\\s+)*(?:bash|zsh|sh)\\b|/bin/env\\s+(?:-[^\\s]+\\s+)*(?:bash|zsh|sh)\\b)',
    language: 'shellscript'
  },
  {
    name: 'nginx.conf path',
    when: 'path',
    pattern: '(?:^|[/\\\\])nginx\\.conf$|(?:^|[/\\\\])conf\\.d[/\\\\].*\\.conf$',
    language: 'nginx',
    fallbackLanguage: 'plaintext'
  },
  {
    name: 'nginx content fallback',
    when: 'content',
    pattern: '(?m)^\\s*(events|http|server|upstream)\\s*\\{|^\\s*location\\s+[^\\n]+\\{',
    language: 'nginx',
    fallbackLanguage: 'plaintext'
  }
];

function compileRule(rule) {
  if (!rule || typeof rule !== 'object') return null;
  if (!rule.pattern || !rule.language) return null;

  try {
    return {
      name: String(rule.name || rule.language),
      when: String(rule.when || 'firstLine'),
      pattern: new RegExp(String(rule.pattern)),
      language: String(rule.language),
      fallbackLanguage: rule.fallbackLanguage ? String(rule.fallbackLanguage) : ''
    };
  } catch (err) {
    console.warn('[cc-shebang-markdown] Invalid rule regex:', rule, err);
    return null;
  }
}

function readRules() {
  const cfg = vscode.workspace.getConfiguration();

  const legacyPattern = cfg.get(
    'ccShebangMarkdown.pattern',
    '^#!.*\\bcc-(md|markdown)\\b'
  );

  const legacyTargetLanguage = cfg.get(
    'ccShebangMarkdown.targetLanguage',
    'markdown'
  );

  const configuredRules = cfg.get('ccShebangMarkdown.rules', DEFAULT_RULES);

  const rules = Array.isArray(configuredRules) && configuredRules.length > 0
    ? configuredRules
    : DEFAULT_RULES;

  const compiled = rules
    .map(compileRule)
    .filter(Boolean);

  /*
   * Backward compatibility:
   * old config keys still work and remain first priority.
   */
  const legacyRule = compileRule({
    name: 'legacy ccShebangMarkdown.pattern',
    when: 'firstLine',
    pattern: legacyPattern,
    language: legacyTargetLanguage
  });

  return [
    legacyRule,
    ...compiled
  ].filter(Boolean);
}

function getProbeText(document) {
  if (!document || document.lineCount < 1) return '';

  const endLine = Math.min(document.lineCount, 80);
  const endCharacter = endLine > 0 ? document.lineAt(endLine - 1).text.length : 0;

  return document.getText(
    new vscode.Range(0, 0, Math.max(0, endLine - 1), endCharacter)
  );
}

function matchesRule(document, rule) {
  if (!document || !rule) return false;

  if (rule.when === 'path') {
    const path = document.uri && document.uri.fsPath
      ? document.uri.fsPath
      : document.fileName || '';

    return rule.pattern.test(path);
  }

  if (rule.when === 'content') {
    return rule.pattern.test(getProbeText(document));
  }

  const firstLine = document.lineCount > 0
    ? document.lineAt(0).text
    : '';

  return rule.pattern.test(firstLine);
}

async function resolveLanguage(rule) {
  const available = await vscode.languages.getLanguages();

  if (available.includes(rule.language)) {
    return rule.language;
  }

  if (rule.fallbackLanguage && available.includes(rule.fallbackLanguage)) {
    console.warn(
      `[cc-shebang-markdown] Language "${rule.language}" unavailable, using fallback "${rule.fallbackLanguage}" for rule "${rule.name}".`
    );

    return rule.fallbackLanguage;
  }

  console.warn(
    `[cc-shebang-markdown] Language "${rule.language}" unavailable for rule "${rule.name}".`
  );

  return '';
}

async function maybeForceLanguage(document) {
  if (!document || document.isClosed) return;
  if (document.lineCount < 1) return;
  if (applying.has(document)) return;

  const rules = readRules();
  const matchedRule = rules.find((rule) => matchesRule(document, rule));

  if (!matchedRule) return;

  const targetLanguage = await resolveLanguage(matchedRule);

  if (!targetLanguage) return;
  if (document.languageId === targetLanguage) return;

  applying.add(document);

  try {
    await vscode.languages.setTextDocumentLanguage(document, targetLanguage);
    console.info(
      `[cc-shebang-markdown] Applied "${targetLanguage}" via rule "${matchedRule.name}".`
    );
  } catch (err) {
    console.warn(
      '[cc-shebang-markdown] Could not change language mode:',
      err
    );
  } finally {
    applying.delete(document);
  }
}

function activate(context) {
  for (const document of vscode.workspace.textDocuments) {
    maybeForceLanguage(document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      maybeForceLanguage(document);
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      const touchesFirstLine = event.contentChanges.some((change) => {
        return change.range.start.line === 0 || change.range.end.line === 0;
      });

      /*
       * For content-based fallbacks, also retry on early document edits.
       */
      const touchesProbeArea = event.contentChanges.some((change) => {
        return change.range.start.line < 80 || change.range.end.line < 80;
      });

      if (touchesFirstLine || touchesProbeArea) {
        maybeForceLanguage(event.document);
      }
    }),

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration('ccShebangMarkdown')) return;

      for (const document of vscode.workspace.textDocuments) {
        maybeForceLanguage(document);
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
