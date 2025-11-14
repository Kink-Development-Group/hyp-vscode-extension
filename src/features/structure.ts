import {
  DocumentSymbol,
  FoldingRange,
  FoldingRangeKind,
  Position,
  Range,
  SymbolKind,
  TextDocument,
} from 'vscode';

const sessionPattern = /^\s*session\s+([A-Za-z_][A-Za-z0-9_]*)/;
const suggestionPattern = /^\s*suggestion\s+([A-Za-z_][A-Za-z0-9_]*)/;
const triggerPattern = /^\s*trigger\s+([A-Za-z_][A-Za-z0-9_]*)/;
const tranceifyPattern = /^\s*tranceify\s+([A-Za-z_][A-Za-z0-9_]*)/;
const focusPattern = /^\s*Focus\b/;
const deepFocusPattern = /^\s*deepFocus\b/;

export function collectDocumentSymbols(
  document: TextDocument
): DocumentSymbol[] {
  const symbols: DocumentSymbol[] = [];
  let line = 0;

  while (line < document.lineCount) {
    const textLine = document.lineAt(line);
    const text = textLine.text;

    if (focusPattern.test(text)) {
      const focusSymbol = createBlockSymbol(
        document,
        line,
        'Focus',
        'Focus block',
        SymbolKind.Module,
        text.indexOf('{')
      );
      symbols.push(focusSymbol.symbol);
      line += 1;
      continue;
    }

    const sessionMatch = sessionPattern.exec(text);
    if (sessionMatch) {
      const sessionName = sessionMatch[1];
      const sessionSymbol = createBlockSymbol(
        document,
        line,
        sessionName,
        'session',
        SymbolKind.Class,
        text.indexOf('{')
      );
      sessionSymbol.symbol.children = collectNestedSymbols(
        document,
        sessionSymbol.symbol.range
      );
      symbols.push(sessionSymbol.symbol);
      line = sessionSymbol.endLine + 1;
      continue;
    }

    const tranceifyMatch = tranceifyPattern.exec(text);
    if (tranceifyMatch) {
      const tranceName = tranceifyMatch[1];
      const tranceSymbol = createBlockSymbol(
        document,
        line,
        tranceName,
        'tranceify',
        SymbolKind.Struct,
        text.indexOf('{')
      );
      symbols.push(tranceSymbol.symbol);
      line = tranceSymbol.endLine + 1;
      continue;
    }

    const suggestionMatch = suggestionPattern.exec(text);
    if (suggestionMatch) {
      const suggestionName = suggestionMatch[1];
      const suggestionSymbol = createBlockSymbol(
        document,
        line,
        suggestionName,
        'suggestion',
        SymbolKind.Method,
        text.indexOf('{')
      );
      symbols.push(suggestionSymbol.symbol);
      line = suggestionSymbol.endLine + 1;
      continue;
    }

    const triggerMatch = triggerPattern.exec(text);
    if (triggerMatch) {
      const triggerName = triggerMatch[1];
      const triggerSymbol = createBlockSymbol(
        document,
        line,
        triggerName,
        'trigger',
        SymbolKind.Event,
        text.indexOf('{')
      );
      symbols.push(triggerSymbol.symbol);
      line = triggerSymbol.endLine + 1;
      continue;
    }

    if (deepFocusPattern.test(text)) {
      const deepFocusSymbol = createBlockSymbol(
        document,
        line,
        'deepFocus',
        'block',
        SymbolKind.Namespace,
        text.indexOf('{')
      );
      symbols.push(deepFocusSymbol.symbol);
      line = deepFocusSymbol.endLine + 1;
      continue;
    }

    line += 1;
  }

  return symbols;
}

export function collectFoldingRanges(document: TextDocument): FoldingRange[] {
  const ranges: FoldingRange[] = [];

  for (let line = 0; line < document.lineCount; line++) {
    const text = document.lineAt(line).text;
    const isBlockLine =
      focusPattern.test(text) ||
      sessionPattern.test(text) ||
      suggestionPattern.test(text) ||
      tranceifyPattern.test(text) ||
      triggerPattern.test(text) ||
      deepFocusPattern.test(text);

    if (!isBlockLine) {
      continue;
    }

    const blockStartIndex = text.indexOf('{');
    const openingBrace = locateOpeningBrace(
      document,
      line,
      blockStartIndex >= 0 ? blockStartIndex : 0
    );
    if (!openingBrace) {
      continue;
    }
    const blockEnd = findBlockEndPosition(document, openingBrace);
    if (blockEnd.line > line) {
      ranges.push(
        new FoldingRange(line, blockEnd.line, FoldingRangeKind.Region)
      );
    }
    line = blockEnd.line;
    continue;
  }

  return ranges;
}

function collectNestedSymbols(
  document: TextDocument,
  parentRange: Range
): DocumentSymbol[] {
  const children: DocumentSymbol[] = [];

  let line = parentRange.start.line + 1;
  while (line < parentRange.end.line) {
    const text = document.lineAt(line).text;

    const suggestionMatch = suggestionPattern.exec(text);
    if (suggestionMatch) {
      const suggestionName = suggestionMatch[1];
      const symbol = createBlockSymbol(
        document,
        line,
        suggestionName,
        'suggestion',
        SymbolKind.Method,
        text.indexOf('{')
      );
      children.push(symbol.symbol);
      line = symbol.endLine + 1;
      continue;
    }

    const triggerMatch = triggerPattern.exec(text);
    if (triggerMatch) {
      const triggerName = triggerMatch[1];
      const symbol = createBlockSymbol(
        document,
        line,
        triggerName,
        'trigger',
        SymbolKind.Event,
        text.indexOf('{')
      );
      children.push(symbol.symbol);
      line = symbol.endLine + 1;
      continue;
    }

    line += 1;
  }

  return children;
}

function createBlockSymbol(
  document: TextDocument,
  line: number,
  name: string,
  detail: string,
  kind: SymbolKind,
  braceHintIndex: number
): { symbol: DocumentSymbol; endLine: number } {
  const declarationLine = document.lineAt(line);
  const selectionStart = declarationLine.text.indexOf(name);
  const selectionRange = new Range(
    new Position(line, Math.max(selectionStart, 0)),
    new Position(line, Math.max(selectionStart, 0) + name.length)
  );

  const openingBrace = locateOpeningBrace(
    document,
    line,
    braceHintIndex >= 0 ? braceHintIndex : 0
  );
  const blockEnd = openingBrace
    ? findBlockEndPosition(document, openingBrace)
    : declarationLine.range.end;

  const fullRange = new Range(
    new Position(line, 0),
    blockEnd.line > line
      ? new Position(blockEnd.line, document.lineAt(blockEnd.line).text.length)
      : blockEnd
  );

  const symbol = new DocumentSymbol(
    name,
    detail,
    kind,
    fullRange,
    selectionRange
  );

  return { symbol, endLine: fullRange.end.line };
}

function locateOpeningBrace(
  document: TextDocument,
  startLine: number,
  startCharacter: number
): Position | undefined {
  for (let line = startLine; line < document.lineCount; line++) {
    const text = document.lineAt(line).text;
    const searchStart = line === startLine ? Math.max(startCharacter, 0) : 0;
    const braceIndex = text.indexOf('{', searchStart);
    if (braceIndex !== -1) {
      return new Position(line, braceIndex);
    }
  }
  return undefined;
}

function findBlockEndPosition(
  document: TextDocument,
  openingBrace: Position
): Position {
  let balance = 0;
  for (let line = openingBrace.line; line < document.lineCount; line++) {
    const text = document.lineAt(line).text;
    const startIdx = line === openingBrace.line ? openingBrace.character : 0;
    for (let idx = startIdx; idx < text.length; idx++) {
      const char = text[idx];
      if (char === '{') {
        balance += 1;
      } else if (char === '}') {
        balance -= 1;
        if (balance === 0) {
          return new Position(line, idx);
        }
      }
    }
  }
  return document.lineAt(document.lineCount - 1).range.end;
}
