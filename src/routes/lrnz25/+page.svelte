<script>
  import { songs } from './songs.js';
  const fragmentDurations = [5, 10, 15];
  const fragmentLabels = ['5s', '10s', '15s'];

  // State for each song
  let songStates = songs.map(() => ({
    fragmentIdx: 0,
    guess: '',
    feedback: '',
    showAnswer: false,
    status: 'not-started' // 'not-started', 'in-progress', 'correct', 'failed'
  }));

  let currentSongIdx = 0;
  let audio;
  let playing = false;

  function getFragmentFile(song, fragIdx) {
    return `/lrnz25/song${song.number}_${fragmentDurations[fragIdx]}.mp3`;
  }

  function playFragment(idx = songStates[currentSongIdx].fragmentIdx) {
    audio.src = getFragmentFile(songs[currentSongIdx], idx);
    audio.currentTime = 0;
    audio.play();
    playing = true;
    setTimeout(() => {
      audio.pause();
      playing = false;
    }, fragmentDurations[idx] * 1000);
  }

  function checkGuess() {
    const state = songStates[currentSongIdx];
    const correct = songs[currentSongIdx].answer.trim().toLowerCase();
    const user = state.guess.trim().toLowerCase();
    state.status = 'in-progress';
    if (user === correct) {
      state.feedback = '✅ Goed!';
      state.status = 'correct';
      setTimeout(() => gotoNext(), 1200);
    } else {
      if (state.fragmentIdx < 2) {
        state.feedback = '❌ Probeer het met een langer fragment!';
        state.fragmentIdx++;
        state.guess = '';
      } else {
        state.feedback = '❌ Helaas! Het juiste antwoord was: ' + songs[currentSongIdx].answer;
        state.showAnswer = true;
        state.status = 'failed';
        setTimeout(() => gotoNext(), 2200);
      }
    }
  }

  function gotoNext() {
    if (currentSongIdx < songs.length - 1) {
      currentSongIdx++;
    }
  }
  function gotoPrev() {
    if (currentSongIdx > 0) {
      currentSongIdx--;
    }
  }
  function selectSong(idx) {
    currentSongIdx = idx;
  }

  $: allDone = songStates.every(s => s.status === 'correct' || s.status === 'failed');
</script>

<main>
  <h1>Raad het liedje!</h1>
  <div class="song-list">
    {#each songs as song, i}
      <button type="button"
        class="song-row {currentSongIdx === i ? 'active' : ''} {songStates[i].status}"
        aria-current={currentSongIdx === i ? 'true' : undefined}
        on:click={() => selectSong(i)}>
        <span class="song-number">{i + 1}.</span>
        <span class="song-status">
          {#if songStates[i].status === 'correct'}✅ Goed!
          {:else if songStates[i].status === 'failed'}❌ Fout
          {:else if songStates[i].status === 'in-progress'}⏳ Bezig
          {:else}⬜ Niet gestart
          {/if}
        </span>
      </button>
    {/each}
  </div>
  <!-- Removed nav-btns -->
  {#if allDone}
    <div class="done">🎉 Je hebt alle liedjes gehad!</div>
  {/if}
  {#if !allDone}
    <div class="current-song-block">
      <div class="fragment-controls">
        {#each fragmentLabels as label, idx}
          <button on:click={() => playFragment(idx)} disabled={playing} class:active={songStates[currentSongIdx].fragmentIdx === idx}>
            ▶️ {label}
          </button>
        {/each}
      </div>
      <audio bind:this={audio} src={getFragmentFile(songs[currentSongIdx], songStates[currentSongIdx].fragmentIdx)}></audio>
      <form on:submit|preventDefault={checkGuess} class="guess-form">
        <input type="text" bind:value={songStates[currentSongIdx].guess} placeholder="Typ je antwoord..." autocomplete="off" />
        <button type="submit" disabled={playing || !songStates[currentSongIdx].guess.trim()}>Check</button>
      </form>
      {#if songStates[currentSongIdx].feedback && !songStates[currentSongIdx].showAnswer}
        <div class="feedback">{songStates[currentSongIdx].feedback}</div>
      {/if}
      {#if songStates[currentSongIdx].showAnswer}
        <div class="answer">{songStates[currentSongIdx].feedback}</div>
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    background: var(--color-background);
    padding: 2em;
    box-sizing: border-box;
  }
  h1 {
    margin-bottom: 1em;
    font-size: 2em;
    color: var(--color-theme-1);
  }
  .song-list {
    max-width: 400px;
    margin-bottom: 1em;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
  .song-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7em 1em;
    border-radius: 0.5em;
    margin-bottom: 0.4em;
    background: var(--color-white);
    cursor: pointer;
    border: 2px solid var(--color-border);
    transition: border 0.2s, background 0.2s;
    font-size: 1.1em;
  }
  .song-row.active {
    border: 2px solid var(--color-theme-1);
    background: var(--color-hover-bg);
  }
  .song-row.correct {
    background: #a5d6a7;
    border-color: #388e3c;
    color: #1b5e20;
  }
  .song-row.failed {
    background: #ffcdd2;
    border-color: #d32f2f;
    color: #b71c1c;
  }
  .song-row.in-progress {
    background: #fff9c4;
    border-color: #fbc02d;
    color: #795548;
  }
  .song-number {
    font-weight: bold;
    margin-right: 1em;
  }
  .song-status {
    font-size: 1em;
  }
  .current-song-block {
    max-width: 400px;
    background: var(--color-white);
    border-radius: 0.5em;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 1.5em 1em 1em 1em;
    margin-bottom: 1em;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
    align-self: center;
  }
  .fragment-controls {
    display: flex;
    gap: 0.5em;
    margin-bottom: 1em;
    justify-content: center;
  }
  .fragment-controls button {
    font-size: 1.1em;
    padding: 0.5em 1.2em;
    border-radius: 0.5em;
    border: none;
    background: var(--color-theme-1);
    color: var(--color-white);
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .fragment-controls button.active {
    background: var(--color-theme-2);
  }
  .fragment-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .guess-form {
    display: flex;
    gap: 0.5em;
    margin-bottom: 1em;
    justify-content: center;
  }
  input[type="text"] {
    font-size: 1.1em;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    border: 1px solid var(--color-border);
    min-width: 180px;
  }
  button[type="submit"] {
    font-size: 1.1em;
    padding: 0.5em 1.2em;
    border-radius: 0.5em;
    border: none;
    background: var(--color-theme-2);
    color: var(--color-white);
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  button[type="submit"]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .feedback, .answer, .done {
    margin: 1em 0;
    font-size: 1.2em;
    color: var(--color-theme-1);
    text-align: center;
  }
  @media (max-width: 500px) {
    .song-list,
    .current-song-block {
      width: 100%;
      max-width: 100vw;
    }
  }
  @media (min-width: 600px) {
    .song-list,
    .current-song-block {
      max-width: 400px;
    }
  }
</style> 