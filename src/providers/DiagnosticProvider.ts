import * as vscode from 'vscode';
import { t } from '../i18n';

/**
 * Diagnostic severity levels
 */
enum DiagnosticLevel {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  HINT = 'hint',
}

/**
 * HypnoScript Diagnostic Provider
 * Implementiert umfassendes Linting für HypnoScript-Code
 */
export class HypnoScriptDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private readonly DIAGNOSTIC_CODES = {
    NO_FOCUS: 'HS_NO_FOCUS',
    NO_RELAX: 'HS_NO_RELAX',
    FOCUS_AFTER_RELAX: 'HS_FOCUS_ORDER',
    MULTIPLE_FOCUS: 'HS_MULTIPLE_FOCUS',
    MULTIPLE_RELAX: 'HS_MULTIPLE_RELAX',
    MISSING_SEMICOLON: 'HS_MISSING_SEMICOLON',
    UNBALANCED_BRACES: 'HS_UNBALANCED_BRACES',
    UNUSED_VARIABLE: 'HS_UNUSED_VARIABLE',
    UNDEFINED_VARIABLE: 'HS_UNDEFINED_VARIABLE',
    TYPE_MISMATCH: 'HS_TYPE_MISMATCH',
    MISSING_RETURN: 'HS_MISSING_RETURN',
    UNREACHABLE_CODE: 'HS_UNREACHABLE_CODE',
    DEPRECATED_SYNTAX: 'HS_DEPRECATED_SYNTAX',
    STYLE_VIOLATION: 'HS_STYLE_VIOLATION',
  };

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('hypnoscript');
  }

  /**
   * Hauptmethode zur Analyse eines Dokuments
   */
  public analyzeDo(document: vscode.TextDocument): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // Strukturelle Validierung
    diagnostics.push(...this.checkProgramStructure(document, text));

    // Syntax-Validierung
    diagnostics.push(...this.checkSyntax(document, text));

    // Semantische Validierung
    diagnostics.push(...this.checkSemantics(document, text));

    // Style-Checks
    diagnostics.push(...this.checkStyle(document, text));

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  /**
   * Löscht Diagnostics für ein Dokument
   */
  public clear(document: vscode.TextDocument): void {
    this.diagnosticCollection.delete(document.uri);
  }

  /**
   * Löscht alle Diagnostics
   */
  public clearAll(): void {
    this.diagnosticCollection.clear();
  }

  /**
   * Gibt die DiagnosticCollection zurück
   */
  public getCollection(): vscode.DiagnosticCollection {
    return this.diagnosticCollection;
  }

  // ========== STRUKTURELLE VALIDIERUNG ==========

  /**
   * Prüft die Programmstruktur (Focus/Relax)
   */
  private checkProgramStructure(document: vscode.TextDocument, text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    const focusMatches = Array.from(text.matchAll(/\bFocus\b/g));
    const relaxMatches = Array.from(text.matchAll(/\bRelax\b/g));

    // Fehlt Focus?
    if (focusMatches.length === 0) {
      const range = new vscode.Range(0, 0, 0, 0);
      diagnostics.push(
        this.createDiagnostic(
          range,
          t('error_no_focus'),
          DiagnosticLevel.ERROR,
          this.DIAGNOSTIC_CODES.NO_FOCUS
        )
      );
    }

    // Fehlt Relax?
    if (relaxMatches.length === 0) {
      const lastLine = document.lineCount - 1;
      const range = new vscode.Range(lastLine, 0, lastLine, 0);
      diagnostics.push(
        this.createDiagnostic(
          range,
          t('error_no_relax'),
          DiagnosticLevel.ERROR,
          this.DIAGNOSTIC_CODES.NO_RELAX
        )
      );
    }

    // Mehrfache Focus?
    if (focusMatches.length > 1) {
      focusMatches.slice(1).forEach((match) => {
        const pos = document.positionAt(match.index);
        const range = new vscode.Range(pos, pos.translate(0, 5));
        diagnostics.push(
          this.createDiagnostic(
            range,
            t('error_multiple_focus'),
            DiagnosticLevel.ERROR,
            this.DIAGNOSTIC_CODES.MULTIPLE_FOCUS
          )
        );
      });
    }

    // Mehrfache Relax?
    if (relaxMatches.length > 1) {
      relaxMatches.slice(1).forEach((match) => {
        const pos = document.positionAt(match.index);
        const range = new vscode.Range(pos, pos.translate(0, 5));
        diagnostics.push(
          this.createDiagnostic(
            range,
            t('error_multiple_relax'),
            DiagnosticLevel.ERROR,
            this.DIAGNOSTIC_CODES.MULTIPLE_RELAX
          )
        );
      });
    }

    // Focus nach Relax?
    if (focusMatches.length > 0 && relaxMatches.length > 0) {
      const focusPos = focusMatches[0].index;
      const relaxPos = relaxMatches[0].index;
      if (focusPos > relaxPos) {
        const pos = document.positionAt(focusPos);
        const range = new vscode.Range(pos, pos.translate(0, 5));
        diagnostics.push(
          this.createDiagnostic(
            range,
            t('error_focus_order'),
            DiagnosticLevel.ERROR,
            this.DIAGNOSTIC_CODES.FOCUS_AFTER_RELAX
          )
        );
      }
    }

    return diagnostics;
  }

  // ========== SYNTAX-VALIDIERUNG ==========

  /**
   * Prüft Syntax-Fehler
   */
  private checkSyntax(document: vscode.TextDocument, text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Unbalancierte Klammern
    diagnostics.push(...this.checkBalancedBraces(document, text));

    // Fehlende Semicolons
    diagnostics.push(...this.checkMissingSemicolons(document));

    return diagnostics;
  }

  /**
   * Prüft auf unbalancierte Klammern
   */
  private checkBalancedBraces(document: vscode.TextDocument, text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const stack: Array<{ char: string; pos: number }> = [];
    const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']' };
    const closing = new Set(['}', ')', ']']);

    // Entferne Kommentare und Strings für die Analyse
    const cleanedText = this.removeCommentsAndStrings(text);

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (pairs[char]) {
        stack.push({ char, pos: i });
      } else if (closing.has(char)) {
        if (stack.length === 0) {
          const pos = document.positionAt(i);
          diagnostics.push(
            this.createDiagnostic(
              new vscode.Range(pos, pos.translate(0, 1)),
              t('error_unbalanced_braces'),
              DiagnosticLevel.ERROR,
              this.DIAGNOSTIC_CODES.UNBALANCED_BRACES
            )
          );
        } else {
          const last = stack.pop();
          if (last && pairs[last.char] !== char) {
            const pos = document.positionAt(i);
            diagnostics.push(
              this.createDiagnostic(
                new vscode.Range(pos, pos.translate(0, 1)),
                t('error_unbalanced_braces'),
                DiagnosticLevel.ERROR,
                this.DIAGNOSTIC_CODES.UNBALANCED_BRACES
              )
            );
          }
        }
      }
    }

    // Nicht geschlossene öffnende Klammern
    stack.forEach((item) => {
      const pos = document.positionAt(item.pos);
      diagnostics.push(
        this.createDiagnostic(
          new vscode.Range(pos, pos.translate(0, 1)),
          t('error_unbalanced_braces'),
          DiagnosticLevel.ERROR,
          this.DIAGNOSTIC_CODES.UNBALANCED_BRACES
        )
      );
    });

    return diagnostics;
  }

  /**
   * Prüft auf fehlende Semicolons
   */
  private checkMissingSemicolons(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const statementKeywords = [
      'induce',
      'implant',
      'embed',
      'freeze',
      'observe',
      'whisper',
      'command',
      'murmur',
      'drift',
      'pauseReality',
      'anchor',
      'oscillate',
      'awaken',
      'snap',
      'sink',
      'sinkTo',
    ];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimmed = line.text.trim();

      // Ignoriere leere Zeilen, Kommentare, Blockstrukturen
      if (
        !trimmed ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.endsWith('{') ||
        trimmed.endsWith('}') ||
        trimmed === '}'
      ) {
        continue;
      }

      // Prüfe, ob Zeile mit Statement-Keyword beginnt und nicht mit ; endet
      const startsWithKeyword = statementKeywords.some((kw) =>
        new RegExp(`^\\s*${kw}\\b`).test(trimmed)
      );

      if (startsWithKeyword && !trimmed.endsWith(';') && !trimmed.endsWith('{')) {
        const range = new vscode.Range(i, line.text.length, i, line.text.length);
        diagnostics.push(
          this.createDiagnostic(
            range,
            t('error_missing_semicolon'),
            DiagnosticLevel.WARNING,
            this.DIAGNOSTIC_CODES.MISSING_SEMICOLON
          )
        );
      }
    }

    return diagnostics;
  }

  // ========== SEMANTISCHE VALIDIERUNG ==========

  /**
   * Prüft semantische Fehler
   */
  private checkSemantics(document: vscode.TextDocument, text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Variablen-Tracking
    const { defined, used } = this.trackVariables(text);

    // Ungenutzte Variablen
    defined.forEach((positions, varName) => {
      if (!used.has(varName)) {
        positions.forEach((pos) => {
          const position = document.positionAt(pos);
          const range = new vscode.Range(position, position.translate(0, varName.length));
          diagnostics.push(
            this.createDiagnostic(
              range,
              `Variable '${varName}' is declared but never used`,
              DiagnosticLevel.HINT,
              this.DIAGNOSTIC_CODES.UNUSED_VARIABLE
            )
          );
        });
      }
    });

    return diagnostics;
  }

  /**
   * Trackt definierte und verwendete Variablen
   */
  private trackVariables(text: string): {
    defined: Map<string, number[]>;
    used: Set<string>;
  } {
    const defined = new Map<string, number[]>();
    const used = new Set<string>();

    // Finde Variablendeklarationen
    const declPattern = /\b(induce|implant|embed|freeze|sharedTrance)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    while ((match = declPattern.exec(text)) !== null) {
      const varName = match[2];
      if (!defined.has(varName)) {
        defined.set(varName, []);
      }
      const indices = defined.get(varName);
      if (indices) {
        indices.push(match.index);
      }
    }

    // Finde Variablenverwendungen (vereinfacht)
    defined.forEach((_, varName) => {
      const usePattern = new RegExp(`\\b${varName}\\b`, 'g');
      let count = 0;
      while (usePattern.exec(text) !== null) {
        count++;
      }
      // Wenn mehr als einmal vorkommt (mehr als nur Deklaration), als verwendet markieren
      if (count > 1) {
        used.add(varName);
      }
    });

    return { defined, used };
  }

  // ========== STYLE-CHECKS ==========

  /**
   * Prüft Code-Style
   */
  private checkStyle(_document: vscode.TextDocument, _text: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // TODO: Implementiere Style-Checks
    // - Einrückung
    // - Naming Conventions
    // - Leerzeichen um Operatoren
    // - etc.

    return diagnostics;
  }

  // ========== HILFSFUNKTIONEN ==========

  /**
   * Entfernt Kommentare und Strings aus dem Text
   */
  private removeCommentsAndStrings(text: string): string {
    // Entferne Strings
    let cleaned = text.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    // Entferne einzeilige Kommentare
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    // Entferne mehrzeilige Kommentare
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    return cleaned;
  }

  /**
   * Erstellt ein Diagnostic-Objekt
   */
  private createDiagnostic(
    range: vscode.Range,
    message: string,
    level: DiagnosticLevel,
    code?: string
  ): vscode.Diagnostic {
    const severity = this.getSeverity(level);
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    if (code) {
      diagnostic.code = code;
    }
    diagnostic.source = 'HypnoScript';
    return diagnostic;
  }

  /**
   * Konvertiert DiagnosticLevel zu vscode.DiagnosticSeverity
   */
  private getSeverity(level: DiagnosticLevel): vscode.DiagnosticSeverity {
    switch (level) {
      case DiagnosticLevel.ERROR:
        return vscode.DiagnosticSeverity.Error;
      case DiagnosticLevel.WARNING:
        return vscode.DiagnosticSeverity.Warning;
      case DiagnosticLevel.INFO:
        return vscode.DiagnosticSeverity.Information;
      case DiagnosticLevel.HINT:
        return vscode.DiagnosticSeverity.Hint;
    }
  }
}
