<script>
  import { songs } from '../songs.js';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { checkOrientation, setupOrientationListeners, savePuzzleState, loadPuzzleState } from '../utils.js';
  import BackButton from '../components/BackButton.svelte';
  import RotateMessage from '../components/RotateMessage.svelte';

  let showRotateMessage = false;
  let isPortrait = false;

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

  let allSongsCompleted = false;

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
    
    // Save individual song state
    try {
      localStorage.setItem(`lrnz25_music_song_${idx}`, JSON.stringify({
        status: state.status,
        feedback: state.feedback,
        fragmentLevel: state.fragmentLevel,
        attempts: state.attempts
      }));
    } catch {}
    
    // Force immediate UI update
    songStates = [...songStates];
    
    // Check if all songs are now completed
    checkAllSongsCompleted();
  }

  function checkAllSongsCompleted() {
    allSongsCompleted = songStates.every(state => state.status === 'correct');
    
    // Save completion state to localStorage
    if (allSongsCompleted) {
      savePuzzleState('lrnz25_music_done', '1');
    }
  }

  // Check if puzzle was already completed on mount
  onMount(() => {
    try {
      // Load individual song states
      songStates.forEach((state, index) => {
        const savedState = localStorage.getItem(`lrnz25_music_song_${index}`);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          state.status = parsed.status;
          state.feedback = parsed.feedback;
          state.fragmentLevel = parsed.fragmentLevel;
          state.attempts = parsed.attempts;
        }
      });
      
      // Check if all songs are completed
      if (loadPuzzleState('lrnz25_music_done')) {
        allSongsCompleted = true;
      } else {
        // Check if all songs are now completed based on loaded states
        checkAllSongsCompleted();
      }
    } catch {}
    
    // Check orientation on mount
    const updateOrientation = () => {
      const isPortraitMode = checkOrientation(true); // Encourage portrait for music puzzle
      showRotateMessage = !isPortraitMode;
      isPortrait = isPortraitMode;
    };
    
    updateOrientation();
    
    // Listen for orientation changes
    const cleanup = setupOrientationListeners(updateOrientation);
    
    return cleanup;
  });
</script>

<BackButton />

<RotateMessage show={showRotateMessage} encouragePortrait={true} />

{#if !showRotateMessage}
  <main>
    <div class="song-list">
          {#each songs as song, i}
        <div class="song-container">
          <div class="song-row {songStates[i].status}">
            <button type="button" class="play-btn" on:click={() => playFragment(i)} disabled={songStates[i].playing || songStates[i].audioError}>
              ▶️ {songStates[i].fragmentLevel}s
            </button>
            <audio bind:this={songStates[i].audio} src={getFragmentFile(song, songStates[i].fragmentLevel)} on:error={() => songStates[i].audioError = true}></audio>
            {#if songStates[i].status !== 'correct'}
              <button type="button" on:click={() => checkGuess(i)} disabled={songStates[i].playing || !songStates[i].guess.trim() || songStates[i].status === 'correct'}>Check</button>
            {:else}
              <span class="feedback correct">✅</span>
            {/if}
          </div>
          <div class="input-row">
            {#if songStates[i].status !== 'correct'}
              <input type="text" bind:value={songStates[i].guess} autocomplete="off" disabled={songStates[i].status === 'correct'} on:keydown={(e) => e.key === 'Enter' && checkGuess(i)} />
            {:else}
              <span class="feedback correct">✅</span>
            {/if}
          </div>
        </div>
      {/each}
      
      {#if allSongsCompleted}
        <div class="result-section">
          <p class="result-text">🎉 2</p>
        </div>
      {/if}
    </div>
  </main>
{/if}

<style>

  
  main { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; background: var(--color-background); padding: 1rem 0.5rem 1rem 0.5rem; box-sizing: border-box; margin-top: 4rem; }
  .song-list { width: 100%; max-width: 100%; margin-left: auto; margin-right: auto; box-sizing: border-box; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .song-container { margin-bottom: 1.5em; width: 100%; }
  .song-row { display: flex; align-items: center; justify-content: center; padding: 0.8em 1em; border-radius: 0.5em; margin-bottom: 0.4em; background: var(--color-white); border: 2px solid var(--color-border); transition: border 0.2s, background 0.2s; font-size: 1.1em; gap: 0.8em; width: 100%; box-sizing: border-box; }
  .input-row { display: flex; align-items: center; justify-content: center; padding: 0.6em 1em; border-radius: 0.5em; background: var(--color-white); border: 2px solid var(--color-border); transition: border 0.2s, background 0.2s; width: 100%; box-sizing: border-box; }
  .song-row.correct { background: #a5d6a7; border-color: #388e3c; color: #1b5e20; }
  .song-row.wrong { background: #ffcdd2; border-color: #d32f2f; color: #b71c1c; }
  .play-btn { font-size: 1.1em; padding: 0.6em 1.2em; border-radius: 0.5em; border: none; background: var(--color-theme-1); color: var(--color-white); font-weight: bold; cursor: pointer; transition: background 0.2s; }
  .play-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .guess-form { display: flex; gap: 0.8em; margin-bottom: 0; justify-content: center; }
  input[type="text"] { font-size: 1.1em; padding: 0.6em 1em; border-radius: 0.5em; border: 1px solid var(--color-border); min-width: 150px; }
  .feedback { font-size: 1.5em; margin-left: 0.5em; }
  .feedback.correct { color: #388e3c; }
  .feedback.wrong { color: #d32f2f; }

  .result-section {
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.2rem 1.5rem;
    width: fit-content;
    min-width: 140px;
    margin: 2rem auto;
  }

  .result-text {
    font-size: 2.2rem;
    margin: 0;
    font-weight: bold;
    color: var(--color-text);
  }

  /* Responsive design for small screens */
  @media (max-width: 768px) {
    main {
      padding: 1rem 0.3rem;
    }
    
    .song-container {
      margin-bottom: 1em;
      width: 100%;
    }
    
    .song-row {
      padding: 0.6em 0.8em;
      margin-bottom: 0.3em;
      font-size: 1em;
      gap: 0.6em;
      width: 100%;
    }
    
    .input-row {
      padding: 0.5em 0.8em;
      width: 100%;
    }
    
    .play-btn {
      font-size: 1em;
      padding: 0.5em 1em;
    }
    
    input[type="text"] {
      min-width: 120px;
      font-size: 1em;
      padding: 0.5em 0.8em;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: 0.8rem 0.2rem;
    }
    
    .song-container {
      margin-bottom: 1em;
      width: 100%;
    }
    
    .song-row {
      padding: 0.5em 0.7em;
      margin-bottom: 0.3em;
      font-size: 0.9em;
      gap: 0.5em;
      flex-wrap: wrap;
      width: 100%;
    }
    
    .input-row {
      padding: 0.4em 0.7em;
      width: 100%;
    }
    
    .play-btn {
      font-size: 0.9em;
      padding: 0.4em 0.8em;
    }
    
    input[type="text"] {
      min-width: 100px;
      font-size: 0.9em;
      padding: 0.4em 0.7em;
    }
    
    .feedback {
      font-size: 1.2em;
      margin-left: 0.3em;
    }
  }
</style>

