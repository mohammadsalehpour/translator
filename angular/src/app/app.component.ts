import { Component } from '@angular/core';
import { Word } from './models/word';
import { TranslatorService } from './translator.service';
import notify from 'devextreme/ui/notify';
import { GetData } from './models/get-data';
import { Language } from './enums/language.enum';
import { Direction } from './enums/direction.enum';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title: any;
  public displayedColumns = ['key', 'value'];
  public dataSource: any;
  public fileName: string = '';
  public file?: File;

  public rtlEnabled: boolean = true;
  public words?: Word[];
  public word: Word;

  public uploadPopupVisible = false;
  public uploadButtonOptions: any;
  public closeButtonOptions: any;

  constructor(private translatorService: TranslatorService) {
    this.rtlEnabled = true;
    this.word = new Word("", "", [], Language.english, Language.persian, "");
    this.depends();

  }

  public depends() {
    const that = this;
    this.uploadButtonOptions = {
      icon: 'upload',
      text: 'Upload',
      onClick() {
        that.uploadFile();
      },
    };
    this.closeButtonOptions = {
      text: 'Close',
      onClick() {
        that.uploadPopupVisible = false;
      },
    };
  }

  public getFileWords() {
    this.translatorService.getTranslate().subscribe((value: GetData) => {
      console.log("value", value);
      this.dataSource = <Word[]>value.data;
      this.fileName = <string>value.result;
      this.words = <Word[]>value.data;
      console.log("dataSource : ", this.dataSource);
    });
  }

  public getWord(word: Word) {
    this.translatorService.getWord(word.key!).subscribe((value: GetData) => {
      console.log("value", value);
      this.word = <Word>value.data;
      console.log(value);
    });
  }

  public changeWordValue(event: KeyboardEvent): void {
    this.word!.value = (<HTMLTextAreaElement>event.target).value;
    console.log("event", event);
  }

  public acceptSugges(sugges: Word): void {
    this.word!.value = sugges.value;
    this.words?.map(word=>{
      if (word.key == sugges.key) {
        word.value = sugges.value;
      }
      return word;
    });
    console.log(this.words);



    // let word = this.words?.find(word=> word.key == sugges.key);

    this.dataSource = this.words;
    console.log(sugges);
  }

  public selectFile(): void {
    this.uploadPopupVisible = true;
  }

  public save(): void {
    this.translatorService.saveTranslate(this.words!).subscribe((value: string) => {
      notify({
        message: `Save ${value}`,
        height: 45,
        width: 400,
        minWidth: 150,
        type: 'success',
        displayTime: 3500,
        animation: {
          show: {
            type: 'fade', duration: 400, from: 0, to: 1,
          },
          hide: { type: 'fade', duration: 40, to: 0 },
        },
      },
        { position: "bottom right", direction: "up-push" });
    });
  }

  public uploadFile(): void {
    if (this.file) {
      this.translatorService.uploadfile(this.file!).subscribe((value: GetData) => {
        this.uploadPopupVisible = false;
        this.file = undefined;
        this.fileName = "";
        this.getFileWords();
        notify({
          message: `Upload File ${value.message}`,
          height: 45,
          width: 400,
          minWidth: 150,
          type: value.error ? 'error' : 'success',
          displayTime: 3500,
          animation: {
            show: {
              type: 'fade', duration: 400, from: 0, to: 1,
            },
            hide: { type: 'fade', duration: 40, to: 0 },
          },
        },
          { position: "bottom right", direction: "up-push" });
      });
    } else {
      this.uploadPopupVisible = false;
      this.file = undefined;
      this.fileName = "";
      notify({
        message: `No file is selected!`,
        height: 45,
        width: 400,
        minWidth: 150,
        type: 'warning',
        displayTime: 3500,
        animation: {
          show: {
            type: 'fade', duration: 400, from: 0, to: 1,
          },
          hide: { type: 'fade', duration: 40, to: 0 },
        },
      },
        { position: "bottom right", direction: "up-push" });
    }
  }

  public downloadFile(): void {

    if (this.fileName != "") {
      this.translatorService.downloadFile(this.fileName).subscribe((value: GetData) => {

        console.log("downloadFile value :", value);
        notify({
          message: `Download File ${value.message}`,
          height: 45,
          width: 400,
          minWidth: 150,
          type: value.error ? 'error' : 'success',
          displayTime: 3500,
          animation: {
            show: {
              type: 'fade', duration: 400, from: 0, to: 1,
            },
            hide: { type: 'fade', duration: 40, to: 0 },
          },
        },
          { position: "bottom right", direction: "up-push" });
      });
    }

  }

  public onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.file = file;
    }
  }

}

