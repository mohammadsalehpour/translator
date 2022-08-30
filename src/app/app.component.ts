import { Component } from '@angular/core';
import { Word } from './models/word';
import { TranslatorService } from './translator.service';
import notify from 'devextreme/ui/notify';
import { GetData } from './models/get-data';

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
  public word?: Word;

  public savePopupVisible = false;
  public saveButtonOptions: any;
  public closeButtonOptions: any;

  public uploadPopupVisible = false;
  public uploadButtonOptions: any;


  constructor(private translatorService: TranslatorService) {
    this.rtlEnabled = true;
    this.depends();

  }

  public depends() {
    const that = this;
    this.saveButtonOptions = {
      icon: 'save',
      text: 'Save',
      onClick() {
        that.save();
      },
    };
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
        that.savePopupVisible = false;
        that.uploadPopupVisible = false;
      },
    };
  }

  public getWords() {
    this.translatorService.getTranslate().subscribe((value: GetData) => {
      console.log("value", value);
      this.dataSource = <Word[]>value.data;
      this.words = <Word[]>value.data;
      console.log(value);
    });
  }

  public getWord(word: Word) {
    this.word = word;
    console.log(this.word);
  }

  public acceptSugges(sugges: string): void {
    this.word!.value = sugges;
    console.log(sugges);
  }

  public confirmSave(): void {
    this.savePopupVisible = true;
  }

  public selectFile(): void {
    this.uploadPopupVisible = true;
  }

  public save(): void {
    this.translatorService.saveTranslate(this.words!).subscribe((value: string) => {
      this.savePopupVisible = false;
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
        this.getWords();
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

  public onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.file = file;
    }
  }

}

