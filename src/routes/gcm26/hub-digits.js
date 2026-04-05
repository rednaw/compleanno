/**
 * Symbol shown on the GCM26 hub when each game (a–e) is completed.
 * Author these here; they are independent of each game’s internal solution
 * (e.g. film puzzle final codice, B/C/D/E answers).
 * @type {Readonly<Record<'a' | 'b' | 'c' | 'd' | 'e', string>>}
 */
export const gcm26HubDigit = Object.freeze({
	a: '7',
	b: '2',
	c: '5',
	d: '8',
	e: '0'
});
