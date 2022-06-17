import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { take } from 'rxjs';
import { first, SequenceError, single, Subject, Subscription, tap } from 'rxjs';
import {
  aCardPosition,
  Card,
  FilterCard,
  initialCardPosition,
  SentenceCard,
  SequenceCard,
} from '../models/filter-card';
import { DISABLED_FILTER_LENS } from '../models/filter-lens';
import {
  DefiniteValues,
  ForeignValues,
  GenderValues,
  NumberValues,
  NumTypeValues,
  PolarityValues,
  ProntypeValues,
  TenseValues,
  UposValues,
  VerbFormValues,
} from '../models/filter-request';
import { RemoveCardsDialogComponent } from '../remove-cards-dialog/remove-cards-dialog.component';

declare var LeaderLine: any;

@Component({
  selector: 'app-filter-main-panel',
  templateUrl: './filter-main-panel.component.html',
  styleUrls: ['./filter-main-panel.component.scss'],
})
export class FilterMainPanelComponent {
  @Input() filterCards: FilterCard[] = [];
  @Input() sentenceCards: SentenceCard[] = [];
  @Input() sequenceCards: SequenceCard[] = [];

  @Input() selectedTabIndex: number;

  @Output() applyFilterEvent = new EventEmitter();
  @Output() applySentenceEvent = new EventEmitter();
  @Output() applySequenceEvent = new EventEmitter();

  @Output() applyLensEvent = new EventEmitter();

  @Output() removeFilterCardEvent = new EventEmitter();
  @Output() removeSentenceCardEvent = new EventEmitter();
  @Output() removeSequenceCardEvent = new EventEmitter();

  zIndexMax: number;

  linkEvent = new Subject<string>();
  linkMode = false;

  constructor(private elementRef: ElementRef, public dialog: MatDialog) {}

  ngOnChanges() {
    if (this.selectedTabIndex != 1) {
      this.sentenceCards.forEach((sentenceCard) => {
        if (sentenceCard.line) {
          sentenceCard.line.hide('none');
        }
      });

      this.sequenceCards.forEach((sequenceCard) => {
        if (sequenceCard.lines.length > 0) {
          sequenceCard.lines.forEach((line) => {
            if (line) {
              line.hide('none');
            }
          });
        }
      });
    }
  }

  ngAfterContentChecked() {
    if (this.isFilterMainPanelVisible()) {
      if (this.selectedTabIndex == 1) {
        this.sentenceCards.forEach((sentenceCard) => {
          if (sentenceCard.line) {
            sentenceCard.line.show('none');
            sentenceCard.line.position();
          }
        });
        this.sequenceCards.forEach((sequenceCard) => {
          if (sequenceCard.lines.length > 0) {
            sequenceCard.lines.forEach((line) => {
              if (line) {
                line.show('none');
                line.position();
              }
            });
          }
        });
      }

      this.zIndexMax = this.filterCards
        .map((card) => card.zIndex)
        .reduce((prev, curr) => Math.max(prev, curr), 0);
    }
  }

  //Recupera il nome della card in italiano
  getCardName(card: Card | SequenceCard) {
    if (this.isSequenceCard(card)) {
      return 'SEQUENZA';
    }
    if (this.isSentenceCard(card)) {
      return 'FRASE';
    }
    if (this.isFilterCard(card)) {
      const sequenceIndex =
        this.sequenceCards
          .find((sequenceCard) => sequenceCard.sequenceFor.includes(card.id))
          ?.sequenceFor.findIndex((filterCardId) => filterCardId == card.id) +
        1;

      let sequenceOrder = '';
      if (sequenceIndex > 0) {
        sequenceOrder = '(' + sequenceIndex + ') ';
      }

      const upos = card.filterRequest.upos;
      const tokenCount = card.tokenCount ?? '';
      switch (upos) {
        case UposValues.ADJ:
          return 'AGGETTIVO ' + sequenceOrder + tokenCount;
        case UposValues.NOUN:
          return 'NOME ' + sequenceOrder + tokenCount;
        case UposValues.PRON:
          return 'PRONOME ' + sequenceOrder + tokenCount;
        case UposValues.VERB:
          return 'VERBO ' + sequenceOrder + tokenCount;
        case UposValues.DET:
          return 'ARTICOLO ' + sequenceOrder + tokenCount;
        case UposValues.NUM:
          return 'NUMERALE ' + sequenceOrder + tokenCount;
        case UposValues.PROPN:
          return 'NOME PROPRIO ' + sequenceOrder + tokenCount;
        default:
          return 'FILTRO ' + tokenCount;
      }
    }
    return 'FILTRO';
  }

  //risoluzione bug della card che ora viene creata occupando un posto random non sovrapponendosi
  getFreePosition(card: Card) {
    if (card.position.x == 0 && card.position.y == 0) {
      const boundaryHeight = document.querySelector('.boundary').clientHeight;
      const boundaryWidth = document.querySelector('.boundary').clientWidth;

      let newX = Math.floor(Math.random() * (boundaryWidth - 310));
      let newY = Math.floor(Math.random() * (boundaryHeight - 50));

      const allX = this.filterCards.map((filterCard) => filterCard.position.x);
      const allY = this.filterCards.map((filterCard) => filterCard.position.y);

      while (
        (allX.includes(newX) && allY.includes(newY)) ||
        (allX.some((x) => newX > x && newX < x + 310) &&
          allY.some((y) => newY > y && newY < y + 50))
      ) {
        newX = Math.floor(Math.random() * (boundaryWidth - 310));
        newY = Math.floor(Math.random() * (boundaryHeight - 50));
      }
      const position = aCardPosition({
        x: newX,
        y: newY,
      });
      card.position = position;
      return position;
    } else {
      return card.position;
    }
  }

  moveUp(card: FilterCard | SentenceCard | SequenceCard) {
    if (card.zIndex < this.zIndexMax) {
      card.zIndex = this.zIndexMax + 1;
    }
  }

  expandFilterCard(panelH: MatExpansionPanelHeader) {
    panelH._toggle();
  }

  isFilterMainPanelVisible(): boolean {
    return this.elementRef.nativeElement.offsetParent != null;
  }

  linkSentenceCardWithFilterCard(
    panelH: MatExpansionPanelHeader,
    filterCard: FilterCard
  ) {
    if (filterCard.line) {
      filterCard.line.position();
    }

    if (this.linkMode) {
      panelH._toggle();
      this.linkEvent.next(filterCard.id.toString());
    }
  }

  linkSentenceCard($event: any, sentenceCard: SentenceCard) {
    $event.stopPropagation();

    if (sentenceCard.line == undefined) {
      this.linkMode = true;

      this.linkEvent
        .pipe(
          first(),
          tap((filterCardElementId) => {
            const sentenceCardElement = document.getElementById(
              sentenceCard.id.toString()
            );
            const filterCardElement =
              document.getElementById(filterCardElementId);

            const line = new LeaderLine(sentenceCardElement, filterCardElement);

            line.setOptions({
              endPlug: 'behind',
            });

            sentenceCard.line = line;
            sentenceCard.embeddingFor = parseInt(filterCardElementId);

            const embeddedFilterCardIndex = this.filterCards.findIndex(
              (filterCard) => filterCard.id == parseInt(filterCardElementId)
            );
            this.filterCards[embeddedFilterCardIndex].line = line;

            this.linkMode = false;
          })
        )
        .subscribe();
    }
  }

  unlinkSentenceCard(
    $event: any,
    sentenceCard: SentenceCard,
    slideToggle: MatSlideToggle
  ) {
    $event.stopPropagation();

    sentenceCard.line.remove();
    sentenceCard.line = undefined;

    const embeddedFilterCardIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == sentenceCard.embeddingFor
    );

    this.filterCards[embeddedFilterCardIndex].line = undefined;
    sentenceCard.embeddingFor = undefined;

    if (slideToggle.checked) {
      slideToggle.toggle();
      slideToggle.change.emit({
        source: slideToggle,
        checked: false,
      });
    }
  }

  linkSequenceCard1($event: any, sequenceCard: SequenceCard) {
    $event.stopPropagation();

    if (!this.linkMode) {
      this.linkMode = true;
      this.linkEvent
        .pipe(
          first(),
          tap((sequencedFilterCardId) => {
            const sequenceCardElement = document.getElementById(
              sequenceCard.id.toString()
            );
            const sequencedFilterCardElement = document.getElementById(
              sequencedFilterCardId
            );

            const line = new LeaderLine(
              sequenceCardElement,
              sequencedFilterCardElement
            );

            line.setOptions({
              endPlug: 'behind',
            });

            sequenceCard.lines[0] = line;
            sequenceCard.sequenceFor[0] = parseInt(sequencedFilterCardId);

            const sequencedFilterCardIndex = this.filterCards.findIndex(
              (filterCard) => filterCard.id == parseInt(sequencedFilterCardId)
            );

            this.filterCards[sequencedFilterCardIndex].line = line;
            this.linkMode = false;
          })
        )
        .subscribe();
    }
  }

  linkSequenceCard2($event: any, sequenceCard: SequenceCard) {
    $event.stopPropagation();

    if (!this.linkMode) {
      this.linkMode = true;
      this.linkEvent
        .pipe(
          first(),
          tap((sequencedFilterCardId) => {
            const sequenceCardElement = document.getElementById(
              sequenceCard.id.toString()
            );
            const sequencedFilterCardElement = document.getElementById(
              sequencedFilterCardId
            );

            const line = new LeaderLine(
              sequenceCardElement,
              sequencedFilterCardElement
            );

            line.setOptions({
              endPlug: 'behind',
            });

            sequenceCard.lines[1] = line;
            sequenceCard.sequenceFor[1] = parseInt(sequencedFilterCardId);

            const sequencedFilterCardIndex = this.filterCards.findIndex(
              (filterCard) => filterCard.id == parseInt(sequencedFilterCardId)
            );

            this.filterCards[sequencedFilterCardIndex].line = line;
            this.linkMode = false;
          })
        )
        .subscribe();
    }
  }

  unlinkSequenceCard1($event: any, card: SequenceCard) {
    $event.stopPropagation();

    card.lines[0].remove();
    card.lines[0] = undefined;

    const beforeFilterCardIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == card.sequenceFor[0]
    );

    this.filterCards[beforeFilterCardIndex].line = undefined;

    card.sequenceFor[0] = undefined;

    this.applyFilterEvent.emit(this.filterCards[beforeFilterCardIndex]);
  }

  unlinkSequenceCard2($event: any, card: SequenceCard) {
    $event.stopPropagation();

    card.lines[1].remove();
    card.lines[1] = undefined;

    const afterFilterCardIndex = this.filterCards.findIndex(
      (filterCard) => filterCard.id == card.sequenceFor[1]
    );
    this.filterCards[afterFilterCardIndex].line = undefined;

    card.sequenceFor[1] = undefined;

    this.applyFilterEvent.emit(this.filterCards[afterFilterCardIndex]);
  }

  updateLine(card: FilterCard | SentenceCard | SequenceCard) {
    if (this.isSequenceCard(card)) {
      card.lines.forEach((line) => {
        if (line) {
          line.position();
        }
      });
    } else {
      if (card.line) card.line.position();
    }
  }

  isSequenceCard(card: Card | SequenceCard): card is SequenceCard {
    return (<SequenceCard>card).lines !== undefined;
  }

  isFilterCard(card: Card | SequenceCard): card is FilterCard {
    return (<FilterCard>card).filterRequest !== undefined;
  }

  isSentenceCard(card: Card | SentenceCard): card is SentenceCard {
    return (<SentenceCard>card).sentenceRequest !== undefined;
  }

  updateLineAfterMove(card: FilterCard | SentenceCard | SequenceCard) {
    if (this.isSequenceCard(card)) {
      card.lines.forEach((line) => line.position());
    } else {
      if (card.line) card.line.position();
    }
  }

  //REMOVE
  removeFilterCard($event: any, filterCard: FilterCard) {
    $event.stopPropagation();
    this.removeFilterCardEvent.emit(filterCard);
  }

  removeSentenceCard($event: any, sentenceCard: SentenceCard) {
    $event.stopPropagation();
    this.removeSentenceCardEvent.emit(sentenceCard);
  }

  removeSequenceCard($event: any, sequenceCard: SequenceCard) {
    $event.stopPropagation();
    this.removeSequenceCardEvent.emit(sequenceCard);
  }

  //TOGGLE
  toggleFilterLens(
    $event: MatSlideToggleChange,
    card: FilterCard | SequenceCard
  ) {
    if ($event.checked) {
      card.active = true;
      this.applyLens(card);
      card.lensFormSubscription = card.lensFormGroup.valueChanges.subscribe(
        () => this.applyLens(card)
      );
    } else {
      card.active = false;
      this.disableLens(card);
      card.lensFormSubscription.unsubscribe();
    }
  }

  toggleSentenceLens($event: MatSlideToggleChange, sentenceCard: SentenceCard) {
    if ($event.checked) {
      sentenceCard.active = true;
      this.applyLens(sentenceCard);

      sentenceCard.lensFormSubscription =
        sentenceCard.lensFormGroup.valueChanges.subscribe(() =>
          this.applyLens(sentenceCard)
        );
    } else {
      sentenceCard.active = false;
      this.disableLens(sentenceCard);
      sentenceCard.lensFormSubscription.unsubscribe();
    }
  }

  //LENS
  applyLens(card: Card | SequenceCard) {
    card.lens = {
      ...card.lens,
      font: card.lensFormGroup.value.font,
      color: card.lensFormGroup.value.color,
      highlight: card.lensFormGroup.value.highlight,
    };

    this.applyLensEvent.emit(card);
  }

  disableLens(card: Card | SequenceCard) {
    card.lens = DISABLED_FILTER_LENS;
    this.applyLensEvent.emit(card);
  }

  //APPLY
  applyFilter(filterCard: FilterCard) {
    filterCard.filterRequest = {
      ...filterCard.filterRequest,
      lemma: filterCard.filterFormGroup.value.lemma,
      number: this.getNumberValue(filterCard.filterFormGroup.value),
      gender: this.getGenderValue(filterCard.filterFormGroup.value),
      tense: this.getTenseValue(filterCard.filterFormGroup.value),
      verbform: this.getVerbFormValue(filterCard.filterFormGroup.value),
      definite: this.getDefiniteValue(filterCard.filterFormGroup.value),
      numtype: this.getNumTypeValue(filterCard.filterFormGroup.value),
      prontype: this.getProntypeValue(filterCard.filterFormGroup.value),
      foreign: this.getForeignValue(filterCard.filterFormGroup.value),
    };

    filterCard.notApplied = false;

    this.applyFilterEvent.emit(filterCard);
  }

  applySentence(sentenceCard: SentenceCard) {
    sentenceCard.sentenceRequest = {
      ...sentenceCard.sentenceRequest,
      s_types: [sentenceCard.sentenceFormGroup.value.type],
    };

    sentenceCard.notApplied = false;

    if (sentenceCard.embeddingFor != undefined) {
      const embeddedFilterCard = this.filterCards.find(
        (filterCard) => filterCard.id == sentenceCard.embeddingFor
      );

      if (!embeddedFilterCard.active) {
        const filterCardDisabledLens = {
          ...embeddedFilterCard,
          filterLens: DISABLED_FILTER_LENS,
        };

        this.applyFilterEvent.emit(filterCardDisabledLens);
      }
      setTimeout(() => this.applySentenceEvent.emit(sentenceCard), 1000);
    } else {
      this.applySentenceEvent.emit(sentenceCard);
    }
  }

  applySequence(sequenceCard: SequenceCard) {
    sequenceCard.sequenceRequest = {
      ...sequenceCard.sequenceRequest,
      distance: parseInt(sequenceCard.sequenceFormGroup.value.distance),
    };

    const filterCardBeforeWithDisabledLens = {
      ...this.filterCards.find(
        (filterCard) => filterCard.id == sequenceCard.sequenceFor[1]
      ),
      filterLens: DISABLED_FILTER_LENS,
    };

    const filterCardAfterWithDisabledLens = {
      ...this.filterCards.find(
        (filterCard) => filterCard.id == sequenceCard.sequenceFor[0]
      ),
      filterLens: DISABLED_FILTER_LENS,
    };

    sequenceCard.notApplied = false;

    this.applySequenceEvent.emit({
      sequenceCard: sequenceCard,
      beforeCard: filterCardBeforeWithDisabledLens,
      afterCard: filterCardAfterWithDisabledLens,
    });
  }

  getNumberValue(value: any) {
    switch (value.num) {
      case NumberValues.SING:
        return NumberValues.SING;
      case NumberValues.PLUR:
        return NumberValues.PLUR;
      default:
        return undefined;
    }
  }

  getGenderValue(value: any) {
    switch (value.gender) {
      case GenderValues.MASC:
        return GenderValues.MASC;
      case GenderValues.FEM:
        return GenderValues.FEM;
      default:
        return undefined;
    }
  }

  getDefiniteValue(value: any) {
    switch (value.definite) {
      case DefiniteValues.DEF:
        return DefiniteValues.DEF;
      case DefiniteValues.IND:
        return DefiniteValues.IND;
      default:
        return undefined;
    }
  }

  getTenseValue(value: any) {
    switch (value.tense) {
      case TenseValues.FUT:
        return TenseValues.FUT;
      case TenseValues.IMP:
        return TenseValues.IMP;
      case TenseValues.PAST:
        return TenseValues.PAST;
      case TenseValues.PRES:
        return TenseValues.PRES;
      default:
        return null;
    }
  }

  getVerbFormValue(value: any) {
    switch (value.verbform) {
      case VerbFormValues.FIN:
        return VerbFormValues.FIN;
      case VerbFormValues.GER:
        return VerbFormValues.GER;
      case VerbFormValues.INF:
        return VerbFormValues.INF;
      case VerbFormValues.PART:
        return VerbFormValues.PART;
      default:
        return null;
    }
  }

  getNumTypeValue(value: any) {
    switch (value.numtype) {
      case NumTypeValues.CARD:
        return NumTypeValues.CARD;
      case NumTypeValues.ORD:
        return NumTypeValues.ORD;
      default:
        return undefined;
    }
  }

  getProntypeValue(value: any) {
    switch (value.prontype) {
      case ProntypeValues.ART:
        return ProntypeValues.ART;
      case ProntypeValues.DEM:
        return ProntypeValues.DEM;
      case ProntypeValues.EXC:
        return ProntypeValues.EXC;
      case ProntypeValues.IND:
        return ProntypeValues.IND;
      case ProntypeValues.INT:
        return ProntypeValues.INT;
      case ProntypeValues.NEG:
        return ProntypeValues.NEG;
      case ProntypeValues.PRS:
        return ProntypeValues.PRS;
      case ProntypeValues.REL:
        return ProntypeValues.REL;
      case ProntypeValues.TOT:
        return ProntypeValues.TOT;
      default:
        return undefined;
    }
  }

  getForeignValue(value: any) {
    return value.foreign ? ForeignValues.YES : undefined;
  }
}
