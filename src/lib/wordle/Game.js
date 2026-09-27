import { allowed as defaultDictionary } from '$lib/words-it.js';

/**
 * Five-letter Wordle engine. Answer and dictionary are injected by the trail.
 */
export class Game {
	/**
	 * @param {object} [opts]
	 * @param {string} [opts.answer] required when starting a new game
	 * @param {string | null} [opts.serialized] localStorage payload from toString()
	 * @param {Set<string>} [opts.dictionary]
	 */
	constructor({ answer, serialized = null, dictionary = defaultDictionary } = {}) {
		this.dictionary = dictionary;
		if (serialized) {
			const [savedAnswer, guesses, answers] = serialized.split('-');
			this.answer = savedAnswer;
			this.guesses = guesses ? guesses.split(' ') : [];
			this.answers = answers ? answers.split(' ') : [];
		} else {
			if (!answer) throw new Error('Game requires answer when not restoring from serialized');
			this.answer = answer;
			this.guesses = ['', '', '', '', '', ''];
			this.answers = [];
		}
	}

	/** @param {string} word */
	normalizeWord(word) {
		return word
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	/**
	 * @param {string[]} letters
	 * @returns {boolean} true if the guess was valid
	 */
	enter(letters) {
		const word = letters.join('');
		const normalizedWord = this.normalizeWord(word);
		const valid = this.dictionary.has(word) || this.dictionary.has(normalizedWord);
		if (!valid) return false;
		this.guesses[this.answers.length] = word;
		const available = Array.from(this.answer);
		const answer = Array(5).fill('_');
		for (let i = 0; i < 5; i += 1) {
			if (this.normalizeWord(letters[i]) === this.normalizeWord(available[i])) {
				answer[i] = 'x';
				available[i] = ' ';
			}
		}
		for (let i = 0; i < 5; i += 1) {
			if (answer[i] === '_') {
				const index = available.findIndex(
					(char) => this.normalizeWord(char) === this.normalizeWord(letters[i])
				);
				if (index !== -1) {
					answer[i] = 'c';
					available[index] = ' ';
				}
			}
		}
		this.answers.push(answer.join(''));
		return true;
	}

	toString() {
		return `${this.answer}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
	}
}
