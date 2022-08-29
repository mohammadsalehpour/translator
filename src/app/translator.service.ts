import { Injectable } from '@angular/core';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, of, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Direction } from './enums/direction.enum';
import { Language } from './enums/language.enum';
import { GetData } from './models/get-data';
import { Word } from './models/word';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  private baseUrl: string;

  protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

  constructor(private http: HttpClient) {
    this.baseUrl = "http://localhost:5050/api";
  }

  public getTranslate(): Observable<GetData> {
    let url_ = this.baseUrl + "/word/getAll";
    url_ = url_.replace(/[?&]$/, "");

    let options_: any = {
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_: any) => {
      return this.processGetEntity(response_);
    })).pipe(_observableCatch((response_: any) => {
      if (response_ instanceof HttpResponseBase) {
        try {
          return this.processGetEntity(<any>response_);
        } catch (e) {
          return <Observable<GetData>><any>_observableThrow(e);
        }
      } else
        return <Observable<GetData>><any>_observableThrow(response_);
    }));




    // let words: Word[] = [];
    // for (let i = 1; i < 11; i++) {
    //   let suggestion: string[] = [];
    //   for (let j = 1; j < 6; j++) {
    //     suggestion.push("suggestion " + j.toString())
    //   }
    //   words.push(
    //     new Word("word " + i.toString(), "کلمه " + i.toString(), suggestion,
    //     Language.english, Language.persian, Direction.ltr, Direction.rtl)
    //   );
    // }
    // const words = of(["word1","word2","word3","word4","word5"]);
  }

  protected processGetEntity(response: HttpResponseBase): Observable<GetData> {
    const status = response.status;
    const responseBlob =
      response instanceof HttpResponse ? response.body : undefined;

    let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); } }
    if (status === 200) {
      let result200: GetData;
      console.log(responseBlob);
      // let resultData200 = responseBlob === "" ? null : JSON.parse(responseBlob.toString(), this.jsonParseReviver);
      result200 = GetData.fromJS(responseBlob);
      return _observableOf(result200);
    } else if (status !== 200 && status !== 204) {
      return blobToText(responseBlob).pipe(_observableMergeMap(_responseText => {
        return throwException("An unexpected server error occurred.", status, _responseText, _headers);
      }));
    }
    return _observableOf<GetData>(<any>null);
  }

  public saveTranslate(words: Word[]): Observable<string> {
    let url_ = this.baseUrl + "/word/saveAll";
    url_ = url_.replace(/[?&]$/, "");


    const content_ = JSON.stringify({
      "words": words
    });

    let options_: any = {
      body: content_,
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    const upload$ = this.http.post(url_, content_, options_);
    upload$.subscribe((respons) => {
      console.log("SaveWords Respons: ", respons);
    });

    return of("true");
  }

  public uploadfile(file: File): Observable<GetData> {
    let url_ = this.baseUrl + "/upload";
    url_ = url_.replace(/[?&]$/, "");

    let options_: any = {
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    try {
      const formData = new FormData();
      formData.append("file", file);
      const upload$ = this.http.post<GetData>(url_, formData);
      upload$.subscribe();
      return upload$;
    } catch (error) {
      console.error("error", error);

    }

    return of(new GetData);

  }


}

export class ApiException extends Error {
  override message: string;
  status: number;
  response: string;
  headers: { [key: string]: any; };
  result: any;

  constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
      super();

      this.message = message;
      this.status = status;
      this.response = response;
      this.headers = headers;
      this.result = result;
  }

  protected isApiException = true;

  static isApiException(obj: any): obj is ApiException {
      return obj.isApiException === true;
  }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
  if (result !== null && result !== undefined)
      return _observableThrow(result);
  else
      return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
  return new Observable<string>((observer: any) => {
      if (!blob) {
          observer.next("");
          observer.complete();
      } else {
          let reader = new FileReader();
          reader.onload = event => {
              observer.next((<any>event.target).result);
              observer.complete();
          };
          reader.readAsText(blob);
      }
  });
}
