export const DISABLED_FILTER_LENS: Lens = aLens({
  font: 'Roboto, "Helvetica Neue", sans-serif',
  color: '#000000de',
  highlight: 'transparent',
});

export interface Lens {
  font: string;
  color: string;
  highlight: string;
}

export function aLens(lens: Lens) {
  return lens;
}
