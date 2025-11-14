import { LocalTranslations } from './interfaces/localTranslations';

export const coreKeywords = [
  'Focus',
  'Relax',
  'entrance',
  'finale',
  'induce',
  'suggestion',
  'awaken',
  'observe',
  'whisper',
  'call',
  'mindLink',
  'session',
  'constructor',
  'expose',
  'conceal',
  'tranceify',
  'loop',
  'while',
  'if',
  'else',
  'drift',
  'trance',
  'deepFocus',
  'from',
  'external',
  'snap',
  'sink',
  'dominant',
  'freeze',
  'oscillate',
  'anchor',
  'implant',
  'trigger',
  'command',
] as const;

export const controlFlowHelpers = [
  'repeatAction',
  'repeatUntil',
  'repeatWhile',
  'delayedSuggestion',
  'ifTranced',
  'tryOrAwaken',
  'ensureAwakening',
  'sequentialTrance',
] as const;

export const operatorSynonyms = [
  'youAreFeelingVerySleepy',
  'youCannotResist',
  'lookAtTheWatch',
  'fallUnderMySpell',
  'yourEyesAreGettingHeavy',
  'goingDeeper',
  'underMyControl',
  'resistanceIsFutile',
] as const;

export const standardLibraryFunctions = [
  'hypnoticPi',
  'pendulumSin',
  'pendulumCos',
  'power',
  'floor',
  'ceiling',
  'roundToNearest',
  'selectDominant',
  'selectSubmissive',
  'unconsciousInt',
  'unconsciousBool',
  'squareRoot',
  'trimEdges',
  'measureDepth',
  'fragmentMemory',
  'mergeThoughts',
  'vaultSize',
  'toUpper',
  'toLower',
  'reverseTrance',
  'repeatMantra',
  'containsPattern',
  'replaceAllMemories',
  'startsWithSuggestion',
  'endsWithAwakening',
  'sortMemories',
  'reverseMemories',
  'firstMemory',
  'lastMemory',
  'mapMemories',
  'filterMemories',
  'reduceToEssence',
  'MindStack',
  'ThoughtQueue',
  'MemoryMap',
  'createVault',
  'storeMemory',
  'peekAtMemory',
  'absoluteDepth',
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
    label: 'session',
    detailKey: 'comp_session',
    documentationKey: 'comp_session',
    body: 'session ${1:Name} {\n\texpose ${2:feld}: ${3:type};\n\tconceal ${4:secret}: ${5:type};\n\n\tsuggestion constructor(${6:args}) {\n\t\tthis.${2} = ${2};\n\t\tthis.${4} = ${4};\n\t}\n}',
  },
  {
    label: 'tranceify',
    detailKey: 'comp_tranceify',
    documentationKey: 'comp_tranceify',
    body: 'tranceify ${1:Name} {\n\t${2:feld1}: ${3:type};\n\t${4:feld2}: ${5:type};\n}',
  },
  {
    label: 'entrance',
    detailKey: 'comp_entrance',
    documentationKey: 'comp_entrance',
    body: 'entrance {\n\t${1:// initial code}\n}',
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
    body: 'trigger ${1:onEvent} = suggestion(${2:params}) {\n\t${0:// logic}\n};',
  },
  {
    label: 'repeatAction',
    detailKey: 'snippet_repeatAction',
    documentationKey: 'snippet_repeatAction',
    body: 'repeatAction(${1:count}, suggestion() {\n\t${0}// action\n});',
  },
  {
    label: 'if (Operator-Synonym)',
    detail: 'if-block using youAreFeelingVerySleepy',
    documentation:
      "Uses 'youAreFeelingVerySleepy' instead of '==' for comparisons.",
    body: 'if (${1:variable} youAreFeelingVerySleepy ${2:value}) {\n\t${3:// code}\n} else {\n\t${4:// alternative code}\n}',
  },
  {
    label: 'Operator (Greater than)',
    detail: "Uses lookAtTheWatch as '>'",
    documentation:
      "Applies 'lookAtTheWatch' to check for greater-than comparisons.",
    body: '${1:variable} lookAtTheWatch ${2:value}',
  },
  {
    label: 'Operator (Less than)',
    detail: "Uses fallUnderMySpell as '<'",
    documentation: "Applies 'fallUnderMySpell' to compare values like '<'.",
    body: '${1:variable} fallUnderMySpell ${2:value}',
  },
  {
    label: 'Operator (Not equal)',
    detail: "Classic '!=' comparison",
    documentation: 'Provides the standard inequality operator snippet.',
    body: '${1:variable} != ${2:value}',
  },
];

export const keywordCompletionList = [
  ...coreKeywords,
  ...controlFlowHelpers,
  ...operatorSynonyms,
];

export const completionTriggerCharacters = Array.from(
  new Set(
    [...keywordCompletionList, ...standardLibraryFunctions]
      .map((keyword) => keyword[0])
      .filter((char): char is string => Boolean(char))
  )
);
