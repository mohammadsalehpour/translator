import { Direction } from "../enums/direction.enum";
import { Language } from "../enums/language.enum";

export class Word {
  key?: string;
  value?: string;
  suggestion?: Word[];
  sourceLang?: Language;
  targetLang?: Language;
  suggestedSource?: string;

  constructor(_key: string, _value: string, _suggestion: Word[], sourceLang: Language,
    targetLang: Language,
    suggestedSource: string) {
    this.key = _key;
    this.value = _value;
    this.suggestion = _suggestion;
    this.sourceLang = sourceLang;
    this.targetLang = targetLang;
    this.suggestedSource = suggestedSource;
  }


}
