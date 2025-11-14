import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CompletionItemKind,
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { logger } from './config';
import { t } from './i18n';
import { LocalTranslations } from './interfaces/localTranslations';
import { keywordCompletionList, standardLibraryFunctions } from './languageFacts';

// Verbindung zum Editor herstellen
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // hoverProvider entfernt, damit keine doppelten Hovers (Deutsch und Englisch) angezeigt werden:
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
});

connection.onRequest('textDocument/diagnostic', (_params) => {
  try {
    return {
      items: [
        {
          message: t('no_diagnostics' as keyof LocalTranslations),
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
          severity: 0,
        },
      ],
    };
  } catch (error) {
    logger.error(t('error_in_diagnostic_request' as keyof LocalTranslations) + String(error));
    throw error;
  }
});

// 🔍 Auto-Completion Handler
connection.onCompletion(() => {
  const keywordSuggestions = keywordCompletionList.map((keyword) => ({
    label: keyword,
    kind: CompletionItemKind.Keyword,
  }));

  const stdLibSuggestions = standardLibraryFunctions.map((fn) => ({
    label: fn,
    kind: CompletionItemKind.Function,
    detail: t('builtin_function_hint' as keyof LocalTranslations),
  }));

  return [...keywordSuggestions, ...stdLibSuggestions];
});

// Neue Funktion zur Syntax-Analyse
function checkSyntaxErrors(document: TextDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();

  // 1. Überprüfe ob 'Focus {' vorhanden ist.
  if (!/Focus\s*\{/.test(text)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 5 },
      },
      message: t('error_no_focus'),
      source: 'hypnoscript-linter',
      code: 'HS_NO_FOCUS',
    });
  }

  const focusMatches = [...text.matchAll(/\bFocus\b/g)].length;
  const relaxMatches = [...text.matchAll(/\bRelax\b/g)].length;

  if (focusMatches > 1) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 5 },
      },
      message: t('error_multiple_focus'),
      source: 'hypnoscript-linter',
    });
  }

  // 2. Überprüfe ob '} Relax' vorhanden ist.
  if (!/\}\s*Relax/.test(text)) {
    const lastLine = text.split('\n').length - 1;
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: lastLine, character: 0 },
        end: { line: lastLine, character: 5 },
      },
      message: t('error_no_relax'),
      source: 'hypnoscript-linter',
      code: 'HS_NO_RELAX',
    });
  }

  if (relaxMatches > 1) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 5 },
      },
      message: t('error_multiple_relax'),
      source: 'hypnoscript-linter',
    });
  }

  if (focusMatches > 0 && relaxMatches > 0) {
    const firstFocus = text.indexOf('Focus');
    const lastRelax = text.lastIndexOf('Relax');
    if (firstFocus > lastRelax) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 5 },
        },
        message: t('error_focus_order'),
        source: 'hypnoscript-linter',
      });
    }
  }

  // 3. Überprüfe auf unbalancierte geschweifte Klammern.
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 },
      },
      message: t('error_unbalanced_braces'),
      source: 'hypnoscript-linter',
    });
  }

  // 4. Überprüfe auf fehlende Strichpunkte am Zeilenende.
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

  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Ignoriere leere Zeilen, Kommentare, Blockstrukturen, Relax
    if (
      !trimmed ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.endsWith('{') ||
      trimmed.endsWith('}') ||
      trimmed === '}' ||
      trimmed.includes('Relax') ||
      trimmed === 'Relax' ||
      /^(Focus|entrance|finale|session|trigger|if|else|while|loop|pendulum)/.test(trimmed)
    ) {
      return;
    }

    // Ignoriere Zeilen mit offenen Klammern/Brackets (mehrzeilige Konstrukte)
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    const openBrackets = (trimmed.match(/\[/g) || []).length;
    const closeBrackets = (trimmed.match(/\]/g) || []).length;

    if (openParens > closeParens || openBrackets > closeBrackets) {
      return;
    }

    // Prüfe nur Zeilen, die mit Statement-Keywords beginnen
    const startsWithKeyword = statementKeywords.some((kw) =>
      new RegExp(`^\\s*${kw}\\b`).test(trimmed)
    );

    if (startsWithKeyword && !trimmed.endsWith(';') && !trimmed.endsWith('{')) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: idx, character: 0 },
          end: { line: idx, character: trimmed.length },
        },
        message: t('error_missing_semicolon'),
        source: 'hypnoscript-linter',
        code: 'HS_MISSING_SEMICOLON',
      });
    }
  });
  return diagnostics;
}

// Erweiterung des onDidChangeContent-Handlings:
documents.onDidChangeContent((change) => {
  try {
    const diagnostics: Diagnostic[] = [];
    diagnostics.push(...checkSyntaxErrors(change.document));
    void connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
  } catch (error) {
    logger.error('Fehler beim Verarbeiten von Inhaltänderungen: ' + String(error));
  }
});

documents.listen(connection);
connection.listen();
