import { workspace, languages } from 'vscode';

/**
 * @typedef {import('vscode').TextDocument} TextDocument
 * @typedef {import('vscode').TextDocumentChangeEvent} TextDocumentChangeEvent
 * @typedef {import('vscode').ExtensionContext} ExtensionContext
 */

/** @type {WeakSet<TextDocument>} */
let applying = new WeakSet();

function getPattern() {
    const raw = workspace.getConfiguration().get('ccShebangMarkdown.pattern', '^#!.*\\bcc-md\\b');

    try {
        return new RegExp(raw);
    } catch {
        return /^#!.*\bcc-md\b/;
    }
}

/**
 * @param {TextDocument | undefined} document
 * @returns {Promise<void>}
 */
async function maybeForceMarkdown(document) {
    if (!document || document.isClosed) return;
    if (document.languageId === 'markdown') return;
    if (document.lineCount < 1) return;
    if (applying.has(document)) return;

    const firstLine = document.lineAt(0).text;
    const pattern = getPattern();

    if (!pattern.test(firstLine)) return;

    applying.add(document);

    try {
        await languages.setTextDocumentLanguage(document, 'markdown');
    } finally {
        applying.delete(document);
    }
}

/**
 * @param {import('vscode').ExtensionContext} context
 * @returns {void}
 */
function activate(context) {
    for (const document of workspace.textDocuments) {
        maybeForceMarkdown(document);
    }

    context.subscriptions.push(
        workspace.onDidOpenTextDocument(maybeForceMarkdown),
        workspace.onDidChangeTextDocument((event) => {
            if (event.contentChanges.some((change) => change.range.start.line === 0)) {
                maybeForceMarkdown(event.document);
            }
        }),
    );
}

function deactivate() {}

export default {
    activate,
    deactivate,
};
