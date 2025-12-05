import { Game } from './game/Game';

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Portal Crafters starting...');

  try {
    // Create and initialize the game
    const game = new Game('portal-canvas');
    await game.initialize();

    // Start the game loop
    game.start();

    // Expose game to window for debugging
    (window as unknown as { game: Game }).game = game;

    console.log('Portal Crafters initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Portal Crafters:', error);
  }
});
