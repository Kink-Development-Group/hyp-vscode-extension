import { LocalTranslations } from './interfaces/localTranslations';

/**
 * Core HypnoScript keywords - Grundlegende Schlüsselwörter
 */
export const coreKeywords = [
  'Focus',
  'Relax',
  'entrance',
  'finale',
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
  'murmur',
  'call',
  'mindLink',
  'from',
  'external',
  'session',
  'constructor',
  'expose',
  'conceal',
  'dominant',
  'tranceify',
  'loop',
  'while',
  'pendulum',
  'if',
  'else',
  'drift',
  'pauseReality',
  'suspend',
  'accelerateTime',
  'decelerateTime',
  'trance',
  'subconscious',
  'lucid',
  'deepFocus',
  'deeperStill',
  'snap',
  'sink',
  'sinkTo',
  'oscillate',
  'anchor',
  'trigger',
  'mesmerize',
  'await',
  'surrenderTo',
  'entrain',
  'when',
  'otherwise',
  'imperative',
] as const;

/**
 * Type system keywords - Typ-System
 */
export const typeKeywords = ['number', 'string', 'boolean', 'trance', 'lucid'] as const;

/**
 * Hypnotic operator synonyms - Hypnotische Operator-Synonyme
 */
export const operatorSynonyms = [
  'youAreFeelingVerySleepy', // ==
  'youCannotResist', // !=
  'lookAtTheWatch', // >
  'fallUnderMySpell', // <
  'yourEyesAreGettingHeavy', // >=
  'goingDeeper', // <=
  'underMyControl', // &&
  'resistanceIsFutile', // ||
  'lucidFallback', // ??
  'dreamReach', // ?.
] as const;

/**
 * Control flow helper functions - Kontrollfluss-Helfer (DeepMind Library)
 */
export const controlFlowHelpers = [
  'repeatAction',
  'repeatUntil',
  'repeatWhile',
  'delayedSuggestion',
  'ifTranced',
  'tryOrAwaken',
  'ensureAwakening',
  'sequentialTrance',
  'parallelTrance',
  'scheduleAwakening',
  'awakenAfter',
] as const;

/**
 * Standard library - Mathematical functions (MathWizard)
 */
export const mathFunctions = [
  'hypnoticPi',
  'pendulumSin',
  'pendulumCos',
  'power',
  'floor',
  'ceiling',
  'roundToNearest',
  'squareRoot',
  'absoluteDepth',
  'Max',
  'Min',
  'Log',
  'Log10',
  'Exp',
  'Random',
  'RandomInt',
] as const;

/**
 * Standard library - String functions (MindWeaver)
 */
export const stringFunctions = [
  'trimEdges',
  'measureDepth',
  'toUpper',
  'toLower',
  'reverseTrance',
  'repeatMantra',
  'containsPattern',
  'replaceAllMemories',
  'startsWithSuggestion',
  'endsWithAwakening',
  'Trim',
  'TrimStart',
  'TrimEnd',
  'IndexOf',
  'LastIndexOf',
  'StartsWith',
  'EndsWith',
  'PadLeft',
  'PadRight',
  'Split',
  'Join',
] as const;

/**
 * Standard library - Array/Collection functions (MemoryPalace)
 */
export const arrayFunctions = [
  'fragmentMemory',
  'mergeThoughts',
  'vaultSize',
  'sortMemories',
  'reverseMemories',
  'firstMemory',
  'lastMemory',
  'mapMemories',
  'filterMemories',
  'reduceToEssence',
  'ArrayLength',
  'ArrayGet',
  'ArraySlice',
  'ArrayContains',
  'ArrayIndexOf',
  'ArrayConcat',
] as const;

/**
 * Standard library - Data structure constructors
 */
export const dataStructures = [
  'MindStack',
  'ThoughtQueue',
  'MemoryMap',
  'createVault',
  'storeMemory',
  'peekAtMemory',
] as const;

/**
 * Standard library - Conversion functions
 */
export const conversionFunctions = [
  'ToInt',
  'ToDouble',
  'ToString',
  'ToBoolean',
  'ToChar',
] as const;

/**
 * Standard library - Random/Selection functions
 */
export const randomFunctions = [
  'unconsciousInt',
  'unconsciousBool',
  'selectDominant',
  'selectSubmissive',
] as const;

/**
 * Standard library - Hypnotic functions
 */
export const hypnoticFunctions = [
  'HypnoticVisualization',
  'ProgressiveRelaxation',
  'HypnoticSuggestion',
  'TranceDeepening',
  'HypnoticPatternMatching',
  'HypnoticTimeDilation',
  'HypnoticMemoryEnhancement',
  'HypnoticCreativityBoost',
] as const;

/**
 * Standard library - System/Time functions
 */
export const systemFunctions = [
  'GetCurrentTime',
  'GetCurrentDate',
  'GetCurrentTimeString',
  'GetCurrentDateTime',
  'GetEnvironmentVariable',
  'DebugPrint',
  'DebugPrintType',
] as const;

/**
 * Standard library - Advanced functions (ML, Network, DB)
 */
export const advancedFunctions = [
  'LinearRegression',
  'CalculateMean',
  'CalculateStandardDeviation',
  'CreateRecord',
  'GetRecordValue',
  'SetRecordValue',
  'HttpGet',
  'HttpPost',
] as const;

/**
 * Combined standard library functions
 */
export const standardLibraryFunctions = [
  ...mathFunctions,
  ...stringFunctions,
  ...arrayFunctions,
  ...dataStructures,
  ...conversionFunctions,
  ...randomFunctions,
  ...hypnoticFunctions,
  ...systemFunctions,
  ...advancedFunctions,
] as const;

/**
 * All keywords for completion
 */
export const keywordCompletionList = [
  ...coreKeywords,
  ...typeKeywords,
  ...operatorSynonyms,
  ...controlFlowHelpers,
] as const;

export const hoverTranslationKeys: Record<string, keyof LocalTranslations> = {
  Focus: 'Focus',
  Relax: 'Relax',
  induce: 'induce',
  suggestion: 'suggestion',
  observe: 'observe',
  whisper: 'whisper',
  trance: 'trance',
  drift: 'drift',
  session: 'session',
  expose: 'expose',
  conceal: 'conceal',
  entrance: 'entrance',
  finale: 'finale',
  deepFocus: 'deepFocus',
  call: 'call',
  from: 'from_external',
  freeze: 'freeze',
  anchor: 'anchor',
  oscillate: 'oscillate',
  implant: 'implant',
  trigger: 'trigger',
  command: 'command',
  repeatAction: 'repeatAction',
  repeatUntil: 'repeatUntil',
  repeatWhile: 'repeatWhile',
  delayedSuggestion: 'delayedSuggestion',
  ifTranced: 'ifTranced',
  tryOrAwaken: 'tryOrAwaken',
  ensureAwakening: 'ensureAwakening',
  sequentialTrance: 'sequentialTrance',
  if: 'if',
  else: 'else',
  while: 'while',
};

export interface SnippetTemplate {
  label: string;
  detailKey?: keyof LocalTranslations;
  documentationKey?: keyof LocalTranslations;
  detail?: string;
  documentation?: string;
  body: string;
}

export const snippetTemplates: SnippetTemplate[] = [
  {
    label: 'Focus Block',
    detailKey: 'snippet_focus_relax',
    documentationKey: 'snippet_focus_relax',
    body: 'Focus {\n\t${1:// code}\n} Relax',
  },
  {
    label: 'Focus with entrance',
    detail: 'Complete program structure with entrance block',
    documentation: 'Creates a full HypnoScript program with entrance initialization',
    body: 'Focus {\n\tentrance {\n\t\t${1:// initialization}\n\t}\n\n\t${2:// main code}\n\n\tfinale {\n\t\t${3:// cleanup}\n\t}\n} Relax',
  },
  {
    label: 'session',
    detailKey: 'comp_session',
    documentationKey: 'comp_session',
    body: 'session ${1:Name} {\n\texpose ${2:field}: ${3:type};\n\tconceal ${4:secret}: ${5:type};\n\n\tsuggestion constructor(${6:args}) {\n\t\tthis.${2} = ${2};\n\t\tthis.${4} = ${4};\n\t}\n\n\tsuggestion ${7:method}(${8:params}): ${9:returnType} {\n\t\t${0:// method body}\n\t}\n}',
  },
  {
    label: 'tranceify',
    detailKey: 'comp_tranceify',
    documentationKey: 'comp_tranceify',
    body: 'tranceify ${1:Name} {\n\t${2:field1}: ${3:type};\n\t${4:field2}: ${5:type};\n}',
  },
  {
    label: 'suggestion (function)',
    detail: 'Define a function',
    documentation: 'Creates a typed function with parameters and return type',
    body: 'suggestion ${1:functionName}(${2:params}): ${3:returnType} {\n\t${4:// function body}\n\tawaken ${0:result};\n}',
  },
  {
    label: 'mesmerize suggestion (async)',
    detail: 'Define an async function',
    documentation: 'Creates an asynchronous function that can use await',
    body: 'mesmerize suggestion ${1:asyncFunction}(${2:params}): ${3:returnType} {\n\t${4:// async body}\n\tawaken ${0:result};\n}',
  },
  {
    label: 'entrance',
    detailKey: 'comp_entrance',
    documentationKey: 'comp_entrance',
    body: 'entrance {\n\t${1:// initialization code}\n}',
  },
  {
    label: 'finale',
    detail: 'Cleanup block that runs before Relax',
    documentation: 'Defines a finale block for cleanup operations',
    body: 'finale {\n\t${1:// cleanup code}\n}',
  },
  {
    label: 'deepFocus',
    detailKey: 'comp_deepfocus',
    documentationKey: 'comp_deepfocus',
    body: 'deepFocus {\n\t${1:// code block}\n}',
  },
  {
    label: 'trigger',
    detailKey: 'snippet_trigger',
    documentationKey: 'snippet_trigger',
    body: 'trigger ${1:onEvent} = suggestion(${2:params}) {\n\t${0:// event handler logic}\n};',
  },
  {
    label: 'entrain (pattern matching)',
    detail: 'Pattern matching expression',
    documentation: 'Creates an entrain block for pattern matching with when clauses',
    body: 'entrain ${1:value} {\n\twhen ${2:pattern1} => ${3:// action1};\n\twhen ${4:pattern2} => ${5:// action2};\n\totherwise => ${0:// default action};\n}',
  },
  {
    label: 'if-else',
    detail: 'Conditional block',
    documentation: 'Standard if-else conditional structure',
    body: 'if (${1:condition}) {\n\t${2:// true branch}\n} else {\n\t${3:// false branch}\n}',
  },
  {
    label: 'if (hypnotic)',
    detail: 'if-block using youAreFeelingVerySleepy',
    documentation: "Uses 'youAreFeelingVerySleepy' instead of '==' for comparisons",
    body: 'if (${1:variable} youAreFeelingVerySleepy ${2:value}) {\n\t${3:// code}\n} else {\n\t${4:// alternative code}\n}',
  },
  {
    label: 'while loop',
    detail: 'While loop structure',
    documentation: 'Standard while loop',
    body: 'while (${1:condition}) {\n\t${2:// loop body}\n}',
  },
  {
    label: 'loop (for-style)',
    detail: 'For-style loop with initialization, condition, and increment',
    documentation: 'C-style for loop equivalent',
    body: 'loop (induce ${1:i}: number = 0; ${1:i} < ${2:limit}; ${1:i} = ${1:i} + 1) {\n\t${0:// loop body}\n}',
  },
  {
    label: 'pendulum (bidirectional loop)',
    detail: 'Bidirectional loop',
    documentation: 'Loop that runs forward and backward',
    body: 'pendulum (induce ${1:i}: number = 0; ${1:i} < ${2:limit}; ${1:i} = ${1:i} + 1) {\n\t${0:// loop body}\n}',
  },
  {
    label: 'repeatAction',
    detailKey: 'snippet_repeatAction',
    documentationKey: 'snippet_repeatAction',
    body: 'repeatAction(${1:count}, suggestion() {\n\t${0:// action}\n});',
  },
  {
    label: 'repeatWhile',
    detail: 'Repeat while condition is true',
    documentation: 'Functional repeat-while helper from DeepMind',
    body: 'repeatWhile(suggestion(): boolean {\n\tawaken ${1:condition};\n}, suggestion() {\n\t${0:// action}\n});',
  },
  {
    label: 'tryOrAwaken',
    detail: 'Error handling block',
    documentation: 'Try-catch equivalent for error handling',
    body: 'tryOrAwaken(suggestion() {\n\t${1:// try block}\n}, suggestion(${2:error}) {\n\t${0:// error handler}\n});',
  },
  {
    label: 'induce variable',
    detail: 'Variable declaration',
    documentation: 'Declare a typed variable',
    body: 'induce ${1:varName}: ${2:type} = ${0:value};',
  },
  {
    label: 'freeze constant',
    detail: 'Immutable constant',
    documentation: 'Declare an immutable value',
    body: 'freeze ${1:CONST_NAME}: ${2:type} = ${0:value};',
  },
  {
    label: 'sharedTrance global',
    detail: 'Module-level shared state',
    documentation: 'Declare a shared module-level variable',
    body: 'sharedTrance ${1:induce} ${2:globalVar}: ${3:type} = ${0:value};',
  },
  {
    label: 'mindLink import',
    detail: 'Import from another module',
    documentation: 'Import functionality from another HypnoScript file',
    body: 'mindLink { ${1:exports} } from "${0:./module}";',
  },
];

export const completionTriggerCharacters = Array.from(
  new Set(
    [...keywordCompletionList, ...standardLibraryFunctions]
      .map((keyword) => keyword[0])
      .filter((char): char is string => Boolean(char))
  )
);
