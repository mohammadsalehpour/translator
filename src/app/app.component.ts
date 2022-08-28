import { Component } from '@angular/core';
import { Word } from './models/word';
import { TranslatorService } from './translator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title: any;
  public words?: Word[];

  constructor(private translatorService: TranslatorService) {
    this.getTranslate()
  }

  public getTranslate() {
    this.translatorService.getTranslate().subscribe((value: Word[]) => {
      this.words = value;
      console.log(value);
    });
  }

  public getWords() {
    console.log(this.words);
  }
}

