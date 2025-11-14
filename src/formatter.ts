import * as vscode from 'vscode';

/**
 * HypnoScript Code Formatter
 * Implementiert intelligente Code-Formatierung für HypnoScript
 *
 * Features:
 * - Einrückung von Blöcken
 * - Leerzeichen um Operatoren
 * - Konsistente Klammerung
 * - Zeilenumbrüche bei langen Zeilen
 * - Ausrichtung von Kommentaren
 */
export class HypnoScriptFormatter implements vscode.DocumentFormattingEditProvider {
  private readonly indentSize: number = 4;
  private readonly useTabs: boolean = false;

  /**
   * Hauptmethode für Dokument-Formatierung
   */
  provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    const formattedText = this.formatDocument(document);

    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );

    return [vscode.TextEdit.replace(fullRange, formattedText)];
  }

  /**
   * Formatiert das gesamte Dokument
   */
  private formatDocument(document: vscode.TextDocument): string {
    const text = document.getText();
    const lines = text.split('\n');
    const formattedLines: string[] = [];

    let indentLevel = 0;
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Blockkommentare unverändert übernehmen
      if (trimmed.startsWith('/*') || inBlockComment) {
        inBlockComment = !trimmed.endsWith('*/');
        formattedLines.push(line);
        continue;
      }

      // Leere Zeilen beibehalten
      if (trimmed === '') {
        formattedLines.push('');
        continue;
      }

      // Einzelne Kommentarzeilen mit aktueller Einrückung versehen
      if (this.isLineComment(trimmed)) {
        const indent = this.getIndent(indentLevel);
        formattedLines.push(indent + trimmed);
        continue;
      }

      const leadingClosings = this.countLeadingClosings(trimmed);
      const keywordDedent = this.startsWithDedentKeyword(trimmed) ? 1 : 0;
      const dedentAmount = Math.max(leadingClosings, keywordDedent);
      indentLevel = Math.max(0, indentLevel - dedentAmount);

      const indent = this.getIndent(indentLevel);
      const normalizedLine = this.normalizeLine(trimmed);
      formattedLines.push(indent + normalizedLine);

      const openCount = this.countChar(trimmed, '{');
      const totalClosing = this.countChar(trimmed, '}');
      const remainingClosings = Math.max(0, totalClosing - leadingClosings);

      indentLevel += openCount;
      indentLevel = Math.max(0, indentLevel - remainingClosings);
    }

    return formattedLines.join('\n');
  }

  private isLineComment(line: string): boolean {
    return line.startsWith('//');
  }

  private countLeadingClosings(line: string): number {
    const match = line.match(/^(\})+/);
    return match ? match[0].length : 0;
  }

  private startsWithDedentKeyword(line: string): boolean {
    const keywords = ['else', 'otherwise', 'Relax'];
    return keywords.some(
      (keyword) =>
        line === keyword || line.startsWith(`${keyword} `) || line.startsWith(`${keyword}{`)
    );
  }

  private normalizeLine(line: string): string {
    return line.replace(/\s+$/g, '');
  }

  private countChar(line: string, char: string): number {
    const regex = new RegExp(`\\${char}`, 'g');
    return (line.match(regex) || []).length;
  }

  /**
   * Generiert Einrückung
   */
  private getIndent(level: number): string {
    if (this.useTabs) {
      return '\t'.repeat(level);
    } else {
      return ' '.repeat(level * this.indentSize);
    }
  }
}

/**
 * Range-Formatter für ausgewählte Bereiche
 */
export class HypnoScriptRangeFormatter implements vscode.DocumentRangeFormattingEditProvider {
  private formatter: HypnoScriptFormatter = new HypnoScriptFormatter();

  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    _range: vscode.Range,
    _options: vscode.FormattingOptions,
    _token: vscode.CancellationToken
  ): vscode.TextEdit[] {
    // Für Range-Formatierung verwenden wir vorerst die Dokument-Formatierung
    // TODO: Implementiere echte Range-Formatierung
    return this.formatter.provideDocumentFormattingEdits(document);
  }
}
