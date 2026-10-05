/**
 * Each game’s prize is a person (photo + name) with a random digit.
 * Code = digits oldest → youngest: Lorenzo 3, Giacomo 7, Nicolò 9, Sofia 5 → `3795`.
 * Player knows the age order; digits are not ages.
 */

/** @readonly */
export const grt26Prizes = Object.freeze({
	a: { name: 'Sofia', digit: '5' },
	b: { name: 'Nicolò', digit: '9' },
	c: { name: 'Lorenzo', digit: '3' },
	d: { name: 'Giacomo', digit: '7' }
});

/** Code digits oldest → youngest (Lorenzo, Giacomo, Nicolò, Sofia). */
export const GRT26_CODE = '3795';

/** Filename under `/grt26/code/` for each game’s fullscreen win image. */
/** @readonly */
export const grt26PrizeImages = Object.freeze({
	a: 'sofia.jpg',
	b: 'nicolo.png',
	c: 'lorenzo.png',
	d: 'giacomo.png'
});
