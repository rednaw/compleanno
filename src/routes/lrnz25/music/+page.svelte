<script>
  import { songs } from '../songs.js';
  import { base } from '$app/paths';

  let songStates = songs.map(() => ({
    guess: '',
    feedback: '',
    status: 'not-started',
    playing: false,
    audio: null,
    audioError: false,
    fragmentLevel: 1, // 1, 2, 5, or 20 seconds
    attempts: 0
  }));

  function getFragmentFile(song, level) { 
    return `${base}/lrnz25/song${song.number}_${level}.mp3`; 
  }

  function playFragment(idx) {
    const state = songStates[idx];
    if (state.audio && !state.audioError) {
      state.audio.currentTime = 0;
      state.audio.play();
      state.playing = true;
      
      // Play for the duration of the current fragment level
      const duration = state.fragmentLevel === 1 ? 1000 : 
                      state.fragmentLevel === 2 ? 2000 : 
                      state.fragmentLevel === 5 ? 5000 : 20000;
      
      setTimeout(() => { 
        state.audio.pause(); 
        state.playing = false; 
      }, duration);
    }
  }

  function checkGuess(idx) {
    const state = songStates[idx];
    const correct = songs[idx].answer.trim().toLowerCase();
    const user = state.guess.trim().toLowerCase();
    if (!user) return;
    
    if (user === correct) { 
      state.feedback = 'correct'; 
      state.status = 'correct'; 
    } else { 
      state.feedback = 'wrong'; 
      state.status = 'wrong'; 
      state.attempts++;
      
      // Progress to next fragment level if available
      if (state.fragmentLevel === 1) {
        state.fragmentLevel = 2;
      } else if (state.fragmentLevel === 2) {
        state.fragmentLevel = 5;
      } else if (state.fragmentLevel === 5) {
        state.fragmentLevel = 20;
      }
      // At 20 seconds, stay at that level
      
      // Clear the guess for next attempt
      state.guess = '';
    }
  }
  
</script>

<a href="{base}/lrnz25/" class="back-button">←</a>

<main>
  <div class="song-list">
    {#each songs as song, i}
      <div class="song-row {songStates[i].status}">
        <span class="song-number">{i + 1}.</span>
        <button type="button" class="play-btn" on:click={() => playFragment(i)} disabled={songStates[i].playing || songStates[i].audioError}>
          ▶️ Speel {songStates[i].fragmentLevel}s
        </button>
        <audio bind:this={songStates[i].audio} src={getFragmentFile(song, songStates[i].fragmentLevel)} on:error={() => songStates[i].audioError = true}></audio>
        <form on:submit|preventDefault={() => checkGuess(i)} class="guess-form">
          <input type="text" bind:value={songStates[i].guess} placeholder="Typ je antwoord..." autocomplete="off" disabled={songStates[i].status === 'correct'} />
          <button type="submit" disabled={songStates[i].playing || !songStates[i].guess.trim() || songStates[i].status === 'correct'}>Check</button>
        </form>
        {#if songStates[i].feedback === 'correct'}
          <span class="feedback correct">✅</span>
        {:else if songStates[i].feedback === 'wrong'}
          <span class="feedback wrong">❌</span>
        {/if}
        {#if songStates[i].status !== 'correct'}
          <span class="fragment-info">{songStates[i].fragmentLevel}s fragment</span>
        {/if}
      </div>
    {/each}
  </div>
</main>

<style>
  .back-button { position: fixed; top: 0em; left: 1em; font-size: 3em; color: var(--color-theme-1); text-decoration: none; font-weight: bold; z-index: 100; }
  main { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; background: var(--color-background); padding: 2em; box-sizing: border-box; }
  .song-list { width: 100%; margin-left: auto; margin-right: auto; box-sizing: border-box; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .song-row { display: flex; align-items: center; justify-content: center; padding: 0.7em 1em; border-radius: 0.5em; margin-bottom: 0.7em; background: var(--color-white); border: 2px solid var(--color-border); transition: border 0.2s, background 0.2s; font-size: 1.1em; gap: 0.7em; min-width: 0; max-width: 100vw; }
  .song-row.correct { background: #a5d6a7; border-color: #388e3c; color: #1b5e20; }
  .song-row.wrong { background: #ffcdd2; border-color: #d32f2f; color: #b71c1c; }
  .song-number { font-weight: bold; margin-right: 0.5em; }
  .play-btn { font-size: 1em; padding: 0.5em 1.2em; border-radius: 0.5em; border: none; background: var(--color-theme-1); color: var(--color-white); font-weight: bold; cursor: pointer; transition: background 0.2s; }
  .play-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .guess-form { display: flex; gap: 0.5em; margin-bottom: 0; justify-content: center; }
  input[type="text"] { font-size: 1.1em; padding: 0.5em 1em; border-radius: 0.5em; border: 1px solid var(--color-border); min-width: 120px; }
  button[type="submit"] { font-size: 1.1em; padding: 0.5em 1.2em; border-radius: 0.5em; border: none; background: var(--color-theme-2); color: var(--color-white); font-weight: bold; cursor: pointer; transition: background 0.2s; }
  button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
  .feedback { font-size: 1.5em; margin-left: 0.5em; }
  .feedback.correct { color: #388e3c; }
  .feedback.wrong { color: #d32f2f; }
  .fragment-info { font-size: 0.9em; color: var(--color-text); opacity: 0.7; margin-left: 0.5em; }
</style>

