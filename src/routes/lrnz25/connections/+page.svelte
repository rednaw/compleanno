<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { checkOrientation, setupOrientationListeners, savePuzzleState, loadPuzzleState } from '../utils.js';
  import BackButton from '../components/BackButton.svelte';
  import RotateMessage from '../components/RotateMessage.svelte';

  const GROUPS = [
    { name: 'Gite a champoluc troncate a metà', color: '#f7d070', words: ['Mezza', 'Mari', 'Belve', 'Zerb'] },
    { name: 'Quantum_____', color: '#50b0e3', words: ['Leap', 'Cat', 'State', 'Information'] },
    { name: 'Viaggi fatti con noi', color: '#a78bfa', words: ['Abuc', 'Anic', 'Aivilob', 'Racsagadam'] },
    { name: 'Nomi propri di animali', color: '#94d3a2', words: ['Voorhuis', 'Zwartie', 'Pizza', 'Spijker'] }
  ];

  let tiles = [];
  let selected = new Set();
  let solvedGroups = [];
  let message = '';
  let shake = false;
  let showRotateMessage = false;
  let isLandscape = false;
  let showWinMessage = false;

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



  // Load saved progress
  onMount(() => {
    try {
      const saved = localStorage.getItem('lrnz25_connections_solved');
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
      
      // Check if puzzle was already completed
      if (loadPuzzleState('lrnz25_connections_done')) {
        showWinMessage = true;
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    
    // Check orientation on mount
    const updateOrientation = () => {
      const isLandscapeMode = checkOrientation(false); // Encourage landscape for connections puzzle
      showRotateMessage = !isLandscapeMode;
      isLandscape = isLandscapeMode;
    };
    
    updateOrientation();
    
    // Listen for orientation changes
    const cleanup = setupOrientationListeners(updateOrientation);
    
    return cleanup;
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
        localStorage.setItem('lrnz25_connections_solved', JSON.stringify(solvedGroups));
      } catch (e) {
        console.error('Error saving state:', e);
      }
      
      selected.clear();
      selected = new Set(selected);
      
      // Check win condition
      if (solvedGroups.length === 4) {
        message = 'Gefeliciteerd! Alle groepen gevonden.';
        showWinMessage = true;
        savePuzzleState('lrnz25_connections_done', '1');
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

<BackButton />

<RotateMessage show={showRotateMessage} encouragePortrait={false} />

{#if !showRotateMessage}
  <main class="container">
    <div class="game-layout">
      <div class="left-panel">
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
      </div>

      <div class="right-panel">
        {#if solvedGroups.length}
          <div class="solved">
            {#each solvedGroups.slice(0, 2) as group}
              <div class="solved-row" style="background: {group.color}; border-color: {group.color}">
                <div class="solved-title">{group.name}</div>
                <div class="solved-words">{group.words.join(', ')}</div>
              </div>
            {/each}
          </div>
        {/if}

        {#if message && solvedGroups.length < 4}
          <div class="message">{message}</div>
        {/if}
      </div>
    </div>

    {#if solvedGroups.length > 2}
      <div class="bottom-panel">
        <div class="solved">
          {#each solvedGroups.slice(2) as group}
            <div class="solved-row" style="background: {group.color}; border-color: {group.color}">
              <div class="solved-title">{group.name}</div>
              <div class="solved-words">{group.words.join(', ')}</div>
            </div>
          {/each}
        </div>
        
        {#if showWinMessage}
          <div class="win-message">🎉 5</div>
        {/if}
      </div>
    {/if}
  </main>
{/if}

<style>


  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background: var(--color-background);
    padding: 1rem;
    padding-top: 3rem;
    box-sizing: border-box;
  }

  .game-layout {
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
    max-width: 1000px;
    width: 100%;
  }

  .left-panel {
    flex-shrink: 0;
  }

  .right-panel {
    flex: 1;
    min-width: 250px;
    max-width: 350px;
    margin-left: 1rem;
  }

  .bottom-panel {
    width: 100%;
    max-width: 1000px;
    margin-top: 0.4rem;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .bottom-panel .solved {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .solved {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 0.4rem;
  }

  .solved-row {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.5rem 0.7rem;
    border: 2px solid;
    border-radius: 0.5rem;
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
    max-width: 480px;
    padding-bottom: 0.4rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
    width: 100%;
  }

  .tile {
    padding: 0.8rem 0.4rem;
    background: var(--color-white);
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
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
    width: 34px;
    height: 34px;
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
    margin-top: 0.5rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 1.2rem;
    text-align: center;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .win-message {
    color: var(--color-text);
    font-weight: 700;
    font-size: 2.2rem;
    text-align: center;
    padding: 1.2rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.5rem;
    border: 2px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: -0.5rem;
    margin-left: 0.5rem;
    width: fit-content;
    min-width: 140px;
  }

  .shake {
    animation: shake 0.4s;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
  }

  @media (max-width: 768px) {
    .game-layout {
      flex-direction: row;
      gap: 0.5rem;
    }
    
    .right-panel {
      min-width: auto;
      max-width: none;
    }
    
    .solved {
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .bottom-panel {
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 500px) {
    .game-layout {
      gap: 0.25rem;
    }
    
    .grid-wrap { 
      max-width: 55vw; 
    }
    
    .grid { 
      gap: 0.25rem; 
    }
    
    .tile { 
      padding: 0.4rem 0.25rem; 
      font-size: 0.7rem; 
      border-radius: 0.35rem;
    }
    
    .right-panel {
      min-width: 32vw;
    }
    
    .bottom-panel {
      margin-top: 0.4rem;
    }
    
    .bottom-panel .solved {
      gap: 0.4rem;
    }
    
    .solved {
      gap: 0.25rem;
    }
    
    .solved-row {
      padding: 0.35rem 0.5rem;
      border-radius: 0.35rem;
    }
    
    .solved-title {
      font-size: 0.75rem;
    }
    
    .solved-words {
      font-size: 0.65rem;
    }
    
    .message {
      font-size: 0.85rem;
      padding: 0.4rem 0.6rem;
      margin-top: 0.4rem;
    }
    
    .win-message {
      font-size: 1.8rem;
      padding: 1rem 1.2rem;
      min-width: 120px;
    }
    
    .check-dot {
      width: 28px;
      height: 28px;
      font-size: 1rem;
      bottom: -0.8rem;
    }
  }
</style>
