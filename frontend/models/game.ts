export interface Guess {
    word: string 
    correct: boolean
}

export enum PlayState {
  playing,
  success,
  fail,
}

export enum LetterType {
  INPUT,
  WRONG,
  CORRECT,
  PARTLY,
}