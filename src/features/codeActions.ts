import * as vscode from 'vscode';
import { t } from '../i18n';

const WRAP_CODES = ['HS_NO_FOCUS', 'HS_NO_RELAX'];
const SEMICOLON_CODE = 'HS_MISSING_SEMICOLON';

export class HypnoScriptCodeActionProvider
  implements vscode.CodeActionProvider
{
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    let needsWrap = false;
    for (const diagnostic of context.diagnostics) {
      if (typeof diagnostic.code === 'string') {
        if (WRAP_CODES.includes(diagnostic.code)) {
          needsWrap = true;
        } else if (diagnostic.code === SEMICOLON_CODE) {
          actions.push(this.createSemicolonFix(document, diagnostic));
        }
      }
    }

    if (needsWrap) {
      actions.push(this.createWrapFix(document));
    }

    return actions;
  }

  private createWrapFix(document: vscode.TextDocument): vscode.CodeAction {
    const title = t('codeaction_focus_wrapper');
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    edit.insert(document.uri, new vscode.Position(0, 0), 'Focus {\n');

    const lastLine = document.lineAt(document.lineCount - 1);
    const suffix = lastLine.text.length === 0 ? '' : '\n';
    edit.insert(document.uri, lastLine.range.end, `${suffix}} Relax\n`);

    fix.edit = edit;
    return fix;
  }

  private createSemicolonFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const title = t('codeaction_add_semicolon');
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    const targetLine = diagnostic.range.end.line;
    const line = document.lineAt(targetLine);
    edit.insert(document.uri, line.range.end, ';');

    fix.edit = edit;
    fix.diagnostics = [diagnostic];
    return fix;
  }
}
