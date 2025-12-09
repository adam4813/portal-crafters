import { Game } from './game/Game';
import { SaveSystem } from './game/SaveSystem';

let game: Game | null = null;

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
}

function renderSaveSlots(saveSystem: SaveSystem, isNewGame: boolean): void {
  const slotsContainer = document.getElementById('save-slots');
  if (!slotsContainer) return;

  const slots = saveSystem.getAllSaveSlots();
  let html = '';

  for (const slot of slots) {
    if (slot.isEmpty) {
      html += `
        <div class="save-slot empty" data-slot="${slot.slot}">
          <div class="slot-header">Slot ${slot.slot + 1}</div>
          <div class="slot-empty">Empty</div>
          ${isNewGame ? '<button class="btn-primary slot-action-btn" data-action="new">Start New Game</button>' : ''}
        </div>
      `;
    } else {
      html += `
        <div class="save-slot" data-slot="${slot.slot}">
          <div class="slot-header">Slot ${slot.slot + 1}</div>
          <div class="slot-info">
            <div class="slot-detail">💰 ${slot.gold} Gold</div>
            <div class="slot-detail">⭐ Tier ${slot.tier}</div>
            <div class="slot-detail">⏱️ ${formatPlayTime(slot.playTime)}</div>
            <div class="slot-detail">📅 ${slot.lastSaveTime ? formatDate(slot.lastSaveTime) : 'Never'}</div>
          </div>
          <div class="slot-actions">
            ${isNewGame ? '<button class="btn-danger-small slot-action-btn" data-action="overwrite">Overwrite</button>' : '<button class="btn-primary slot-action-btn" data-action="load">Load</button>'}
            <button class="btn-danger-small slot-action-btn" data-action="delete">🗑️</button>
          </div>
        </div>
      `;
    }
  }

  slotsContainer.innerHTML = html;

  // Add event listeners for slot buttons
  slotsContainer.querySelectorAll('.slot-action-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const slotEl = (btn as HTMLElement).closest('.save-slot');
      const slot = parseInt(slotEl?.getAttribute('data-slot') || '0', 10);
      const action = (btn as HTMLElement).getAttribute('data-action');

      if (action === 'new' || action === 'overwrite') {
        if (action === 'overwrite') {
          if (!confirm('Are you sure you want to overwrite this save?')) return;
        }
        await startGame(slot, true);
      } else if (action === 'load') {
        await startGame(slot, false);
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this save?')) {
          saveSystem.deleteSlot(slot);
          renderSaveSlots(saveSystem, isNewGame);
        }
      }
    });
  });
}

async function startGame(slot: number, isNewGame: boolean): Promise<void> {
  const titleScreen = document.getElementById('title-screen');
  const appContainer = document.getElementById('app');

  if (!titleScreen || !appContainer) return;

  try {
    // Create and initialize the game
    game = new Game('portal-canvas');
    game.getSaveSystem().setCurrentSlot(slot);

    if (!isNewGame) {
      // Load existing save
      const savedState = game.getSaveSystem().loadFromSlot(slot);
      if (savedState) {
        game.loadState(savedState);
      }
    }

    await game.initialize();

    // Hide title screen, show game
    titleScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Start the game loop
    game.start();

    // Expose game to window for debugging
    (window as unknown as { game: Game }).game = game;

    console.log('Portal Crafters initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Portal Crafters:', error);
  }
}

export function returnToTitle(): void {
  const titleScreen = document.getElementById('title-screen');
  const appContainer = document.getElementById('app');
  const saveSlotsContainer = document.getElementById('save-slots-container');
  const titleMenu = document.querySelector('.title-menu');

  if (game) {
    game.saveGame();
    game.stop();
    game = null;
  }

  if (titleScreen && appContainer) {
    appContainer.classList.add('hidden');
    titleScreen.classList.remove('hidden');
  }

  // Reset to main menu
  if (saveSlotsContainer && titleMenu) {
    saveSlotsContainer.classList.add('hidden');
    (titleMenu as HTMLElement).classList.remove('hidden');
  }
}

// Make returnToTitle available globally
(window as unknown as { returnToTitle: () => void }).returnToTitle = returnToTitle;

// Initialize the title screen when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portal Crafters starting...');

  const saveSystem = new SaveSystem();

  const newGameBtn = document.getElementById('new-game-btn');
  const loadGameBtn = document.getElementById('load-game-btn');
  const backToTitleBtn = document.getElementById('back-to-title-btn');
  const saveSlotsContainer = document.getElementById('save-slots-container');
  const titleMenu = document.querySelector('.title-menu');

  newGameBtn?.addEventListener('click', () => {
    if (titleMenu) (titleMenu as HTMLElement).classList.add('hidden');
    if (saveSlotsContainer) saveSlotsContainer.classList.remove('hidden');
    renderSaveSlots(saveSystem, true);
  });

  loadGameBtn?.addEventListener('click', () => {
    if (!saveSystem.hasAnySaveData()) {
      alert('No saved games found!');
      return;
    }
    if (titleMenu) (titleMenu as HTMLElement).classList.add('hidden');
    if (saveSlotsContainer) saveSlotsContainer.classList.remove('hidden');
    renderSaveSlots(saveSystem, false);
  });

  backToTitleBtn?.addEventListener('click', () => {
    if (saveSlotsContainer) saveSlotsContainer.classList.add('hidden');
    if (titleMenu) (titleMenu as HTMLElement).classList.remove('hidden');
  });
});
