import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Word } from './models/word';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  constructor(private http: HttpClient) { }

  public getTranslate(): Observable<Word[]> {
    let words: Word[] = [];
    for (let i = 1; i < 11; i++) {
      let suggestion: string[] = [];
      for (let j = 1; j < 6; j++) {
        suggestion.push("suggestion " + j.toString())
      }
      words.push(
        new Word("word " + i.toString(), "کلمه " + i.toString(), suggestion)
      );
    }
    // const words = of(["word1","word2","word3","word4","word5"]);
    return of(words);
  }

  public saveTranslate(words: Word[]): Observable<string> {
    let url_ = "http://localhost:5000/api/test";
    url_ = url_.replace(/[?&]$/, "");


    const content_ = JSON.stringify({
      "name":"mohammad",
      "words": words
      });

    let options_: any = {
      body: content_,
      observe: "response",
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    // return this.http.request("post", url_, options_).pipe((response) => {
    //   response.subscribe((result) => {
    //     console.log("SaveWords result: ", result);
    //   });
    //   // console.log(response);
    //   // console.log("SaveWords Respons: ", response);
    //   return of("");
    // });

    // this.http.post<any>('http://localhost:5050/api/saveWords', { title: 'Angular POST Request Example', words: words }).subscribe({
    //     next: data => {
    //       console.log("SaveWords Respons: ", data);
    //     },
    //     error: error => {
    //         console.error('There was an error!', error.message);
    //     }
    // })
    const upload$ = this.http.post(url_, content_, options_);
    upload$.subscribe((respons) => {
      console.log("SaveWords Respons: ", respons);
    });

    return of("true");
  }

  public uploadfile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);
    const upload$ = this.http.post("http://localhost:5050/api/upload", formData);
    upload$.subscribe();

    return of("true");
  }

}
