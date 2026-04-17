export const INTRO_TEXT =
	'Vijf wiskundigen maken zich klaar voor hun aanstaande vakanties, naar vijf verschillende landen. ' +
	'Elke wiskundige heeft slechts één specialisatie, eet slechts één gerecht, en leest één boekenreeks. ' +
	'Elke wiskundige heeft een favoriete band en een lievelingsfilm, en zal nooit een andere film kijken ' +
	'of naar een andere band luisteren. De wiskundigen stemmen op vijf verschillende partijen, van links ' +
	'naar rechts: BIJ1, SP, PvdD, PRO en Volt.';

export const QUESTION_STEM = 'Wat stemt de wiskundige die:';

export const PARTIES = ['BIJ1', 'SP', 'PvdD', 'PRO', 'Volt'];

/** @type {ReadonlyArray<{ id: string; text: string; answer: string }>} */
export const CLUES = Object.freeze([
	{ id: 'tandoori', text: 'Zelfs voor ontbijt tandoori eet?', answer: 'SP' },
	{ id: 'fruit', text: 'Alleen maar naar liedjes over fruit luistert?', answer: 'Volt' },
	{ id: 'pidag', text: 'Zelfs op pi-dag naar il conformista gaat?', answer: 'BIJ1' },
	{
		id: 'topologie',
		text: 'Zijn masterscriptie over algebraïsche topologie heeft geschreven?',
		answer: 'BIJ1'
	},
	{
		id: 'stormlight',
		text: "In vijfduizend pagina's aan Stormlight Archive is gedoken?",
		answer: 'PRO'
	},
	{
		id: 'cyprus',
		text: 'In het zwembad in Cyprus misschien wel corona gaat oplopen?',
		answer: 'PvdD'
	}
]);
