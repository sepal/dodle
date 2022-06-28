export interface Guess {
    word: string 
    correct: boolean
}

export enum PlayState {
  playing,
  success,
  fail,
}

export enum LetterStatus {
  INPUT,
  WRONG,
  CORRECT,
  PRESENT,
}