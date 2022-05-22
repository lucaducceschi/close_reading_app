export interface FilterRequest {
  id_text: string;
  ner?: string;
  upos: string;
  lemma?: string;
  clitic?: string;
  number?: string;
  person?: string;
  prontype?: string;
  mood?: string;
  tense?: string;
  verbform?: string;
  definite?: string;
  gender?: string;
  numtype?: string;
  poss?: string;
  polarity?: string;
  degree?: string;
  foreign?: string;
}

export function aFilterRequest(filterRequest: FilterRequest) {
  return filterRequest;
}

export enum UposValues {
  ADJ = 'ADJ',
  ADP = 'ADP',
  ADV = 'ADV',
  AUX = 'AUX',
  CCONJ = 'CCONJ',
  DET = 'DET',
  INTJ = 'INTJ',
  NOUN = 'NOUN',
  NUM = 'NUM',
  PRON = 'PRON',
  PROPN = 'PROPN',
  PUNCT = 'PUNCT',
  SCONJ = 'SCONJ',
  VERB = 'VERB',
  X = 'X',
}

export enum CliticValues {
  YES = 'Yes',
}

export enum NumberValues {
  PLUR = 'Plur',
  SING = 'Sing',
}

export enum PersonValues {
  ONE = '1',
  TWO = '2',
  THREE = '3',
}

export enum ProntypeValues {
  ART = 'Art',
  DEM = 'Dem',
  EXC = 'Exc',
  IND = 'Ind',
  INT = 'Int',
  NEG = 'Neg',
  PRS = 'Prs',
  REL = 'Rel',
  TOT = 'Tot',
}

export enum MoodValues {
  CND = 'Cnd',
  IMP = 'Imp',
  IND = 'Ind',
  SUB = 'Sub',
}

export enum TenseValues {
  FUT = 'Fut',
  IMP = 'Imp',
  PAST = 'Past',
  PRES = 'Pres',
}

export enum VerbFormValues {
  FIN = 'Fin',
  GER = 'Ger',
  INF = 'Inf',
  PART = 'Part',
}

export enum DefiniteValues {
  DEF = 'Def',
  IND = 'Ind',
}

export enum GenderValues {
  FEM = 'Fem',
  MASC = 'Masc',
}

export enum NumTypeValues {
  CARD = 'Card',
  ORD = 'Ord',
}

export enum PossValues {
  YES = 'Yes',
}

export enum PolarityValues {
  NEG = 'Neg',
  POS = 'Pos',
}

export enum DegreeValues {
  ABS = 'Abs',
}

export enum ForeignValues {
  YES = 'Yes',
}

export enum Ner {}
