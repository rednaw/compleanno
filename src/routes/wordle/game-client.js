import { words, allowed } from './words.js';

export class Game {
  /**
   * Create a game object from localStorage, or initialise a new game
   */
  constructor(serialized = undefined) {
    if (serialized) {
      const [answer, guesses, answers] = serialized.split('-');
      this.answer = answer;
      this.guesses = guesses ? guesses.split(' ') : [];
      this.answers = answers ? answers.split(' ') : [];
    } else {
      this.answer = 'caffe';
      this.guesses = ['', '', '', '', '', ''];
      this.answers = [];
    }
  }

  /**
   * Update game state based on a guess of a five-letter word. Returns
   * true if the guess was valid, false otherwise
   */
  enter(letters) {
    const word = letters.join('');
    const valid = allowed.has(word);
    if (!valid) return false;
    this.guesses[this.answers.length] = word;
    const available = Array.from(this.answer);
    const answer = Array(5).fill('_');
    // first, find exact matches
    for (let i = 0; i < 5; i += 1) {
      if (letters[i] === available[i]) {
        answer[i] = 'x';
        available[i] = ' ';
      }
    }
    // then find close matches
    for (let i = 0; i < 5; i += 1) {
      if (answer[i] === '_') {
        const index = available.indexOf(letters[i]);
        if (index !== -1) {
          answer[i] = 'c';
          available[index] = ' ';
        }
      }
    }
    this.answers.push(answer.join(''));
    return true;
  }

  /**
   * Serialize game state so it can be set in localStorage
   */
  toString() {
    return `${this.answer}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
  }
} 