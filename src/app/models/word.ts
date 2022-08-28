import { Direction } from "../enums/direction.enum";
import { Language } from "../enums/language.enum";

export class Word {
  key?: string;
  value?: string;
  suggestion?: string[];
  sourceLang?: Language;
  targetLang?: Language;
  sourceDirection?: Direction;
  targetDirection?: Direction;

  constructor(_key: string, _value: string, _suggestion: string[]){
    this.key = _key;
    this.value = _value;
    this.suggestion = _suggestion;
  }
}
