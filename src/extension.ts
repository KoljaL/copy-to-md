import * as vscode from 'vscode';

function generateURLWithLineNumbers(editor: vscode.TextEditor, type: string = 'line') {
    const document = editor.document;
    const currentFilePath = document.uri.fsPath;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const languageId = document.languageId;

    if (!workspaceFolder) {
        vscode.window.showErrorMessage('This file is not part of a workspace.');
        return;
    }

    const relativePath = vscode.workspace.asRelativePath(currentFilePath);
    const currentLineNumber = editor.selection.active.line + 1;
    let clipboard = `[${relativePath}](${relativePath})`;

    // line number
    if (type === 'path & line') {
        clipboard = `[${relativePath}#L${currentLineNumber}](${relativePath}#L${currentLineNumber})`;
    }
    // line numbers
    else if (type === 'path & lines') {
        clipboard = `[${relativePath}#L${editor.selection.start.line + 1}-L${editor.selection.end.line + 1}](${relativePath}#L${editor.selection.start.line + 1}-L${editor.selection.end.line + 1})`;
    }
    //
    else if (type === 'path & code') {
        const code = document.getText(editor.selection);

        clipboard = `[${relativePath}#L${editor.selection.start.line + 1}-L${editor.selection.end.line + 1}](${relativePath}#L${editor.selection.start.line + 1}-L${editor.selection.end.line + 1})
\`\`\`${languageId}
${code}
\`\`\`
\n
`;
    }

    vscode.env.clipboard.writeText(clipboard).then(() => {
        // vscode.window.showInformationMessage(`Copied to clipboard: ${type}`);
        // vscode.window.setStatusBarMessage(`Copied to clipboard: ${type}`, 3000);
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
            },
            async (progress, token) => {
                for (let i = 0; i < 30; i++) {
                    setTimeout(() => {
                        progress.report({ increment: i * 1, message: `Copied to clipboard: ${type}` });
                    }, 5000);
                }
            }
        );
    });
}

export function activate(context: vscode.ExtensionContext) {
    // copy relative path
    let copyPath = vscode.commands.registerCommand('copytomarkdown.copyPath', () => {
        generateURLWithLineNumbers(vscode.window.activeTextEditor!, 'path');
    });
    context.subscriptions.push(copyPath);

    // copy relative path and line number
    let copyLine = vscode.commands.registerCommand('copytomarkdown.copyPathLine', () => {
        generateURLWithLineNumbers(vscode.window.activeTextEditor!, 'path & line');
    });
    context.subscriptions.push(copyLine);

    // copy relative path and line numbers of selection
    let copySelection = vscode.commands.registerCommand('copytomarkdown.copyPathLines', () => {
        generateURLWithLineNumbers(vscode.window.activeTextEditor!, 'path & lines');
    });
    context.subscriptions.push(copySelection);

    // copy relative path and line numbers of selection and selected code
    let copySelectionCode = vscode.commands.registerCommand('copytomarkdown.copyPathLinesCode', () => {
        generateURLWithLineNumbers(vscode.window.activeTextEditor!, 'path & code');
    });
    context.subscriptions.push(copySelectionCode);
}
export function deactivate() {}
