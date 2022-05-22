export interface Document {
  docId: string;
  title: string;
  author: string;
}

export function aDocument(document: Document) {
  return document;
}
