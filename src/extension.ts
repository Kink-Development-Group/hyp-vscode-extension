import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { config, logger } from './config';
import { HypnoScriptFormatter } from './formatter';
import { setLocale, t } from './i18n';
import {
  completionTriggerCharacters,
  hoverTranslationKeys,
  keywordCompletionList,
  snippetTemplates,
  standardLibraryFunctions,
} from './languageFacts';

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  try {
    const locale = vscode.env.language || 'en';
    await setLocale(locale);

    logger.info(
      t('extension_activation') +
        ` (Mode: ${config.environment}, Locale: ${locale})`
    );

    const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));

    const createKeywordCompletionItems = () =>
      keywordCompletionList.map((keyword) => {
        const item = new vscode.CompletionItem(
          keyword,
          vscode.CompletionItemKind.Keyword
        );
        item.insertText = `${keyword} `;
        return item;
      });

    const createStdLibCompletionItems = () =>
      standardLibraryFunctions.map((fn) => {
        const item = new vscode.CompletionItem(
          fn,
          vscode.CompletionItemKind.Function
        );
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
          return [
            ...createKeywordCompletionItems(),
            ...createStdLibCompletionItems(),
          ];
        },
      },
      ...completionTriggerCharacters
    );

    const buildSnippetItems = () =>
      snippetTemplates.map((template) => {
        const item = new vscode.CompletionItem(
          template.label,
          vscode.CompletionItemKind.Snippet
        );
        if (template.detailKey) {
          item.detail = t(template.detailKey);
        } else if (template.detail) {
          item.detail = template.detail;
        }
        if (template.documentationKey) {
          item.documentation = new vscode.MarkdownString(
            t(template.documentationKey)
          );
        } else if (template.documentation) {
          item.documentation = new vscode.MarkdownString(
            template.documentation
          );
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

    const structureCompletionProvider =
      vscode.languages.registerCompletionItemProvider(
        'hypnoscript',
        {
          provideCompletionItems() {
            return buildSnippetItems();
          },
        },
        ...snippetTriggerCharacters
      );

    const hoverProvider = vscode.languages.registerHoverProvider(
      'hypnoscript',
      {
        provideHover(document, position) {
          const range = document.getWordRangeAtPosition(position);
          if (!range) {
            return;
          }
          const word = document.getText(range);
          const translationKey = hoverTranslationKeys[word];
          if (translationKey) {
            return new vscode.Hover(
              new vscode.MarkdownString(t(translationKey))
            );
          }
          return;
        },
      }
    );

    const formatterProvider =
      vscode.languages.registerDocumentFormattingEditProvider(
        'hypnoscript',
        new HypnoScriptFormatter()
      );

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

    context.subscriptions.push(hoverProvider);
    context.subscriptions.push(completionProvider);
    context.subscriptions.push(structureCompletionProvider);
    context.subscriptions.push(formatterProvider);

    client.start();

    // Neuen Listener für Diagnosen mit internationalisierten Texten hinzufügen:
    vscode.languages.onDidChangeDiagnostics(() => {
      const errorDiagnostics = vscode.window.visibleTextEditors
        .filter((editor) => editor.document.languageId === 'hypnoscript')
        .flatMap((editor) =>
          vscode.languages.getDiagnostics(editor.document.uri)
        )
        .filter((diag) => diag.severity === vscode.DiagnosticSeverity.Error);

      if (errorDiagnostics.length > 0) {
        vscode.window
          .showErrorMessage(
            t('diagnostic_error_popup'),
            t('diagnostic_solution_button')
          )
          .then((selection) => {
            if (selection === t('diagnostic_solution_button')) {
              vscode.window.showInformationMessage(
                t('diagnostic_solution_message')
              );
            }
          });
      }
    });
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
