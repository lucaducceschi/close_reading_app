import { Lens } from './filter-lens';

export interface TokenLens {
  cardId: number;
  tokenResult: string[];
  lens: Lens;
}

export function aTokenLens(tokenLens: TokenLens) {
  return tokenLens;
}
