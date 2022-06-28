import { LetterStatus } from "models/game";

export function splitWord(word: string) {
    return Array.from(word);
}

export function getGuessesLetterStates(solution: string, guesses: string[]){
    let states : { [key : string]: LetterStatus } = {};

    guesses.forEach((guess) => {
        splitWord(guess).forEach((letter, i) => {
            if (!solution.includes(letter)) {
                states[letter] = LetterStatus.WRONG;
                return
            } else if (letter === solution[i]) {
                states[letter] = LetterStatus.CORRECT;
                return
            } else if (states[letter] != LetterStatus.CORRECT) {
                states[letter] = LetterStatus.PRESENT;
            }
        });
    })

    return states;
}

export function getGuessLetterStates(solution: string, guess: string): LetterStatus[] {
    const splitSolution = splitWord(solution);
    const splitGuess = splitWord(guess);

    let charsTaken = splitSolution.map(() => false);

    let letterStates: LetterStatus[] = new Array(guess.length);

    // Check for the correct and wrong letters first.
    splitGuess.forEach((letter, i) => {
        if (letter === splitSolution[i]) {
            letterStates[i] = LetterStatus.CORRECT;
            charsTaken[i] = true;
        } else if (!splitSolution.includes(letter)) {
            letterStates[i] = LetterStatus.WRONG;
        }
    });

    splitGuess.forEach((letter, i) => {
        // Already set to correct or wrong, so ignore.
        if (letterStates[i]) return;

        // Handle the possible partial matches.
        const index = splitSolution.findIndex((sLetter, index) => sLetter === letter && !charsTaken[index])

        if (index > -1) {
            letterStates[i] = LetterStatus.PRESENT;
            charsTaken[index] = true;
        } else {
            letterStates[i] = LetterStatus.WRONG;
        }
    });

    return letterStates;
}
