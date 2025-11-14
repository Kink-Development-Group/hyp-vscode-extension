import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { config, logger } from './config';
import { HypnoScriptCodeActionProvider } from './features/codeActions';
import { collectDocumentSymbols, collectFoldingRanges } from './features/structure';
import { HypnoScriptFormatter, HypnoScriptRangeFormatter } from './formatter';
import { setLocale, t } from './i18n';
import {
  completionTriggerCharacters,
  hoverTranslationKeys,
  keywordCompletionList,
  snippetTemplates,
  standardLibraryFunctions,
} from './languageFacts';
import { HypnoScriptCompletionProvider } from './providers/CompletionProvider';
import { HypnoScriptDiagnosticProvider } from './providers/DiagnosticProvider';
import { HypnoScriptHoverProvider } from './providers/HoverProvider';

let client: LanguageClient;
let diagnosticProvider: HypnoScriptDiagnosticProvider;

export async function activate(context: vscode.ExtensionContext) {
  try {
    const locale = vscode.env.language || 'en';
    await setLocale(locale);

    logger.info(t('extension_activation') + ` (Mode: ${config.environment}, Locale: ${locale})`);

    const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));

    // ========== COMPLETION PROVIDERS ==========

    // Intelligente kontextbasierte Completion
    const intelligentCompletionProvider = vscode.languages.registerCompletionItemProvider(
      'hypnoscript',
      new HypnoScriptCompletionProvider(),
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    );

    // Legacy Keyword Completion (als Fallback)
    const createKeywordCompletionItems = () =>
      keywordCompletionList.map((keyword) => {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
        item.insertText = `${keyword} `;
        return item;
      });

    const createStdLibCompletionItems = () =>
      standardLibraryFunctions.map((fn) => {
        const item = new vscode.CompletionItem(fn, vscode.CompletionItemKind.Function);
        item.insertText = new vscode.SnippetString(`${fn}($0)`);
        item.detail = t('builtin_function_hint');
        item.documentation = new vscode.MarkdownString(
          `$(symbol-method) ${t('builtin_function_hint')}`
        );
        return item;
      });

    const completionProvider = vscode.languages.registerCompletionItemProvider(
      'hypnoscript',
      {
        provideCompletionItems() {
          return [...createKeywordCompletionItems(), ...createStdLibCompletionItems()];
        },
      },
      ...completionTriggerCharacters
    );

    const buildSnippetItems = () =>
      snippetTemplates.map((template) => {
        const item = new vscode.CompletionItem(template.label, vscode.CompletionItemKind.Snippet);
        if (template.detailKey) {
          item.detail = t(template.detailKey);
        } else if (template.detail) {
          item.detail = template.detail;
        }
        if (template.documentationKey) {
          item.documentation = new vscode.MarkdownString(t(template.documentationKey));
        } else if (template.documentation) {
          item.documentation = new vscode.MarkdownString(template.documentation);
        }
        item.insertText = new vscode.SnippetString(template.body);
        return item;
      });

    const snippetTriggerCharacters = Array.from(
      new Set(
        snippetTemplates
          .map((template) => template.label[0]?.toLowerCase())
          .filter((char): char is string => Boolean(char))
      )
    );

    const structureCompletionProvider = vscode.languages.registerCompletionItemProvider(
      'hypnoscript',
      {
        provideCompletionItems() {
          return buildSnippetItems();
        },
      },
      ...snippetTriggerCharacters
    );

    // ========== HOVER PROVIDER ==========

    // Intelligenter Hover Provider
    const intelligentHoverProvider = vscode.languages.registerHoverProvider(
      'hypnoscript',
      new HypnoScriptHoverProvider()
    );

    // Legacy Hover Provider (als Fallback)
    const hoverProvider = vscode.languages.registerHoverProvider('hypnoscript', {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
          return;
        }
        const word = document.getText(range);
        const translationKey = hoverTranslationKeys[word];
        if (translationKey) {
          return new vscode.Hover(new vscode.MarkdownString(t(translationKey)));
        }
        return;
      },
    });

    // ========== FORMATTERS ==========

    const formatterProvider = vscode.languages.registerDocumentFormattingEditProvider(
      'hypnoscript',
      new HypnoScriptFormatter()
    );

    const rangeFormatterProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(
      'hypnoscript',
      new HypnoScriptRangeFormatter()
    );

    // ========== DIAGNOSTICS ==========

    diagnosticProvider = new HypnoScriptDiagnosticProvider();

    // Analyse bei Dokumentänderungen
    const analyzeDocument = (document: vscode.TextDocument) => {
      if (document.languageId === 'hypnoscript') {
        diagnosticProvider.analyzeDo(document);
      }
    };

    // Event-Listener für Diagnostics
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(analyzeDocument),
      vscode.workspace.onDidChangeTextDocument((event) => {
        analyzeDocument(event.document);
      }),
      vscode.workspace.onDidSaveTextDocument(analyzeDocument),
      vscode.workspace.onDidCloseTextDocument((document) => {
        if (document.languageId === 'hypnoscript') {
          diagnosticProvider.clear(document);
        }
      })
    );

    // Initiale Analyse aller offenen Dokumente
    vscode.workspace.textDocuments.forEach(analyzeDocument);

    // ========== LANGUAGE SERVER ==========

    const serverOptions: ServerOptions = {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: { module: serverModule, transport: TransportKind.ipc },
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: 'file', language: 'hypnoscript' }],
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher('**/.hyp'),
      },
    };

    client = new LanguageClient(
      'hypnoscriptLanguageServer',
      'HypnoScript Language Server',
      serverOptions,
      clientOptions
    );

    // ========== DOCUMENT SYMBOLS & FOLDING ==========

    const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider('hypnoscript', {
      provideDocumentSymbols(document) {
        return collectDocumentSymbols(document);
      },
    });

    const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider('hypnoscript', {
      provideFoldingRanges(document) {
        return collectFoldingRanges(document);
      },
    });

    // ========== CODE ACTIONS ==========

    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
      'hypnoscript',
      new HypnoScriptCodeActionProvider(),
      {
        providedCodeActionKinds: HypnoScriptCodeActionProvider.providedCodeActionKinds,
      }
    );

    // ========== REGISTRIERUNG ==========

    context.subscriptions.push(
      intelligentCompletionProvider,
      intelligentHoverProvider,
      hoverProvider,
      completionProvider,
      structureCompletionProvider,
      formatterProvider,
      rangeFormatterProvider,
      diagnosticProvider.getCollection(),
      documentSymbolProvider,
      foldingRangeProvider,
      codeActionProvider
    );

    client.start();

    logger.info('HypnoScript extension fully activated');
  } catch (error) {
    logger.error('Fehler bei der Extension-Aktivierung: ' + error);
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
