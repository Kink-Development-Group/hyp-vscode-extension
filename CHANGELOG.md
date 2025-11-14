# Change Log

All notable changes to the "hypnoscript-support" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-01-29

- Initial release
- Added support for HypnoScript
- Added syntax highlighting
- Added snippets

## [1.1.0] - 2025-01-30

- Added support for Hover descriptions in syntax highlighting

## [1.1.1] - 2025-01-31

- Fixed issue with Hover descriptions

## [1.2.0] - 2025-02-28

- Verbesserteres und umfassenderes Syntax Highlighting mit verbesserter Hover-Unterstützung.
- Erweiterte Internationalisierung: Unterstützung für Deutsch und Englisch.
- Beginn der Logging-Infrastruktur.

## [1.3.0] - 2025-03-05

- Unterstützung für Operatoren hinzugefügt!
- Erweiterte Internationalisierung:
  - Neue Lokalisierungsschlüssel eingeführt:
    - diagnostic_error_popup
    - diagnostic_solution_message
    - diagnostic_solution_button
  - Anpassungen in extension.ts, i18n.ts, und localTranslations zur vollständigen Übersetzung.

## [1.4.0] - 2025-11-14

- Gemeinsame Sprachdatenbasis (`languageFacts.ts`) eingeführt, sodass Client & Server dieselben Keywords, Operatoren und Snippets verwenden (DRY).
- Auto-Completion deckt jetzt alle neuen HypnoScript-Schlüsselwörter, Operator-Synonyme sowie Standardbibliotheksfunktionen ab (MindStack, StringSpell, Hypno-Math, …).
- Neue Snippets für Focus/Relax-Gerüst, Trigger, repeatAction und Operator-Synonyme.
- Hover-Texte für `freeze`, `whisper`, `trigger`, `repeatAction` u. v. m. – lokalisiert in DE/EN.
- Linter erkennt doppelte oder fehlplatzierte `Focus`/`Relax`-Blöcke zusätzlich zu den bestehenden Syntaxregeln.
- Übersetzungen und README aktualisiert.

## [1.5.0] - 2025-11-14

### 🎉 Massive Verbesserungen der Entwicklererfahrung

## [1.5.1] - 2025-11-14

### 🐛 Bugfixes & Verbesserungen

**Code-Qualität**

- ✅ Alle ESLint-Fehler behoben (11 Errors, 23 Warnings)
- ✅ TypeScript strict mode Kompatibilität verbessert
- ✅ Floating promises korrekt behandelt
- ✅ Unused parameters mit Unterstrich-Präfix markiert
- ✅ Type-Safety verbessert (keine unsafe arguments mehr)

**Language Support**

- ✅ `.hypnoscript` Extension unterstützt (zusätzlich zu `.hyp`)
- ✅ File Icons für beide Extensions registriert
- ✅ Icon-Display parallel zu anderen Icon-Themes

**Diagnostics**

- ✅ Verbesserte Semikolon-Prüfung:
  - Ignoriert Kommentarzeilen (`//` und `/* */`)
  - Erkennt mehrzeilige Array-Literale
  - Erkennt umgebrochene Funktionsparameter
  - Ignoriert Fortsetzungszeilen korrekt
  - Nur noch echte fehlende Semicolons werden gemeldet

**Imports & Dependencies**

- ✅ Fehlende `LocalTranslations` Imports hinzugefügt
- ✅ Code-Struktur bereinigt und optimiert

#### ✨ Neue Features

**Syntax-Highlighting komplett überarbeitet**

- Hierarchische Pattern-Organisation mit 10+ Kategorien
- Vollständige Operator-Unterstützung (Standard + Hypnotische Synonyme)
- 100+ Standard-Library-Funktionen mit Highlighting
- Kontext-sensitive Farbgebung für bessere Lesbarkeit

**Intelligente Autocompletion**

- Kontext-basierte Vorschläge (Variablen, Typen, Operatoren, Funktionen)
- 60+ Keywords mit Snippets
- 100+ Standard-Library-Funktionen kategorisiert
- 25+ Code-Snippets für häufige Patterns
- IntelliSense mit Dokumentation und Beispielen

**Umfassendes Linting-System**

- Strukturelle Validierung (Focus/Relax, Klammern)
- Syntax-Checks (Semicolons, Balance)
- Semantische Analyse (Ungenutzte Variablen)
- 10+ Diagnostic-Codes mit klaren Fehlermeldungen

**Erweiterter Code-Formatter**

- Automatische Einrückung (konfigurierbar)
- Leerzeichen um Operatoren
- Konsistente Klammerung
- Range-Formatting für Teilbereiche

**Code-Actions & Refactorings**

- 5+ Quick-Fixes (Auto-Fix für häufige Fehler)
- 5+ Refactorings (Extract Function/Variable, Convert Syntax)
- 3+ Source Actions (Add entrance/finale, Organize imports)

**Erweiterter Hover-Provider**

- Keyword-Dokumentation mit Beispielen
- Operator-Erklärungen (Standard ↔ Hypnotisch)
- Funktions-Signaturen mit Beschreibungen
- Kontext-spezifische Tipps

#### 🏗️ Architektur-Verbesserungen

**OOP-Design**

- Alle Provider als Klassen implementiert
- Klare Verantwortlichkeiten (Single Responsibility Principle)
- Wiederverwendbare Komponenten

**DRY-Prinzip**

- Zentrale Sprachdefinition in `languageFacts.ts`
- Keine Code-Duplikation
- Utility-Funktionen für häufige Operationen

**Internationalisierung**

- Alle Texte in i18n-Dateien
- Deutsche und englische Übersetzungen
- Einfache Erweiterbarkeit

**Code-Dokumentation**

- JSDoc für alle Klassen und Methoden
- Inline-Kommentare für komplexe Logik
- DEVELOPMENT.md mit vollständiger Entwicklerdokumentation

#### 📊 Vollständige Sprachabdeckung

**Keywords (60+)**

- Program Structure: `Focus`, `Relax`, `entrance`, `finale`
- Variables: `induce`, `implant`, `embed`, `freeze`, `sharedTrance`
- Functions: `suggestion`, `mesmerize`, `awaken`, `trigger`
- Control Flow: `if`, `else`, `while`, `loop`, `pendulum`, `entrain`, `when`, `otherwise`
- OOP: `session`, `tranceify`, `expose`, `conceal`, `constructor`, `dominant`
- Special: `drift`, `pauseReality`, `suspend`, `anchor`, `oscillate`, `deepFocus`, `deeperStill`
- Output: `observe`, `whisper`, `command`, `murmur`
- Async: `await`, `surrenderTo`
- Module: `mindLink`, `from`, `external`

**Operatoren (18+)**

- Standard: `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `+`, `-`, `*`, `/`, `%`
- Hypnotische Synonyme: `youAreFeelingVerySleepy`, `youCannotResist`, `lookAtTheWatch`, `fallUnderMySpell`, `yourEyesAreGettingHeavy`, `goingDeeper`, `underMyControl`, `resistanceIsFutile`
- Modern: `??` (`lucidFallback`), `?.` (`dreamReach`)

**Standard-Library (100+)**

- Math (16): `hypnoticPi`, `pendulumSin`, `power`, `squareRoot`, `Max`, `Min`, `Log`, `Exp`, `Random`...
- String (20): `trimEdges`, `toUpper`, `toLower`, `Split`, `Join`, `IndexOf`, `StartsWith`...
- Array (16): `vaultSize`, `sortMemories`, `mapMemories`, `filterMemories`, `ArraySlice`...
- Conversion (5): `ToInt`, `ToDouble`, `ToString`, `ToBoolean`, `ToChar`
- Data Structures (6): `MindStack`, `ThoughtQueue`, `MemoryMap`, `createVault`...
- Control Flow (11): `repeatAction`, `repeatWhile`, `delayedSuggestion`, `tryOrAwaken`...
- Hypnotic (8): `HypnoticVisualization`, `TranceDeepening`, `HypnoticPatternMatching`...
- System (7): `GetCurrentTime`, `GetCurrentDate`, `DebugPrint`, `GetEnvironmentVariable`...
- Advanced (8): `LinearRegression`, `CalculateMean`, `CreateRecord`, `HttpGet`...

#### 🔧 Technische Details

**Neue Dateien**

- `src/providers/CompletionProvider.ts` - Intelligente Autocompletion (360 Zeilen)
- `src/providers/DiagnosticProvider.ts` - Umfassendes Linting (380 Zeilen)
- `src/providers/HoverProvider.ts` - Erweiterte Hover-Infos (200 Zeilen)

**Überarbeitete Dateien**

- `src/extension.ts` - Vollständig refactored, neue Provider integriert
- `src/formatter.ts` - Von 26 auf 200+ Zeilen erweitert
- `src/features/codeActions.ts` - Von 70 auf 450+ Zeilen erweitert
- `src/languageFacts.ts` - Von 233 auf 476 Zeilen erweitert
- `syntaxes/hypnoscript.tmLanguage.json` - Komplett neu strukturiert

**Zeilen Code (LOC)**

- Vorher: ~800 Zeilen
- Nachher: ~2000+ Zeilen
- Neue Features: ~1200 Zeilen
- Dokumentation: DEVELOPMENT.md (500+ Zeilen)

#### 🎯 Qualitätsverbesserungen

**Code-Qualität**

- TypeScript strict mode
- Keine Compiler-Errors
- OOP-Best-Practices
- DRY-Prinzip durchgängig
- Vollständige JSDoc-Dokumentation

**Performance**

- Effiziente Regex-Patterns
- Caching von Completions
- Inkrementelle Diagnostics
- Lazy-Loading von Providern

**Wartbarkeit**

- Modulare Provider-Struktur
- Zentrale Sprachdefinition
- Wiederverwendbare Utilities
- Klare Verantwortlichkeiten

#### 🧪 Testing

Getestet mit allen Beispieldateien:

- `test_comprehensive.hyp` - Alle Basis-Features
- `test_enterprise_v3.hyp` - Erweiterte Features
- `test_advanced.hyp` - Standard-Library
- `test_new_features.hyp` - Neue Keywords

#### 🐛 Bekannte Einschränkungen

- Type-Checking noch nicht implementiert
- Goto Definition nur eingeschränkt
- Rename Symbol noch nicht verfügbar
- Semantic Highlighting geplant

## [1.5.1] - 2025-11-14

### 🐛 Bugfixes & Verbesserungen

- Fehler bei Release Pipeline behoben
