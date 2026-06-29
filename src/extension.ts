import * as vscode from 'vscode';

const CC_MD_SHEBANG_RE: RegExp = /^#!.*\bcc-md\b/;

interface OpenDocumentHandler {
  (document: vscode.TextDocument): void;
}

interface ChangeDocumentHandler {
  (event: vscode.TextDocumentChangeEvent): void;
}

interface ActiveTextEditorHandler {
  (editor: vscode.TextEditor | undefined): void;
}

async function maybeSetMarkdown(document: vscode.TextDocument): Promise<void> {
  if (!document || document.isClosed) return;
  if (document.languageId === 'markdown') return;
  if (document.lineCount < 1) return;

  const firstLine: string = document.lineAt(0).text;

  if (!CC_MD_SHEBANG_RE.test(firstLine)) return;

  await vscode.languages.setTextDocumentLanguage(document, 'markdown');
}

export function activate(context: vscode.ExtensionContext): void {
  for (const document of vscode.workspace.textDocuments) {
    void maybeSetMarkdown(document);
  }

  const handleOpenDocument: OpenDocumentHandler = (document) => {
    void maybeSetMarkdown(document);
  };

  const handleChangeTextDocument: ChangeDocumentHandler = (event) => {
    if (event.document.lineCount > 0) {
      void maybeSetMarkdown(event.document);
    }
  };

  const handleDidChangeActiveTextEditor: ActiveTextEditorHandler = (editor) => {
    if (editor?.document) {
      void maybeSetMarkdown(editor.document);
    }
  };

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(handleOpenDocument),
    vscode.workspace.onDidChangeTextDocument(handleChangeTextDocument),
    vscode.window.onDidChangeActiveTextEditor(handleDidChangeActiveTextEditor)
  );
}

export function deactivate(): void {}
