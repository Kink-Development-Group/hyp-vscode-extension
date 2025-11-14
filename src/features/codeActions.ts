import * as vscode from 'vscode';
import { t } from '../i18n';

/**
 * HypnoScript Code Action Provider
 * Implementiert Quick-Fixes, Refactorings und Code-Suggestions
 */
export class HypnoScriptCodeActionProvider
  implements vscode.CodeActionProvider
{
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor,
    vscode.CodeActionKind.RefactorExtract,
    vscode.CodeActionKind.RefactorRewrite,
    vscode.CodeActionKind.Source,
  ];

  private readonly DIAGNOSTIC_CODES = {
    NO_FOCUS: 'HS_NO_FOCUS',
    NO_RELAX: 'HS_NO_RELAX',
    FOCUS_AFTER_RELAX: 'HS_FOCUS_ORDER',
    MULTIPLE_FOCUS: 'HS_MULTIPLE_FOCUS',
    MULTIPLE_RELAX: 'HS_MULTIPLE_RELAX',
    MISSING_SEMICOLON: 'HS_MISSING_SEMICOLON',
    UNBALANCED_BRACES: 'HS_UNBALANCED_BRACES',
    UNUSED_VARIABLE: 'HS_UNUSED_VARIABLE',
  };

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // Quick-Fixes basierend auf Diagnostics
    actions.push(...this.getQuickFixes(document, range, context));

    // Refactorings
    actions.push(...this.getRefactorings(document, range));

    // Source Actions
    actions.push(...this.getSourceActions(document));

    return actions;
  }

  // ========== QUICK-FIXES ==========

  /**
   * Generiert Quick-Fixes basierend auf Diagnostics
   */
  private getQuickFixes(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    let needsFocusRelaxWrapper = false;

    for (const diagnostic of context.diagnostics) {
      const code = diagnostic.code;

      if (!code || typeof code !== 'string') {
        continue;
      }

      switch (code) {
        case this.DIAGNOSTIC_CODES.NO_FOCUS:
        case this.DIAGNOSTIC_CODES.NO_RELAX:
          needsFocusRelaxWrapper = true;
          break;

        case this.DIAGNOSTIC_CODES.MISSING_SEMICOLON:
          actions.push(this.createAddSemicolonFix(document, diagnostic));
          break;

        case this.DIAGNOSTIC_CODES.UNUSED_VARIABLE:
          actions.push(
            this.createRemoveUnusedVariableFix(document, diagnostic)
          );
          break;

        case this.DIAGNOSTIC_CODES.MULTIPLE_FOCUS:
        case this.DIAGNOSTIC_CODES.MULTIPLE_RELAX:
          actions.push(this.createRemoveDuplicateFix(document, diagnostic));
          break;
      }
    }

    // Focus/Relax Wrapper (nur einmal hinzufügen)
    if (needsFocusRelaxWrapper) {
      actions.push(this.createFocusRelaxWrapperFix(document));
    }

    return actions;
  }

  /**
   * Quick-Fix: Fügt Focus/Relax um das Dokument hinzu
   */
  private createFocusRelaxWrapperFix(
    document: vscode.TextDocument
  ): vscode.CodeAction {
    const title = t('codeaction_focus_wrapper');
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    // Focus am Anfang
    edit.insert(document.uri, new vscode.Position(0, 0), 'Focus {\n');

    // Relax am Ende
    const lastLine = document.lineAt(document.lineCount - 1);
    const suffix = lastLine.text.length === 0 ? '' : '\n';
    edit.insert(document.uri, lastLine.range.end, `${suffix}} Relax\n`);

    fix.edit = edit;
    fix.isPreferred = true;
    return fix;
  }

  /**
   * Quick-Fix: Fügt fehlendes Semikolon hinzu
   */
  private createAddSemicolonFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const title = t('codeaction_add_semicolon');
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    const line = document.lineAt(diagnostic.range.end.line);
    edit.insert(document.uri, line.range.end, ';');

    fix.edit = edit;
    fix.diagnostics = [diagnostic];
    fix.isPreferred = true;
    return fix;
  }

  /**
   * Quick-Fix: Entfernt ungenutzte Variable
   */
  private createRemoveUnusedVariableFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const title = 'Remove unused variable';
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    // Entferne die gesamte Zeile
    const line = document.lineAt(diagnostic.range.start.line);
    const rangeToDelete = new vscode.Range(
      line.range.start,
      line.range.end.translate(1, 0) // Inkl. Newline
    );
    edit.delete(document.uri, rangeToDelete);

    fix.edit = edit;
    fix.diagnostics = [diagnostic];
    return fix;
  }

  /**
   * Quick-Fix: Entfernt doppeltes Focus/Relax
   */
  private createRemoveDuplicateFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction {
    const title = 'Remove duplicate';
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    const edit = new vscode.WorkspaceEdit();

    edit.delete(document.uri, diagnostic.range);

    fix.edit = edit;
    fix.diagnostics = [diagnostic];
    return fix;
  }

  // ========== REFACTORINGS ==========

  /**
   * Generiert Refactoring-Actions
   */
  private getRefactorings(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Nur wenn Text ausgewählt ist
    if (!range.isEmpty) {
      actions.push(this.createExtractToSuggestionRefactoring(document, range));
      actions.push(this.createExtractToVariableRefactoring(document, range));
      actions.push(
        this.createConvertToHypnoticOperatorRefactoring(document, range)
      );
    }

    // Refactoring am Cursor
    const cursorLine = document.lineAt(range.start.line).text;

    if (this.isSuggestionDeclaration(cursorLine)) {
      actions.push(
        this.createConvertToAsyncSuggestionRefactoring(document, range)
      );
    }

    if (this.isStandardOperator(cursorLine)) {
      actions.push(
        this.createConvertToHypnoticSyntaxRefactoring(document, range)
      );
    }

    return actions;
  }

  /**
   * Refactoring: Extrahiert Code in eine Suggestion (Funktion)
   */
  private createExtractToSuggestionRefactoring(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const title = 'Extract to suggestion';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.RefactorExtract
    );
    const edit = new vscode.WorkspaceEdit();

    const selectedText = document.getText(range);
    const suggestionName = 'extractedSuggestion';

    // Füge Funktionsdefinition vor dem aktuellen Block ein
    const functionDef = `\nsuggestion ${suggestionName}() {\n    ${selectedText}\n}\n`;
    const insertPos = this.findInsertionPoint(document, range);
    edit.insert(document.uri, insertPos, functionDef);

    // Ersetze ausgewählten Code durch Funktionsaufruf
    edit.replace(document.uri, range, `${suggestionName}();`);

    action.edit = edit;
    return action;
  }

  /**
   * Refactoring: Extrahiert Ausdruck in eine Variable
   */
  private createExtractToVariableRefactoring(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const title = 'Extract to variable';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.RefactorExtract
    );
    const edit = new vscode.WorkspaceEdit();

    const selectedText = document.getText(range);
    const varName = 'extractedValue';

    // Füge Variable vor der aktuellen Zeile ein
    const lineStart = new vscode.Position(range.start.line, 0);
    edit.insert(
      document.uri,
      lineStart,
      `induce ${varName} = ${selectedText};\n`
    );

    // Ersetze Ausdruck durch Variablennamen
    edit.replace(document.uri, range, varName);

    action.edit = edit;
    return action;
  }

  /**
   * Refactoring: Konvertiert Standard-Operatoren zu hypnotischen Synonymen
   */
  private createConvertToHypnoticOperatorRefactoring(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const title = 'Convert to hypnotic operator';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.RefactorRewrite
    );
    const edit = new vscode.WorkspaceEdit();

    const text = document.getText(range);
    const converted = this.convertOperatorsToHypnotic(text);

    edit.replace(document.uri, range, converted);

    action.edit = edit;
    return action;
  }

  /**
   * Refactoring: Konvertiert Suggestion zu mesmerize suggestion (async)
   */
  private createConvertToAsyncSuggestionRefactoring(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const title = 'Convert to async suggestion (mesmerize)';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.RefactorRewrite
    );
    const edit = new vscode.WorkspaceEdit();

    const line = document.lineAt(range.start.line);
    const newLine = line.text.replace(/\bsuggestion\b/, 'mesmerize suggestion');
    edit.replace(document.uri, line.range, newLine);

    action.edit = edit;
    return action;
  }

  /**
   * Refactoring: Konvertiert gesamte Datei zu hypnotischer Syntax
   */
  private createConvertToHypnoticSyntaxRefactoring(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const title = 'Convert to full hypnotic syntax';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.RefactorRewrite
    );
    const edit = new vscode.WorkspaceEdit();

    const text = document.getText();
    const converted = this.convertOperatorsToHypnotic(text);

    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    edit.replace(document.uri, fullRange, converted);

    action.edit = edit;
    return action;
  }

  // ========== SOURCE ACTIONS ==========

  /**
   * Generiert Source-Actions (z.B. "Organize Imports")
   */
  private getSourceActions(document: vscode.TextDocument): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    actions.push(this.createOrganizeImportsAction(document));
    actions.push(this.createAddEntranceBlockAction(document));
    actions.push(this.createAddFinaleBlockAction(document));

    return actions;
  }

  /**
   * Source Action: Organisiert mindLink-Importe
   */
  private createOrganizeImportsAction(
    document: vscode.TextDocument
  ): vscode.CodeAction {
    const title = 'Organize mindLink imports';
    const action = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.SourceOrganizeImports
    );

    // TODO: Implementiere Import-Organisation

    return action;
  }

  /**
   * Source Action: Fügt entrance-Block hinzu
   */
  private createAddEntranceBlockAction(
    document: vscode.TextDocument
  ): vscode.CodeAction {
    const title = 'Add entrance block';
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.Source);
    const edit = new vscode.WorkspaceEdit();

    // Finde Focus und füge entrance danach ein
    const text = document.getText();
    const focusMatch = text.match(/Focus\s*\{/);

    if (focusMatch && focusMatch.index !== undefined) {
      const pos = document.positionAt(focusMatch.index + focusMatch[0].length);
      edit.insert(
        document.uri,
        pos,
        '\n    entrance {\n        // Initialization code\n    }\n'
      );
    }

    action.edit = edit;
    return action;
  }

  /**
   * Source Action: Fügt finale-Block hinzu
   */
  private createAddFinaleBlockAction(
    document: vscode.TextDocument
  ): vscode.CodeAction {
    const title = 'Add finale block';
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.Source);
    const edit = new vscode.WorkspaceEdit();

    // Finde Relax und füge finale davor ein
    const text = document.getText();
    const relaxMatch = text.match(/}\s*Relax/);

    if (relaxMatch && relaxMatch.index !== undefined) {
      const pos = document.positionAt(relaxMatch.index);
      edit.insert(
        document.uri,
        pos,
        '\n    finale {\n        // Cleanup code\n    }\n'
      );
    }

    action.edit = edit;
    return action;
  }

  // ========== HILFSFUNKTIONEN ==========

  /**
   * Findet Einfügepunkt für neue Funktionsdefinition
   */
  private findInsertionPoint(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.Position {
    // Suche rückwärts nach Funktionsdefinition oder Programmanfang
    for (let i = range.start.line; i >= 0; i--) {
      const line = document.lineAt(i).text;
      if (line.match(/^(suggestion|session|tranceify|Focus)/)) {
        return new vscode.Position(i, 0);
      }
    }
    return new vscode.Position(0, 0);
  }

  /**
   * Konvertiert Standard-Operatoren zu hypnotischen Synonymen
   */
  private convertOperatorsToHypnotic(text: string): string {
    const replacements: Array<[RegExp, string]> = [
      [/\s+==\s+/g, ' youAreFeelingVerySleepy '],
      [/\s+!=\s+/g, ' youCannotResist '],
      [/\s+>\s+/g, ' lookAtTheWatch '],
      [/\s+<\s+/g, ' fallUnderMySpell '],
      [/\s+>=\s+/g, ' yourEyesAreGettingHeavy '],
      [/\s+<=\s+/g, ' goingDeeper '],
      [/\s+&&\s+/g, ' underMyControl '],
      [/\s+\|\|\s+/g, ' resistanceIsFutile '],
      [/\?\?/g, 'lucidFallback'],
      [/\?\./g, 'dreamReach'],
    ];

    let result = text;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  /**
   * Prüft, ob Zeile eine Funktionsdeklaration ist
   */
  private isSuggestionDeclaration(line: string): boolean {
    return /^\s*suggestion\s+\w+/.test(line);
  }

  /**
   * Prüft, ob Zeile Standard-Operatoren enthält
   */
  private isStandardOperator(line: string): boolean {
    return /[=!<>]=?|&&|\|\|/.test(line);
  }
}
