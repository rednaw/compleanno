/** @typedef {{ id: string, name: string, letter: string, kind: 'flag' | 'shape' }} Clue */

/** @type {readonly Clue[]} */
export const CLUES = Object.freeze([
	{ id: 'cambodia', name: 'Cambodia', letter: 'C', kind: 'shape' },
	{ id: 'afghanistan', name: 'Afghanistan', letter: 'A', kind: 'flag' },
	{ id: 'nauru', name: 'Nauru', letter: 'N', kind: 'shape' },
	{ id: 'angola', name: 'Angola', letter: 'A', kind: 'flag' },
	{ id: 'drenthe', name: 'Drenthe', letter: 'D', kind: 'shape' },
	{ id: 'amsterdam', name: 'Amsterdam', letter: 'A', kind: 'flag' }
]);

/** @type {Readonly<Record<string, string>>} */
export const FLAG_FILES = Object.freeze({
	afghanistan: 'Flag_of_Afghanistan.svg',
	angola: 'Flag_of_Angola.svg',
	amsterdam: 'Flag_of_Amsterdam.svg'
});

/** @type {Readonly<Record<string, string>>} */
export const SHAPE_FILES = Object.freeze({
	cambodia: 'Shape_of_Cambodia.svg',
	nauru: 'Shape_of_Nauru.svg',
	drenthe: 'Shape_of_Drenthe.jpg'
});

export const ANSWER = 'canada';

export const INTRO = 'Che paese è?';
