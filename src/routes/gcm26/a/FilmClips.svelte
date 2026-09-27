<script>
	import { base } from '$app/paths';
	import { films, filmTitleMatches } from './films.js';
	import { saveFilmProgress, loadFilmProgress } from './persistence.js';
	import ClipTitleQuiz from '$lib/components/ClipTitleQuiz.svelte';
	import '$lib/quiz-form.css';

	/** @type {{ done: boolean }} */
	let { done = $bindable(false) } = $props();

	const clips = films.map((f) => ({
		id: f.id,
		title: f.title,
		src: `${base}/gcm26/a/${f.id}.mp4`,
		label: f.title
	}));
</script>

<ClipTitleQuiz
	{clips}
	matchTitle={filmTitleMatches}
	saveProgress={saveFilmProgress}
	loadProgress={loadFilmProgress}
	playLabel="▶️ Riproduci"
	checkLabel="Controlla"
	bind:done
/>
