# HypnoScript Support - VSCode Extension

Diese Erweiterung fügt Syntax-Highlighting, Auto-Completion und Linter-Support für HypnoScript-Dateien (`.hyp`) in Visual Studio Code hinzu.

## Funktionen

- ✅ Syntax-Highlighting für `.hyp`-Dateien
- ✅ Auto-Completion für alle aktuellen HypnoScript-Schlüsselwörter, Operator-Synonyme und Standardbibliotheken (MindStack, StringSpell, Hypno-Math, …)
- ✅ Kontext-Snippets für Sessions, Trigger, repeatAction, Focus/Relax-Grundgerüste u. v. m.
- ✅ Mehrsprachige Hover-Texte (DE/EN) für klassische und neue Sprachkonstrukte wie `freeze`, `whisper` oder `trigger`
- ✅ Erweiterter Linter mit Prüfungen für doppelte bzw. fehlende `Focus`/`Relax`-Blöcke und unausgewogene Klammern
- ✅ Formatter für einheitlichen Stil

## Installation

```bash
npx vsce package
code --install-extension hypnoscript-support-{version}.vsix
```

### Alternative Installation

[Download](https://marketplace.visualstudio.com/items?itemName=HypnoScriptTeam.hypnoscript-support)

## Nutzung

- Erstelle eine .hyp-Datei und öffne sie in VSCode.
- Nutze Auto-Completion mit CTRL + Space.
- Formatiere den Code mit SHIFT + ALT + F.

Viel Spaß mit HypnoScript in VSCode! 🚀

## Lizenz

MIT License

## Entwicklung

[GitHub Repository](https://github.com/HypnoScript/hyp-vscode-extension)
