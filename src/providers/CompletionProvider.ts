import * as vscode from 'vscode';
import { t } from '../i18n';
import {
  arrayFunctions,
  controlFlowHelpers,
  coreKeywords,
  hypnoticFunctions,
  mathFunctions,
  operatorSynonyms,
  stringFunctions,
  systemFunctions,
  typeKeywords,
} from '../languageFacts';

/**
 * Context-aware completion provider für HypnoScript
 * Implementiert intelligente Code-Vervollständigung basierend auf dem aktuellen Kontext
 */
export class HypnoScriptCompletionProvider
  implements vscode.CompletionItemProvider
{
  /**
   * Hauptmethode für Code-Vervollständigung
   */
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const lineText = document.lineAt(position.line).text;
    const linePrefix = lineText.substring(0, position.character);

    // Kontext-spezifische Vervollständigung
    const completions: vscode.CompletionItem[] = [];

    // Nach 'induce', 'implant', 'embed' -> Typ-Vorschläge
    if (this.isInVariableDeclaration(linePrefix)) {
      completions.push(...this.getTypeCompletions());
    }
    // Nach ':' in Funktionssignaturen -> Typ-Vorschläge
    else if (this.isInTypeAnnotation(linePrefix)) {
      completions.push(...this.getTypeCompletions());
    }
    // Am Anfang einer Zeile oder nach '{' -> Statement-Keywords
    else if (this.isAtStatementStart(linePrefix)) {
      completions.push(...this.getStatementKeywords());
    }
    // In Bedingungen -> Operatoren
    else if (this.isInCondition(linePrefix)) {
      completions.push(...this.getOperatorCompletions());
    }
    // Nach 'session' oder 'tranceify' -> OOP-Keywords
    else if (this.isInClassContext(linePrefix)) {
      completions.push(...this.getClassMemberKeywords());
    }
    // Standard-Bibliothek basierend auf Kontext
    else if (this.isInFunctionCall(linePrefix)) {
      completions.push(...this.getStandardLibraryCompletions(linePrefix));
    }

    // Immer verfügbar: Alle Keywords und Funktionen
    completions.push(...this.getAllKeywords());
    completions.push(...this.getStandardLibraryCompletions());

    return completions;
  }

  /**
   * Erweiterte Informationen beim Hovern über Completion-Item
   */
  resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    // Erweiterte Dokumentation für bestimmte Items
    return item;
  }

  // ========== KONTEXT-ERKENNUNG ==========

  private isInVariableDeclaration(linePrefix: string): boolean {
    return /\b(induce|implant|embed|freeze|sharedTrance)\s+\w*$/.test(
      linePrefix
    );
  }

  private isInTypeAnnotation(linePrefix: string): boolean {
    return /:\s*\w*$/.test(linePrefix);
  }

  private isAtStatementStart(linePrefix: string): boolean {
    const trimmed = linePrefix.trim();
    return trimmed === '' || trimmed.endsWith('{') || trimmed.endsWith(';');
  }

  private isInCondition(linePrefix: string): boolean {
    return /\b(if|while|when)\s*\([^)]*$/.test(linePrefix);
  }

  private isInClassContext(linePrefix: string): boolean {
    return /\b(session|tranceify)\s+\w+\s*\{[^}]*$/.test(linePrefix);
  }

  private isInFunctionCall(linePrefix: string): boolean {
    return /\w+\s*\($/.test(linePrefix);
  }

  // ========== COMPLETION-GENERIERUNG ==========

  /**
   * Typ-Completions (number, string, boolean, trance, lucid)
   */
  private getTypeCompletions(): vscode.CompletionItem[] {
    return typeKeywords.map((type) => {
      const item = new vscode.CompletionItem(
        type,
        vscode.CompletionItemKind.TypeParameter
      );
      item.insertText = type;
      item.documentation = new vscode.MarkdownString(
        this.getTypeDocumentation(type)
      );
      return item;
    });
  }

  /**
   * Statement-Keywords (Focus, Relax, entrance, etc.)
   */
  private getStatementKeywords(): vscode.CompletionItem[] {
    return coreKeywords.map((keyword) => {
      const item = new vscode.CompletionItem(
        keyword,
        this.getKeywordKind(keyword)
      );
      item.insertText = this.getKeywordSnippet(keyword);
      item.documentation = new vscode.MarkdownString(
        this.getKeywordDocumentation(keyword)
      );
      item.sortText = this.getKeywordSortPriority(keyword);
      return item;
    });
  }

  /**
   * Operator-Completions (hypnotische Synonyme)
   */
  private getOperatorCompletions(): vscode.CompletionItem[] {
    return operatorSynonyms.map((operator) => {
      const item = new vscode.CompletionItem(
        operator,
        vscode.CompletionItemKind.Operator
      );
      item.insertText = operator;
      item.documentation = new vscode.MarkdownString(
        this.getOperatorDocumentation(operator)
      );
      item.detail = this.getOperatorDetail(operator);
      return item;
    });
  }

  /**
   * Class-Member-Keywords (expose, conceal, constructor)
   */
  private getClassMemberKeywords(): vscode.CompletionItem[] {
    const keywords = [
      'expose',
      'conceal',
      'dominant',
      'constructor',
      'suggestion',
    ];
    return keywords.map((keyword) => {
      const item = new vscode.CompletionItem(
        keyword,
        vscode.CompletionItemKind.Keyword
      );
      item.insertText = keyword;
      return item;
    });
  }

  /**
   * Standard-Library-Completions mit Kategorisierung
   */
  private getStandardLibraryCompletions(
    context?: string
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Alle Standard-Library-Funktionen
    completions.push(...this.createFunctionCompletions(mathFunctions, 'Math'));
    completions.push(
      ...this.createFunctionCompletions(stringFunctions, 'String')
    );
    completions.push(
      ...this.createFunctionCompletions(arrayFunctions, 'Array')
    );
    completions.push(
      ...this.createFunctionCompletions(hypnoticFunctions, 'Hypnotic')
    );
    completions.push(
      ...this.createFunctionCompletions(systemFunctions, 'System')
    );
    completions.push(
      ...this.createFunctionCompletions(controlFlowHelpers, 'Control Flow')
    );

    return completions;
  }

  /**
   * Alle Keywords
   */
  private getAllKeywords(): vscode.CompletionItem[] {
    return [...coreKeywords, ...controlFlowHelpers].map((keyword) => {
      const item = new vscode.CompletionItem(
        keyword,
        vscode.CompletionItemKind.Keyword
      );
      item.sortText = `z_${keyword}`; // Niedrigere Priorität
      return item;
    });
  }

  // ========== HILFSFUNKTIONEN ==========

  /**
   * Erstellt Funktions-Completions mit Kategorie
   */
  private createFunctionCompletions(
    functions: readonly string[],
    category: string
  ): vscode.CompletionItem[] {
    return functions.map((func) => {
      const item = new vscode.CompletionItem(
        func,
        vscode.CompletionItemKind.Function
      );
      item.insertText = new vscode.SnippetString(`${func}($0)`);
      item.detail = `${category} - ${t('builtin_function_hint')}`;
      item.documentation = new vscode.MarkdownString(
        this.getFunctionDocumentation(func, category)
      );
      item.sortText = `a_${func}`; // Höhere Priorität für Funktionen
      return item;
    });
  }

  /**
   * Bestimmt den CompletionItemKind basierend auf dem Keyword
   */
  private getKeywordKind(keyword: string): vscode.CompletionItemKind {
    if (['Focus', 'Relax', 'entrance', 'finale'].includes(keyword)) {
      return vscode.CompletionItemKind.Module;
    }
    if (['if', 'else', 'while', 'loop', 'entrain', 'when'].includes(keyword)) {
      return vscode.CompletionItemKind.Keyword;
    }
    if (['induce', 'implant', 'embed', 'freeze'].includes(keyword)) {
      return vscode.CompletionItemKind.Variable;
    }
    if (['suggestion', 'trigger'].includes(keyword)) {
      return vscode.CompletionItemKind.Function;
    }
    if (['session', 'tranceify'].includes(keyword)) {
      return vscode.CompletionItemKind.Class;
    }
    return vscode.CompletionItemKind.Keyword;
  }

  /**
   * Generiert Snippet für Keyword (optional)
   */
  private getKeywordSnippet(keyword: string): string | vscode.SnippetString {
    const snippets: Record<string, string> = {
      Focus: 'Focus {\n\t$0\n} Relax',
      entrance: 'entrance {\n\t$0\n}',
      finale: 'finale {\n\t$0\n}',
      if: 'if ($1) {\n\t$0\n}',
      while: 'while ($1) {\n\t$0\n}',
      suggestion: 'suggestion ${1:name}($2): ${3:type} {\n\t$0\n}',
      session: 'session ${1:Name} {\n\t$0\n}',
      tranceify: 'tranceify ${1:Name} {\n\t$0\n}',
    };

    return snippets[keyword]
      ? new vscode.SnippetString(snippets[keyword])
      : keyword;
  }

  /**
   * Sort-Priorität für Keywords
   */
  private getKeywordSortPriority(keyword: string): string {
    // Wichtige Keywords zuerst
    if (['Focus', 'Relax'].includes(keyword)) return 'aaa_' + keyword;
    if (['entrance', 'finale'].includes(keyword)) return 'aab_' + keyword;
    if (['if', 'else', 'while', 'loop'].includes(keyword))
      return 'aac_' + keyword;
    return 'b_' + keyword;
  }

  // ========== DOKUMENTATION ==========

  private getTypeDocumentation(type: string): string {
    const docs: Record<string, string> = {
      number: '**number** - Numerischer Typ für Ganzzahlen und Dezimalzahlen',
      string: '**string** - Text-Typ für Zeichenketten',
      boolean: '**boolean** - Wahrheitswert (true/false)',
      trance:
        '**trance** - Spezieller HypnoScript-Typ für bewusstseinserweiterte Werte',
      lucid:
        '**lucid** - Modifier für optionale/nullable Typen (z.B. `lucid string`)',
    };
    return docs[type] || type;
  }

  private getKeywordDocumentation(keyword: string): string {
    // Verwende i18n wenn verfügbar, sonst Fallback
    return `**${keyword}** - HypnoScript Keyword`;
  }

  private getOperatorDocumentation(operator: string): string {
    const docs: Record<string, string> = {
      youAreFeelingVerySleepy: 'Hypnotisches Synonym für `==` (Gleichheit)',
      youCannotResist: 'Hypnotisches Synonym für `!=` (Ungleichheit)',
      lookAtTheWatch: 'Hypnotisches Synonym für `>` (Größer als)',
      fallUnderMySpell: 'Hypnotisches Synonym für `<` (Kleiner als)',
      yourEyesAreGettingHeavy:
        'Hypnotisches Synonym für `>=` (Größer oder gleich)',
      goingDeeper: 'Hypnotisches Synonym für `<=` (Kleiner oder gleich)',
      underMyControl: 'Hypnotisches Synonym für `&&` (Logisches UND)',
      resistanceIsFutile: 'Hypnotisches Synonym für `||` (Logisches ODER)',
      lucidFallback: 'Hypnotisches Synonym für `??` (Nullish Coalescing)',
      dreamReach: 'Hypnotisches Synonym für `?.` (Optional Chaining)',
    };
    return docs[operator] || operator;
  }

  private getOperatorDetail(operator: string): string {
    const details: Record<string, string> = {
      youAreFeelingVerySleepy: '== (equality)',
      youCannotResist: '!= (inequality)',
      lookAtTheWatch: '> (greater than)',
      fallUnderMySpell: '< (less than)',
      yourEyesAreGettingHeavy: '>= (greater or equal)',
      goingDeeper: '<= (less or equal)',
      underMyControl: '&& (logical AND)',
      resistanceIsFutile: '|| (logical OR)',
      lucidFallback: '?? (nullish coalescing)',
      dreamReach: '?. (optional chaining)',
    };
    return details[operator] || '';
  }

  private getFunctionDocumentation(func: string, category: string): string {
    return `$(symbol-method) **${func}** - ${category} function\n\nStandard library function from HypnoScript ${category} module.`;
  }
}
