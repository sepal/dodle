export interface Guess {
    word: string 
    correct: boolean
}

export enum PlayState {
  playing,
  success,
  fail,
}
