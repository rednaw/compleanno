import manifest from './manifest.json';

const { commonQuestion, commonAnswer, finalCode } = manifest;

if (
	typeof commonQuestion !== 'string' ||
	typeof commonAnswer !== 'string' ||
	!finalCode ||
	typeof finalCode.answer !== 'string' ||
	!Array.isArray(finalCode.hintSegments)
) {
	throw new Error(
		'gcm26/a manifest.json: require commonQuestion, commonAnswer, and finalCode { answer, hintSegments }'
	);
}

export const COMMON_QUESTION = commonQuestion;
export const COMMON_ANSWER = commonAnswer;
export const FINAL_CODE_ANSWER = finalCode.answer;
export const FINAL_HINT_SEGMENTS = finalCode.hintSegments;

if (import.meta.env.DEV) {
	if (FINAL_HINT_SEGMENTS.length !== FINAL_CODE_ANSWER.length) {
		console.error(
			`[gcm26/a] manifest finalCode: hintSegments length (${FINAL_HINT_SEGMENTS.length}) must equal answer length (${FINAL_CODE_ANSWER.length})`
		);
	}
}

export { normalizeAnswer as normalizeFilmTitle, answerMatches as filmTitleMatches } from '../normalize.js';

/** @type {{ id: string; title: string; url?: string }[]} */
export const films = manifest.clips;
