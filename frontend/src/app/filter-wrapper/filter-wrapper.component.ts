import { preserveWhitespacesDefault } from '@angular/compiler';
import { INFERRED_TYPE } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnyForUntypedForms, FormBuilder, Validators } from '@angular/forms';
import { filter } from 'lodash';
import { Subject } from 'rxjs';
import { aTokenLens, TokenLens } from '../models/document-token-lens';
import {
  aFilterCard,
  aSentenceCard,
  aSentenceRequest,
  aSequenceCard,
  aSequenceRequest,
  Card,
  FilterCard,
  initialCardPosition,
  SentenceCard,
  SequenceCard,
} from '../models/filter-card';
import { aLens, DISABLED_FILTER_LENS } from '../models/filter-lens';
import { aFilterRequest, UposValues } from '../models/filter-request';
import { FilterService } from '../services/filter.service';

@Component({
  selector: 'app-filter-wrapper',
  templateUrl: './filter-wrapper.component.html',
  styleUrls: ['./filter-wrapper.component.scss'],
})
export class FilterWrapperComponent {
  @Input() selectedDocId: string = '';
  @Input() selectedTabIndex: number;
  @Input() resetCards: Subject<any>;

  @Output() updateTokenLensesEvent = new EventEmitter();

  filterCards: FilterCard[] = [];
  sentenceCards: SentenceCard[] = [];
  sequenceCards: SequenceCard[] = [];

  tokenLenses: TokenLens[] = [];

  constructor(private filterService: FilterService, private fb: FormBuilder) {}

  ngOnInit() {
    this.resetCards.subscribe(() => {
      this.filterCards = [];
      this.sentenceCards = [];
      this.sequenceCards = [];
    });
  }

  addFilterCardToMainPanel($event: string) {
    if (this.selectedDocId != '') {
      if ($event == 'SENTENCE') {
        this.sentenceCards.push(
          aSentenceCard({
            id: Math.floor(Math.random() * 100000),
            position: initialCardPosition(),
            notApplied: true,
            active: false,
            zIndex:
              this.filterCards.length +
              this.sentenceCards.length +
              this.sequenceCards.length,
            sentenceRequest: aSentenceRequest({
              id_text: this.selectedDocId,
              s_types: [],
              word_ids: [],
            }),
            embeddingFor: undefined,
            lens: DISABLED_FILTER_LENS,
            sentenceFormGroup: this.fb.group({
              type: [undefined, Validators.required],
            }),
            lensFormGroup: this.fb.group({
              font: ['Arial'],
              color: ['#000000'],
              highlight: ['#FFFFFF'],
            }),
            lensFormSubscription: undefined,
          })
        );
      } else if ($event == 'SEQUENCE') {
        this.sequenceCards.push(
          aSequenceCard({
            id: Math.floor(Math.random() * 100000),
            zIndex:
              this.filterCards.length +
              this.sentenceCards.length +
              this.sequenceCards.length,
            sequenceRequest: aSequenceRequest({
              id_text: this.selectedDocId,
              after: [],
              before: [],
              distance: undefined,
            }),
            sequenceFor: [],
            sequenceFormGroup: this.fb.group({
              distance: [undefined],
            }),
            lines: [],
            lensFormSubscription: undefined,
            lensFormGroup: this.fb.group({
              font: ['Arial'],
              color: ['#000000'],
              highlight: ['#FFFFFF'],
            }),
            lens: DISABLED_FILTER_LENS,
            notApplied: true,
            active: false,
          })
        );
      } else {
        this.filterCards.push(
          aFilterCard({
            id: Math.floor(Math.random() * 100000),
            position: initialCardPosition(),
            notApplied: true,
            active: false,
            tokenCount: undefined,
            zIndex:
              this.filterCards.length +
              this.sentenceCards.length +
              this.sequenceCards.length,
            filterRequest: aFilterRequest({
              id_text: this.selectedDocId,
              upos: $event,
            }),
            lens: DISABLED_FILTER_LENS,
            filterFormGroup: this.fb.group({
              lemma: [undefined],
              gender: [undefined],
              num: [undefined],
              tense: [undefined],
              ner: [undefined],
              verbform: [undefined],
              definite: [undefined],
              numtype: [undefined],
              prontype: [undefined],
              foreign: [false],
            }),
            lensFormGroup: this.fb.group({
              font: ['Arial'],
              color: ['#000000'],
              highlight: ['#FFFFFF'],
            }),
            lensFormSubscription: undefined,
          })
        );
      }
    }
  }

  applyFilter(filterCard: FilterCard) {
    console.log('Filter Request:', filterCard.filterRequest);
    this.filterService
      .getFilter(filterCard.filterRequest)
      .subscribe((filterResponse) => {
        console.log('Filter Response:', filterResponse);
        const tokenResultsIndex = this.tokenLenses.findIndex(
          (tokenLens) => tokenLens.cardId == filterCard.id
        );

        const tokensSplitted = filterResponse.ids
          .split(' ')
          .filter((id) => id != '');

        if (tokenResultsIndex != -1) {
          this.tokenLenses[tokenResultsIndex].tokenResult = tokensSplitted;
          filterCard.tokenCount = filterResponse.count;
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        } else {
          this.tokenLenses.push(
            aTokenLens({
              cardId: filterCard.id,
              tokenResult: tokensSplitted,
              lens: filterCard.lens,
            })
          );
          filterCard.tokenCount = filterResponse.count;
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        }
      });
  }

  applySentence(sentenceCard: SentenceCard) {
    if (sentenceCard.embeddingFor != undefined) {
      const embeddedTokenLens = this.tokenLenses.find((tokenLens) => {
        return tokenLens.cardId == sentenceCard.embeddingFor;
      });
      sentenceCard.sentenceRequest.word_ids =
        embeddedTokenLens?.tokenResult || [];
    } else {
      sentenceCard.sentenceRequest.word_ids = [];
    }
    console.log('Sentence Request:', sentenceCard.sentenceRequest);
    this.filterService
      .getSentence(sentenceCard.sentenceRequest)
      .subscribe((tokens) => {
        console.log('Sentence Response', tokens);
        const tokenResultsIndex = this.tokenLenses.findIndex(
          (tokenLens) => tokenLens.cardId == sentenceCard.id
        );

        const tokensSplitted = tokens.split(' ').filter((token) => token != '');

        if (tokenResultsIndex != -1) {
          this.tokenLenses[tokenResultsIndex].tokenResult = tokensSplitted;
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        } else {
          this.tokenLenses.push(
            aTokenLens({
              cardId: sentenceCard.id,
              tokenResult: tokensSplitted,
              lens: sentenceCard.lens,
            })
          );
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        }
      });
  }

  applySequence($event: any) {
    const beforeTokenLens = this.tokenLenses.find(
      (tokenLens) => tokenLens.cardId == $event.sequenceCard.sequenceFor[0]
    );
    const afterTokenLens = this.tokenLenses.find(
      (tokenLens) => tokenLens.cardId == $event.sequenceCard.sequenceFor[1]
    );

    $event.sequenceCard.sequenceRequest.before =
      beforeTokenLens?.tokenResult || [];

    $event.sequenceCard.sequenceRequest.after =
      afterTokenLens?.tokenResult || [];

    console.log('Sequence Request:', $event.sequenceCard.sequenceRequest);
    this.filterService
      .getSequence($event.sequenceCard.sequenceRequest)
      .subscribe((sequenceResponse) => {
        console.log('Sequence Response:', sequenceResponse);
        const tokens = Object.values(sequenceResponse).flatMap(
          (sequenceTokensBySentence) =>
            sequenceTokensBySentence.flatMap((afterAndBefore) => afterAndBefore)
        );

        const tokenResultsIndex = this.tokenLenses.findIndex(
          (tokenLens) => tokenLens.cardId == $event.sequenceCard.id
        );

        const tokensSplitted = tokens.filter((token) => token != '');

        if (tokenResultsIndex != -1) {
          this.tokenLenses[tokenResultsIndex].tokenResult = tokensSplitted;
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        } else {
          this.tokenLenses.push(
            aTokenLens({
              cardId: $event.sequenceCard.id,
              tokenResult: tokensSplitted,
              lens: $event.sequenceCard.lens,
            })
          );
          this.updateTokenLensesEvent.emit(this.tokenLenses);
        }
      });
  }

  applyLens(card: Card | SequenceCard) {
    const tokenLensIndexToApplyLens = this.tokenLenses.findIndex(
      (tokenLens) => tokenLens.cardId == card.id
    );

    this.tokenLenses[tokenLensIndexToApplyLens].lens = card.lens;

    this.updateTokenLensesEvent.emit(this.tokenLenses);
  }

  removeFilterCard(filterCardToRemove: FilterCard) {
    const embeddingSentenceCardIndex = this.sentenceCards.findIndex(
      (sentenceCard) => sentenceCard.embeddingFor == filterCardToRemove.id
    );

    if (embeddingSentenceCardIndex != -1) {
      this.sentenceCards[embeddingSentenceCardIndex].line.remove();
      this.sentenceCards[embeddingSentenceCardIndex].line = undefined;
      this.sentenceCards[embeddingSentenceCardIndex].embeddingFor = undefined;
      this.sentenceCards[embeddingSentenceCardIndex].active = false;
      this.sentenceCards[embeddingSentenceCardIndex].lens =
        DISABLED_FILTER_LENS;
      this.sentenceCards[embeddingSentenceCardIndex].notApplied = true;

      const embeddingTokenLensIndex = this.tokenLenses.findIndex(
        (tokenLens) =>
          tokenLens.cardId == this.sentenceCards[embeddingSentenceCardIndex].id
      );

      if (embeddingTokenLensIndex != -1) {
        this.tokenLenses[embeddingTokenLensIndex].lens = DISABLED_FILTER_LENS;
        this.updateTokenLensesEvent.emit(this.tokenLenses);
      }
    }

    const sequenceCardIndex = this.sequenceCards.findIndex((sequenceCard) =>
      sequenceCard.sequenceFor.includes(filterCardToRemove.id)
    );

    if (sequenceCardIndex != -1) {
      const filterCardIndex = this.sequenceCards[
        sequenceCardIndex
      ].sequenceFor.findIndex(
        (filterCardId) => filterCardId == filterCardToRemove.id
      );

      this.sequenceCards[sequenceCardIndex].lines[filterCardIndex].remove();
      this.sequenceCards[sequenceCardIndex].lines[filterCardIndex] = undefined;
      this.sequenceCards[sequenceCardIndex].sequenceFor[filterCardIndex] =
        undefined;
    }

    this.filterCards = this.filterCards.filter(
      (filterCard) => filterCard.id != filterCardToRemove.id
    );

    this.tokenLenses = this.tokenLenses.filter(
      (tokenLens) => tokenLens.cardId != filterCardToRemove.id
    );

    this.updateTokenLensesEvent.emit(this.tokenLenses);
  }

  removeSentenceCard(sentenceCardToRemove: SentenceCard) {
    const embeddingFilterCardIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == sentenceCardToRemove.embeddingFor
    );

    if (embeddingFilterCardIndex != -1) {
      sentenceCardToRemove.line.remove();
      this.filterCards[embeddingFilterCardIndex].line = undefined;
    }

    this.sentenceCards = this.sentenceCards.filter(
      (sentenceCard) => sentenceCard.id != sentenceCardToRemove.id
    );

    this.tokenLenses = this.tokenLenses.filter(
      (tokenLens) => tokenLens.cardId != sentenceCardToRemove.id
    );

    this.updateTokenLensesEvent.emit(this.tokenLenses);
  }

  removeSequenceCard(sequenceCardToRemove: SequenceCard) {
    sequenceCardToRemove.lines.forEach((line) => line.remove());

    const sequenceFilterCardBeforeIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == sequenceCardToRemove.sequenceFor[0]
    );

    if (sequenceFilterCardBeforeIndex != -1) {
      this.filterCards[sequenceFilterCardBeforeIndex].line = undefined;
    }

    const sequenceFilterCardAfterIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == sequenceCardToRemove.sequenceFor[1]
    );

    if (sequenceFilterCardAfterIndex != -1) {
      this.filterCards[sequenceFilterCardAfterIndex].line = undefined;
    }

    this.sequenceCards = this.sequenceCards.filter(
      (sequenceCard) => sequenceCard.id != sequenceCardToRemove.id
    );

    this.tokenLenses = this.tokenLenses.filter(
      (tokenLens) => tokenLens.cardId != sequenceCardToRemove.id
    );

    this.updateTokenLensesEvent.emit(this.tokenLenses);
  }
}
