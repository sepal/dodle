import { LetterStatus } from "models/game";
import { getGuessLetterStates, splitWord } from "./letter_status";


function getShareTile(letterState: LetterStatus) : string {
    switch (letterState) {
        case LetterStatus.CORRECT:
            return '🟩';
        case LetterStatus.PRESENT:
            return '🟨';
        default:
            return '⬜';
    }
}

function getGuessShareTiles(solution: string, guess: string) : string {
    const states = getGuessLetterStates(solution, guess);
    const tiles = states.map(getShareTile);
    return tiles.join("");
}

export function getShareText(solution: string, guesses: string[], maxGuesses: number, gameId: number) : string {
    const tiles = guesses.map(guess => getGuessShareTiles(solution, guess)).join("\n");
    const url = window.location.href;
    
    return `Dodle game #${gameId} ${guesses.length}/${maxGuesses}\n\n${tiles}\n\n${url}`;

}