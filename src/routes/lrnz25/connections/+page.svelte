<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';

  const GROUPS = [
    { name: 'Gite a champoluc troncate a metà', color: '#f7d070', words: ['Mezza', 'Mari', 'Belve', 'Zerb'] },
    { name: 'Matematica quantum', color: '#50b0e3', words: ['Leap', 'Cat', 'State', 'Information'] },
    { name: 'Viaggi fatti con noi', color: '#a78bfa', words: ['Abuc', 'Anic', 'Aivilob', 'Racsagadam'] },
    { name: 'Nomi propri di animali', color: '#94d3a2', words: ['Voorhuis', 'Swartie', 'Pizza', 'Spijker'] }
  ];

  let tiles = [];
  let selected = new Set();
  let solvedGroups = [];
  let message = '';
  let shake = false;
  let showRotateMessage = false;
  let isLandscape = false;

  // Initialize tiles from groups
  function initTiles() {
    tiles = GROUPS.flatMap((group, groupIndex) => 
      group.words.map(word => ({ 
        label: word, 
        groupIndex, 
        locked: false 
      }))
    ).sort(() => Math.random() - 0.5); // Shuffle
  }

  // Check device orientation and screen size
  function checkOrientation() {
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.innerHeight > window.innerWidth;
    
    if (isMobile && isPortrait) {
      showRotateMessage = true;
      isLandscape = false;
    } else {
      showRotateMessage = false;
      isLandscape = true;
    }
  }

  // Load saved progress
  onMount(() => {
    try {
      const saved = sessionStorage.getItem('lrnz25_connections_solved');
      if (saved) {
        solvedGroups = JSON.parse(saved);
        // Lock solved tiles
        solvedGroups.forEach(group => {
          const groupIndex = GROUPS.findIndex(g => g.name === group.name);
          if (groupIndex !== -1) {
            tiles = tiles.map(t => 
              t.groupIndex === groupIndex ? { ...t, locked: true } : t
            );
          }
        });
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    
    // Check orientation on mount
    checkOrientation();
    
    // Listen for orientation changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  });

  // Initialize on first load
  initTiles();

  function toggleTile(idx) {
    if (tiles[idx].locked) return;
    
    if (selected.has(idx)) {
      selected.delete(idx);
    } else if (selected.size < 4) {
      selected.add(idx);
    }
    
    message = '';
    selected = new Set(selected);
  }

  function checkSelection() {
    if (selected.size !== 4) return;
    
    const indices = Array.from(selected);
    const groupIndices = indices.map(i => tiles[i].groupIndex);
    
    // Check if all 4 words are from the same group
    if (groupIndices.every(g => g === groupIndices[0])) {
      const group = GROUPS[groupIndices[0]];
      
      // Add to solved groups
      solvedGroups = [...solvedGroups, { 
        name: group.name, 
        color: group.color, 
        words: [...group.words] 
      }];
      
      // Lock tiles
      tiles = tiles.map(t => 
        t.groupIndex === groupIndices[0] ? { ...t, locked: true } : t
      );
      
      // Save progress
      try {
        sessionStorage.setItem('lrnz25_connections_solved', JSON.stringify(solvedGroups));
      } catch (e) {
        console.error('Error saving state:', e);
      }
      
      message = group.name;
      selected.clear();
      selected = new Set(selected);
      
      // Check win condition
      if (solvedGroups.length === 4) {
        message = 'Gefeliciteerd! Alle groepen gevonden.';
        try {
          sessionStorage.setItem('lrnz25_connections_done', '1');
        } catch {}
      }
    } else {
      // Count words from same group
      const groupCounts = {};
      indices.forEach(i => {
        const tile = tiles[i];
        if (!solvedGroups.some(sg => sg.name === GROUPS[tile.groupIndex].name)) {
          groupCounts[tile.groupIndex] = (groupCounts[tile.groupIndex] || 0) + 1;
        }
      });
      
      const maxCount = Math.max(...Object.values(groupCounts));
      
      if (maxCount === 3) {
        message = 'Ne manca ancora uno...';
      } else {
        message = 'Sbagliato, riprova.';
      }
      
      shake = true;
      setTimeout(() => shake = false, 400);
    }
  }
</script>

<a href="{base}/lrnz25/" class="back-button">←</a>

  {#if showRotateMessage}
    <div class="rotate-message">
      <div class="rotate-icon">📱↔️</div>
    </div>
  {:else}
  <main class="container">
  {#if solvedGroups.length}
    <div class="solved">
      {#each solvedGroups as group}
        <div class="solved-row" style="background: {group.color}; border-color: {group.color}">
          <div class="solved-title">{group.name}</div>
          <div class="solved-words">{group.words.join(', ')}</div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="grid-wrap">
    <div class="grid" class:shake>
      {#each tiles as tile, i}
        <button
          type="button"
          class="tile"
          class:selected={selected.has(i)}
          class:locked={tile.locked}
          disabled={tile.locked || solvedGroups.length === 4}
          on:click={() => toggleTile(i)}
        >
          {tile.label}
        </button>
      {/each}
    </div>
    
    {#if selected.size === 4 && solvedGroups.length < 4}
      <button 
        type="button" 
        class="check-dot" 
        on:click={checkSelection}
        aria-label="Controleer selectie"
      >
        ✔
      </button>
    {/if}
  </div>

  {#if message}
    <div class="message">{message}</div>
  {/if}
  </main>
{/if}

<style>
  .rotate-message {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-background);
  }

  .rotate-icon {
    font-size: 8rem;
    animation: rotate 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  @keyframes rotate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-15deg) scale(1.1); }
    75% { transform: rotate(15deg) scale(1.1); }
  }

  .back-button {
    position: fixed;
    top: 0;
    left: 1rem;
    font-size: 3rem;
    color: var(--color-theme-1);
    text-decoration: none;
    font-weight: bold;
    z-index: 100;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .solved {
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }

  .solved-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.6rem 0.8rem;
    border: 2px solid;
    border-radius: 0.6rem;
    color: #1b1b1b;
  }

  .solved-title {
    font-weight: 800;
    letter-spacing: 0.03em;
  }

  .solved-words {
    font-weight: 600;
  }

  .grid-wrap {
    position: relative;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    padding-bottom: 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    width: 100%;
  }

  .tile {
    padding: 1rem 0.5rem;
    background: var(--color-white);
    border: 2px solid var(--color-border);
    border-radius: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    cursor: pointer;
    color: var(--color-text);
    text-transform: uppercase;
  }

  .tile.selected {
    background: #ffe082;
    border-color: #ffb300;
  }

  .tile.locked {
    background: #e8f5e9;
    border-color: #2e7d32;
    color: #1b5e20;
    cursor: default;
  }

  .check-dot {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--color-theme-2);
    background: var(--color-theme-2);
    color: var(--color-white);
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    cursor: pointer;
  }

  .check-dot:active {
    transform: translateX(-50%) scale(0.97);
  }

  .message {
    margin-top: 0.8rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 1.2rem;
    text-align: center;
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.6rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .shake {
    animation: shake 0.4s;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }

  @media (max-width: 500px) {
    .grid-wrap { max-width: 98vw; }
    .grid { gap: 0.4rem; }
    .tile { padding: 0.8rem 0.4rem; font-size: 0.95rem; }
  }
</style>
