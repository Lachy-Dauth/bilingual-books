export type Block = {
  tag: string;
  text: string;
  translation?: string;
};

export type Chapter = {
  spineIndex: number;
  href: string;
  fullPath: string;
  navTitle: string;
  blocks: Block[];
};

export type Cover = {
  href: string;
  mediaType: string;
  data: Uint8Array;
};

export type ParsedEpub = {
  title: string;
  language: string;
  author: string;
  chapters: Chapter[];
  cover: Cover | null;
  opfDir: string;
};

export type TranslationItem = {
  chapterIdx: number;
  blockIdx: number;
  text: string;
  tag: string;
  translation?: string;
};

export type TranslationProgress = {
  done: number;
  total: number;
  item: TranslationItem;
};

export type SentencePair = {
  src: string;
  tgt: string;
};
