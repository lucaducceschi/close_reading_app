import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SentenceRequest,
  SequenceRequest,
  SequenceResponse,
} from '../models/filter-card';
import { FilterRequest } from '../models/filter-request';

const httpOptions: Object = {
  responseType: 'text',
};

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(private http: HttpClient) {}

  getFilter(filterRequest: FilterRequest): Observable<string> {
    return this.http.post<string>(
      `http://localhost:4200/getfilter`,
      filterRequest,
      httpOptions
    );
  }

  getSentence(sentenceRequest: SentenceRequest): Observable<string> {
    return this.http.post<string>(
      `http://localhost:4200/getsentence`,
      sentenceRequest,
      httpOptions
    );
  }

  getSequence(sequenceRequest: SequenceRequest): Observable<SequenceResponse> {
    return this.http.post<SequenceResponse>(
      `http://localhost:4200/getsequence`,
      sequenceRequest
    );
  }
}
