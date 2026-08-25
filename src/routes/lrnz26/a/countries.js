/** @typedef {{ id: string, kind: 'flag' | 'shape' }} Clue */

/** @type {readonly Clue[]} */
export const CLUES = Object.freeze([
	{ id: 'cambodia', kind: 'shape' },
	{ id: 'afghanistan', kind: 'flag' },
	{ id: 'nauru', kind: 'shape' },
	{ id: 'angola', kind: 'flag' },
	{ id: 'drenthe', kind: 'shape' },
	{ id: 'amsterdam', kind: 'flag' }
]);

/** @type {Readonly<Record<string, string>>} */
export const FLAG_FILES = Object.freeze({
	afghanistan: 'Flag_of_Afghanistan.jpg',
	angola: 'Flag_of_Angola.jpg',
	amsterdam: 'Flag_of_Amsterdam.jpg'
});

/** @type {Readonly<Record<string, string>>} */
export const SHAPE_FILES = Object.freeze({
	cambodia: 'Shape_of_Cambodia.jpg',
	nauru: 'Shape_of_Nauru.jpg',
	drenthe: 'Shape_of_Drenthe.jpg'
});

export const ANSWER = 'canada';

export const INTRO = 'Che paese è?';
