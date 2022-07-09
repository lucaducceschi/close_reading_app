import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Lens } from './filter-lens';
import { FilterRequest } from './filter-request';

export interface Card {
  id: number;
  zIndex: number;
  line?: any;
  lens: Lens;
  lensFormGroup: FormGroup;
  lensFormSubscription: Subscription;
  notApplied: boolean;
  active: boolean;
  position: CardPosition;
}

export interface CardPosition {
  x: number;
  y: number;
}

export function aCardPosition(cardPosition: CardPosition) {
  return cardPosition;
}

export function initialCardPosition() {
  return aCardPosition({
    x: 0,
    y: 0,
  });
}

export interface FilterCard extends Card {
  filterRequest: FilterRequest;
  filterFormGroup: FormGroup;
  tokenCount: string;
  alia?: boolean;
}

export function aFilterCard(filterCard: FilterCard) {
  return filterCard;
}

export interface SentenceCard extends Card {
  embeddingFor: number;
  sentenceRequest: SentenceRequest;
  sentenceFormGroup: FormGroup;
}

export interface SentenceRequest {
  id_text: string;
  s_types: string[];
  word_ids: string[];
}

export function aSentenceCard(sentenceCard: SentenceCard) {
  return sentenceCard;
}

export function aSentenceRequest(sentenceRequest: SentenceRequest) {
  return sentenceRequest;
}

export interface SequenceCard {
  id: number;
  sequenceFor: number[];
  sequenceRequest: SequenceRequest;
  sequenceFormGroup: FormGroup;
  zIndex: number;
  lines: any[];
  lens: Lens;
  lensFormGroup: FormGroup;
  lensFormSubscription: Subscription;
  notApplied: boolean;
  active: boolean;
}

export interface SequenceRequest {
  id_text: string;
  after: string[];
  before: string[];
  distance: number;
}

export interface SequenceResponse {
  [key: string]: string[][];
}

export function aSequenceCard(sequenceCard: SequenceCard) {
  return sequenceCard;
}

export function aSequenceRequest(sequenceRequest: SequenceRequest) {
  return sequenceRequest;
}
