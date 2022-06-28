import { LetterType } from "models/game";

export function splitWord(word: string) {
    return Array.from(word);
}

export function getLetterTypes(solution: string, guess: string): LetterType[] {
    const splitSolution = splitWord(solution);
    const splitGuess = splitWord(guess);

    let charsTaken = splitSolution.map(() => false);

    let guessTypes: LetterType[] = new Array(guess.length);

    // Check for the correct and wrong letters first.
    splitGuess.forEach((letter, i) => {
        if (letter === splitSolution[i]) {
            guessTypes[i] = LetterType.CORRECT;
            charsTaken[i] = true;
        } else if (!splitSolution.includes(letter)) {
            guessTypes[i] = LetterType.WRONG;
        }
    });

    splitGuess.forEach((letter, i) => {
        // Already set to correct or wrong, so ignore.
        if (guessTypes[i]) return;

        // Handle the possible partial matches.
        const index = splitSolution.findIndex((sLetter, index) => sLetter === letter && !charsTaken[index])

        if (index > -1) {
            guessTypes[i] = LetterType.PARTLY;
            charsTaken[index] = true;
        } else {
            guessTypes[i] = LetterType.WRONG;
        }
    });

    return guessTypes;
}
