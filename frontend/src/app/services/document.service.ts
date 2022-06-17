import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const HttpOptions: Object = {
  responseType: 'text',
};

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient) {}

  getDocument(docId: string) {
    return this.http.get<string>(
      `http://127.0.0.1:4200/getdocument?doc=${docId}`,
      HttpOptions
    );
  }

  listTexts() {
    return this.http.get<Object>(`http://127.0.0.1:4200/listtexts`);
  }
}
