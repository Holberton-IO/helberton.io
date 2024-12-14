import GameInitializer from './services/game-initializer.js';
import './globals.js';
import './controls.js';
import './extensions/arrays-extensions.js';

// Main application entry point
function initializeGame() {
    try {
        const canvas = document.getElementById("canvas");
        const gameInitializer = new GameInitializer(canvas, window.serverArgs);
        gameInitializer.start();
    } catch (error) {
        console.error("Game Initialization Error:", error);
    }
}

// Ensure DOM is fully loaded before initializing game
document.addEventListener('DOMContentLoaded', initializeGame);