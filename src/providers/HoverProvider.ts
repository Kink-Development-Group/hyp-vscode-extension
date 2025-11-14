import * as vscode from 'vscode';
import { t } from '../i18n';
import { hoverTranslationKeys } from '../languageFacts';

/**
 * HypnoScript Hover Provider
 * Zeigt erweiterte Informationen beim Hovern über Code-Elemente
 */
export class HypnoScriptHoverProvider implements vscode.HoverProvider {
  /**
   * Generiert Hover-Informationen
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return undefined;
    }

    const word = document.getText(range);

    // Keywords
    const translationKey = hoverTranslationKeys[word];
    if (translationKey) {
      return new vscode.Hover(this.createKeywordHover(word, translationKey), range);
    }

    // Operatoren
    if (this.isHypnoticOperator(word)) {
      return new vscode.Hover(this.createOperatorHover(word), range);
    }

    // Funktionsaufrufe
    if (this.isFunctionCall(document, position)) {
      return new vscode.Hover(this.createFunctionHover(word), range);
    }

    return undefined;
  }

  /**
   * Erstellt Hover für Keywords
   */
  private createKeywordHover(word: string, translationKey: string): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    const translation = t(translationKey as any);
    md.appendMarkdown(translation);

    // Zusätzliche Informationen basierend auf Keyword
    if (word === 'Focus' || word === 'Relax') {
      md.appendMarkdown('\n\n---\n');
      md.appendMarkdown(
        '💡 **Tipp:** Jedes HypnoScript-Programm muss mit `Focus {` beginnen und mit `} Relax` enden.'
      );
    } else if (word === 'entrance') {
      md.appendMarkdown('\n\n---\n');
      md.appendMarkdown(
        '💡 **Tipp:** Der `entrance`-Block wird vor allem anderen Code ausgeführt – ideal für Initialisierungen.'
      );
    } else if (word === 'mesmerize') {
      md.appendMarkdown('\n\n---\n');
      md.appendMarkdown(
        '💡 **Async:** Verwende `mesmerize suggestion` für asynchrone Funktionen. Innerhalb kannst du `await` verwenden.'
      );
    }

    return md;
  }

  /**
   * Erstellt Hover für Operatoren
   */
  private createOperatorHover(operator: string): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;

    const operatorMap: Record<string, { standard: string; description: string }> = {
      youAreFeelingVerySleepy: {
        standard: '==',
        description: 'Prüft auf Gleichheit',
      },
      youCannotResist: {
        standard: '!=',
        description: 'Prüft auf Ungleichheit',
      },
      lookAtTheWatch: {
        standard: '>',
        description: 'Größer als',
      },
      fallUnderMySpell: {
        standard: '<',
        description: 'Kleiner als',
      },
      yourEyesAreGettingHeavy: {
        standard: '>=',
        description: 'Größer oder gleich',
      },
      goingDeeper: {
        standard: '<=',
        description: 'Kleiner oder gleich',
      },
      underMyControl: {
        standard: '&&',
        description: 'Logisches UND',
      },
      resistanceIsFutile: {
        standard: '||',
        description: 'Logisches ODER',
      },
      lucidFallback: {
        standard: '??',
        description: 'Nullish Coalescing - Rückgabewert wenn links null/undefined',
      },
      dreamReach: {
        standard: '?.',
        description: 'Optional Chaining - Sicherer Zugriff auf möglicherweise null-Werte',
      },
    };

    const info = operatorMap[operator];
    if (info) {
      md.appendMarkdown(`### 🌀 Hypnotischer Operator\n\n`);
      md.appendMarkdown(`**\`${operator}\`** ≡ \`${info.standard}\`\n\n`);
      md.appendMarkdown(`${info.description}\n\n`);
      md.appendMarkdown('---\n\n');
      md.appendMarkdown(
        `Beispiel:\n\`\`\`hypnoscript\nif (x ${operator} y) {\n    observe "Bedingung erfüllt";\n}\n\`\`\``
      );
    }

    return md;
  }

  /**
   * Erstellt Hover für Funktionen
   */
  private createFunctionHover(functionName: string): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;

    // Standard-Library-Funktionen
    const functionDocs = this.getFunctionDocumentation(functionName);
    if (functionDocs) {
      md.appendMarkdown(`### $(symbol-method) ${functionName}\n\n`);
      md.appendMarkdown(functionDocs);
    }

    return md;
  }

  /**
   * Prüft, ob ein Wort ein hypnotischer Operator ist
   */
  private isHypnoticOperator(word: string): boolean {
    const operators = [
      'youAreFeelingVerySleepy',
      'youCannotResist',
      'lookAtTheWatch',
      'fallUnderMySpell',
      'yourEyesAreGettingHeavy',
      'goingDeeper',
      'underMyControl',
      'resistanceIsFutile',
      'lucidFallback',
      'dreamReach',
    ];
    return operators.includes(word);
  }

  /**
   * Prüft, ob an einer Position ein Funktionsaufruf steht
   */
  private isFunctionCall(document: vscode.TextDocument, position: vscode.Position): boolean {
    const line = document.lineAt(position.line).text;
    const charAfter = line.charAt(position.character);
    return charAfter === '(';
  }

  /**
   * Gibt Dokumentation für Standard-Library-Funktionen zurück
   */
  private getFunctionDocumentation(name: string): string | undefined {
    const docs: Record<string, string> = {
      // Math functions
      hypnoticPi: '**Konstante:** π (Pi) ≈ 3.14159',
      pendulumSin: '**Trigonometrie:** Sinus-Funktion\n\n`pendulumSin(angle: number): number`',
      pendulumCos: '**Trigonometrie:** Kosinus-Funktion\n\n`pendulumCos(angle: number): number`',
      power:
        '**Potenz:** Berechnet Basis^Exponent\n\n`power(base: number, exponent: number): number`',
      squareRoot: '**Wurzel:** Berechnet die Quadratwurzel\n\n`squareRoot(value: number): number`',

      // String functions
      trimEdges:
        '**String:** Entfernt Leerzeichen am Anfang und Ende\n\n`trimEdges(text: string): string`',
      measureDepth:
        '**String:** Gibt die Länge eines Strings zurück\n\n`measureDepth(text: string): number`',
      toUpper: '**String:** Konvertiert zu Großbuchstaben\n\n`toUpper(text: string): string`',
      toLower: '**String:** Konvertiert zu Kleinbuchstaben\n\n`toLower(text: string): string`',

      // Array functions
      fragmentMemory:
        '**Array:** Teilt einen String in ein Array\n\n`fragmentMemory(text: string, delimiter: string): Array<string>`',
      vaultSize: '**Array:** Gibt die Array-Länge zurück\n\n`vaultSize(array: Array<any>): number`',
      sortMemories:
        '**Array:** Sortiert ein Array\n\n`sortMemories(array: Array<any>): Array<any>`',

      // Control flow
      repeatAction:
        '**Control Flow:** Führt eine Aktion n-mal aus\n\n`repeatAction(count: number, action: suggestion): void`',
      delayedSuggestion:
        '**Control Flow:** Führt eine Aktion nach Verzögerung aus\n\n`delayedSuggestion(ms: number, action: suggestion): void`',

      // Hypnotic functions
      HypnoticVisualization:
        '**Hypnotic:** Visualisierungs-Funktion\n\n`HypnoticVisualization(scene: string): void`',
      TranceDeepening:
        '**Hypnotic:** Vertieft den Trance-Zustand\n\n`TranceDeepening(level: number): void`',
    };

    return docs[name];
  }
}
