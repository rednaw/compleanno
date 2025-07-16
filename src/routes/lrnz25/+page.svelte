<script>
  let audio;
  const start = 0; // seconds
  const duration = 3; // seconds

  function playFragment() {
    audio.currentTime = start;
    audio.play();
    setTimeout(() => {
      audio.pause();
    }, duration * 1000);
  }
</script>

<main>
  <h1>Raad het liedje!</h1>
  <button on:click={playFragment} style="font-size:1.5em;padding:1em 2em;">▶️ Speel fragment</button>
  <audio bind:this={audio} src="/lrnz25/fragment1.mp3"></audio>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 2em;
  }
  h1 {
    margin-bottom: 2em;
    font-size: 2em;
    color: var(--color-theme-1);
  }
  button {
    background: var(--color-theme-1);
    color: var(--color-white);
    border: none;
    border-radius: 0.5em;
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 2em;
    transition: background 0.2s;
  }
  button:hover {
    background: var(--color-theme-2);
  }
</style> 