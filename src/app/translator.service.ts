import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Word } from './models/word';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {

  constructor() { }

  public getTranslate(): Observable<Word[]> {
    let words: Word[] = [];
    for (let i = 0; i < 10; i++) {
      words.push(
        new Word("word "+i.toString(), "کلمه "+i.toString())
      );
    }
    // const words = of(["word1","word2","word3","word4","word5"]);
    return of(words);
  }

}
