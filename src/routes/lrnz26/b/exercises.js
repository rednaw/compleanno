export const EXERCISE_1_IMAGE = 'Exercise_1.png';
export const EXERCISE_2_IMAGE = 'Exercise_2.png';

export const ANSWER_1 = '5.5';
export const ANSWER_2 = 'WAX';

export const HINT_2 = 'Wees een kunstenaar, pak een potlood en teken!';

/** @param {string} guess */
export function matchesAnswer1(guess) {
	const trimmed = guess.trim().replace(',', '.');
	return trimmed === ANSWER_1 || Number(trimmed) === Number(ANSWER_1);
}
