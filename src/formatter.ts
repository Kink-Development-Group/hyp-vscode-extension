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
export class HypnoScriptFormatter
  implements vscode.DocumentFormattingEditProvider
{
  private readonly indentSize: number = 4;
  private readonly useTabs: boolean = false;

  /**
   * Hauptmethode für Dokument-Formatierung
   */
  async provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): Promise<vscode.TextEdit[]> {
    const config = vscode.workspace.getConfiguration('hypnoscript');
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

      // Blockkommentare tracken
      if (trimmed.startsWith('/*')) {
        inBlockComment = true;
      }
      if (inBlockComment) {
        formattedLines.push(line); // Kommentare nicht formatieren
        if (trimmed.endsWith('*/')) {
          inBlockComment = false;
        }
        continue;
      }

      // Leere Zeilen und Einzeilen-Kommentare beibehalten
      if (trimmed === '' || trimmed.startsWith('//')) {
        formattedLines.push(line);
        continue;
      }

      // Indent-Level anpassen VOR der Zeile
      if (this.isClosingBrace(trimmed)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Zeile formatieren
      let formattedLine = this.formatLine(trimmed);

      // Einrückung hinzufügen
      const indent = this.getIndent(indentLevel);
      formattedLine = indent + formattedLine;

      formattedLines.push(formattedLine);

      // Indent-Level anpassen NACH der Zeile
      if (this.isOpeningBrace(trimmed)) {
        indentLevel++;
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * Formatiert eine einzelne Zeile
   */
  private formatLine(line: string): string {
    let formatted = line;

    // Leerzeichen um Operatoren
    formatted = this.formatOperators(formatted);

    // Leerzeichen nach Kommas
    formatted = formatted.replace(/,(?!\s)/g, ', ');

    // Leerzeichen nach Keywords
    formatted = this.formatKeywords(formatted);

    // Keine Leerzeichen vor Semikolon
    formatted = formatted.replace(/\s+;/g, ';');

    // Klammern formatieren
    formatted = this.formatBraces(formatted);

    return formatted;
  }

  /**
   * Fügt Leerzeichen um Operatoren hinzu
   */
  private formatOperators(line: string): string {
    // Arithmetische Operatoren
    line = line.replace(/([+\-*/%])(?!\s)/g, '$1 ');
    line = line.replace(/(?<!\s)([+\-*/%])/g, ' $1');

    // Vergleichsoperatoren
    line = line.replace(/(==|!=|>=|<=|>|<)(?!\s)/g, '$1 ');
    line = line.replace(/(?<!\s)(==|!=|>=|<=|>|<)/g, ' $1');

    // Logische Operatoren
    line = line.replace(/(&&|\|\|)(?!\s)/g, '$1 ');
    line = line.replace(/(?<!\s)(&&|\|\|)/g, ' $1');

    // Zuweisung
    line = line.replace(/=(?!=)(?!\s)/g, '= ');
    line = line.replace(/(?<!\s)=(?!=)/g, ' =');

    // Hypnotische Operatoren (bereits Wörter, kein Spacing nötig)

    return line;
  }

  /**
   * Formatiert Keywords
   */
  private formatKeywords(line: string): string {
    const keywords = [
      'Focus',
      'Relax',
      'entrance',
      'finale',
      'if',
      'else',
      'while',
      'loop',
      'pendulum',
      'induce',
      'implant',
      'embed',
      'freeze',
      'sharedTrance',
      'suggestion',
      'awaken',
      'observe',
      'whisper',
      'command',
      'session',
      'tranceify',
      'expose',
      'conceal',
      'entrain',
      'when',
      'otherwise',
      'mesmerize',
      'await',
      'surrenderTo',
    ];

    keywords.forEach((keyword) => {
      // Leerzeichen nach Keyword (wenn gefolgt von Nicht-Leerzeichen)
      const pattern = new RegExp(`\\b${keyword}(?!\\s)`, 'g');
      line = line.replace(pattern, `${keyword} `);
    });

    return line;
  }

  /**
   * Formatiert Klammern
   */
  private formatBraces(line: string): string {
    // Öffnende Klammer mit Leerzeichen davor (außer bei Funktionsaufrufen)
    if (line.includes('{') && !line.match(/\w+\s*\{/)) {
      line = line.replace(/\{/g, ' {');
    }

    // Schließende Klammer auf eigener Zeile (wird im Haupt-Formatierungsprozess behandelt)

    return line;
  }

  /**
   * Prüft, ob eine Zeile eine öffnende Klammer enthält
   */
  private isOpeningBrace(line: string): boolean {
    // Zähle öffnende vs. schließende Klammern
    const openCount = (line.match(/\{/g) || []).length;
    const closeCount = (line.match(/\}/g) || []).length;
    return openCount > closeCount;
  }

  /**
   * Prüft, ob eine Zeile mit schließender Klammer beginnt
   */
  private isClosingBrace(line: string): boolean {
    return line.startsWith('}');
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
export class HypnoScriptRangeFormatter
  implements vscode.DocumentRangeFormattingEditProvider
{
  private formatter: HypnoScriptFormatter = new HypnoScriptFormatter();

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    // Für Range-Formatierung verwenden wir vorerst die Dokument-Formatierung
    // TODO: Implementiere echte Range-Formatierung
    return this.formatter.provideDocumentFormattingEdits(document);
  }
}
