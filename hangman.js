/*jslint browser: true, es6: true */
/*global console, localStorage, JSON */

(function () {
    'use strict';
    
    // Game state
    let currentWord = '';
    let guessedWord = [];
    let wrongGuesses = 0;
    let maxWrongGuesses = 6;
    let gameOver = false;
    let guessedLetters = new Set();
    
    // localStorage key
    const STORAGE_KEY = 'hangman_game_state';
    
    const words = [
        'JAVASCRIPT', 'PYTHON', 'COMPUTER', 'PROGRAM', 'FUNCTION',
        'VARIABLE', 'ARRAY', 'OBJECT', 'METHOD', 'CLASS',
        'ALGORITHM', 'DATABASE', 'NETWORK', 'SERVER', 'CLIENT',
        'INTERFACE', 'FRAMEWORK', 'LIBRARY', 'DEBUGGING', 'TESTING',
        'COMPILER', 'INTERPRETER', 'SYNTAX', 'LOGIC', 'LOOP',
        'CONDITION', 'RECURSION', 'STACK', 'QUEUE', 'TREE',
        'GRAPH', 'SORTING', 'SEARCHING', 'BINARY', 'DECIMAL',
        'HEXADECIMAL', 'BOOLEAN', 'STRING', 'INTEGER', 'FLOAT',
        'MEMORY', 'PROCESSOR', 'HARDWARE', 'SOFTWARE', 'OPERATING',
        'SYSTEM', 'WINDOWS', 'LINUX', 'MACOS', 'ANDROID'
    ];
    
    // DOM elements
    let canvas;
    let ctx;
    let wordDisplay;
    let alphabetGrid;
    let wrongCountElement;
    let gameMessage;
    let newGameBtn;
    let cancelGameBtn;
    
    // localStorage functions
    function saveGameState() {
        if (gameOver) {
            // Don't save completed games
            clearGameState();
            return;
        }
        
        const gameState = {
            currentWord: currentWord,
            guessedWord: guessedWord,
            wrongGuesses: wrongGuesses,
            guessedLetters: Array.from(guessedLetters),
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        } catch (error) {
            console.log('Could not save game state:', error);
        }
    }
    
    function loadGameState() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (!savedState) {
                return null;
            }
            
            const gameState = JSON.parse(savedState);
            
            // Check if the saved game is less than 24 hours old
            const twentyFourHours = 24 * 60 * 60 * 1000;
            if (Date.now() - gameState.timestamp > twentyFourHours) {
                clearGameState();
                return null;
            }
            
            return gameState;
        } catch (error) {
            console.log('Could not load game state:', error);
            clearGameState();
            return null;
        }
    }
    
    function clearGameState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.log('Could not clear game state:', error);
        }
    }
    
    function restoreGameState(gameState) {
        currentWord = gameState.currentWord;
        guessedWord = gameState.guessedWord;
        wrongGuesses = gameState.wrongGuesses;
        guessedLetters = new Set(gameState.guessedLetters);
        gameOver = false;
        
        // Update UI
        updateWordDisplay();
        updateWrongGuessCount();
        updateAlphabetGrid();
        hideGameMessage();
        
        // Redraw canvas
        drawGallows();
        for (let i = 1; i <= wrongGuesses; i += 1) {
            drawHangmanPart(i);
        }
        
        // Check if game should be over
        checkGameStatus();
        
        // Show restoration message
        showTemporaryMessage('Game restored from previous session!', 'info');
    }
    
    function showTemporaryMessage(message, type) {
        const tempMessage = document.createElement('div');
        tempMessage.className = 'temp-message ' + type;
        tempMessage.textContent = message;
        tempMessage.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(88, 88, 200, 0.9);
            color: white;
            padding: 1em 2em;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(tempMessage);
        
        setTimeout(function () {
            tempMessage.style.animation = 'slideUp 0.3s ease';
            setTimeout(function () {
                if (tempMessage.parentNode) {
                    tempMessage.parentNode.removeChild(tempMessage);
                }
            }, 300);
        }, 3000);
    }
    
    function checkGameStatus() {
        // Check for win
        if (guessedWord.join('') === currentWord) {
            gameOver = true;
            showGameMessage('Congratulations! You won!', 'win');
            disableAllLetters();
            clearGameState();
            return;
        }
        
        // Check for loss
        if (wrongGuesses >= maxWrongGuesses) {
            gameOver = true;
            showGameMessage('Game Over! The word was: ' + currentWord, 'lose');
            disableAllLetters();
            clearGameState();
            return;
        }
    }
    
    // Initialize the game
    function initHangmanGame() {
        canvas = document.getElementById('hangman-canvas');
        if (!canvas) {
            return; // Not on hangman page
        }
        
        ctx = canvas.getContext('2d');
        wordDisplay = document.getElementById('word-display');
        alphabetGrid = document.getElementById('alphabet-grid');
        wrongCountElement = document.getElementById('wrong-count');
        gameMessage = document.getElementById('game-message');
        newGameBtn = document.getElementById('new-game-btn');
        cancelGameBtn = document.getElementById('cancel-game-btn');
        
        // Set up canvas
        setupCanvas();
        
        // Create alphabet grid
        createAlphabetGrid();
        
        // Add event listeners
        newGameBtn.addEventListener('click', startNewGame);
        cancelGameBtn.addEventListener('click', cancelGame);
        
        // Try to restore previous game state
        const savedState = loadGameState();
        if (savedState) {
            restoreGameState(savedState);
        } else {
            startNewGame();
        }
        
        addTempMessageStyles();
    }
    
    function addTempMessageStyles() {
        if (document.getElementById('temp-message-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'temp-message-styles';
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function setupCanvas() {
        ctx.strokeStyle = '#f8f8f8';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        drawGallows();
    }
    
    function drawGallows() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Base
        ctx.beginPath();
        ctx.moveTo(50, 320);
        ctx.lineTo(150, 320);
        ctx.stroke();
        
        // Pole
        ctx.beginPath();
        ctx.moveTo(100, 320);
        ctx.lineTo(100, 50);
        ctx.stroke();
        
        // Top beam
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(200, 50);
        ctx.stroke();
        
        // Noose
        ctx.beginPath();
        ctx.moveTo(200, 50);
        ctx.lineTo(200, 80);
        ctx.stroke();
    }
    
    function drawHangmanPart(partNumber) {
        ctx.strokeStyle = '#ea4335';
        ctx.lineWidth = 3;
        
        switch (partNumber) {
            case 1: // Head
                ctx.beginPath();
                ctx.arc(200, 100, 20, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 2: // Body
                ctx.beginPath();
                ctx.moveTo(200, 120);
                ctx.lineTo(200, 220);
                ctx.stroke();
                break;
            case 3: // Left arm
                ctx.beginPath();
                ctx.moveTo(200, 150);
                ctx.lineTo(170, 180);
                ctx.stroke();
                break;
            case 4: // Right arm
                ctx.beginPath();
                ctx.moveTo(200, 150);
                ctx.lineTo(230, 180);
                ctx.stroke();
                break;
            case 5: // Left leg
                ctx.beginPath();
                ctx.moveTo(200, 220);
                ctx.lineTo(170, 250);
                ctx.stroke();
                break;
            case 6: // Right leg
                ctx.beginPath();
                ctx.moveTo(200, 220);
                ctx.lineTo(230, 250);
                ctx.stroke();
                break;
        }
        
        ctx.strokeStyle = '#f8f8f8';
        ctx.lineWidth = 4;
    }
    
    function createAlphabetGrid() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        alphabetGrid.innerHTML = '';
        
        alphabet.split('').forEach(function (letter) {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter;
            
            // Add both click and touch events for better mobile support
            tile.addEventListener('click', function () {
                handleLetterGuess(letter, tile);
            });
            
            // Add touch support for mobile devices
            tile.addEventListener('touchstart', function (e) {
                e.preventDefault(); // Prevent double-tap zoom
                handleLetterGuess(letter, tile);
            });
            
            alphabetGrid.appendChild(tile);
        });
    }
    
    function updateAlphabetGrid() {
        const tiles = alphabetGrid.querySelectorAll('.letter-tile');
        
        tiles.forEach(function (tile) {
            const letter = tile.textContent;
            tile.className = 'letter-tile';
            
            if (guessedLetters.has(letter)) {
                tile.classList.add('selected');
                
                if (currentWord.includes(letter)) {
                    tile.classList.add('correct');
                } else {
                    tile.classList.add('incorrect');
                }
            }
        });
    }
    
    function startNewGame() {
        // Reset game state
        currentWord = words[Math.floor(Math.random() * words.length)];
        guessedWord = new Array(currentWord.length).fill('');
        wrongGuesses = 0;
        gameOver = false;
        guessedLetters.clear();
        
        // Reset UI
        updateWordDisplay();
        updateWrongGuessCount();
        resetAlphabetGrid();
        hideGameMessage();
        drawGallows();
        
        // Clear any previous saved state and save new game
        clearGameState();
        saveGameState();
        
        console.log('New game started. Word:', currentWord); // For debugging
    }
    
    function cancelGame() {
        if (gameOver) {
            return;
        }
        
        gameOver = true;
        showGameMessage('Game cancelled! The word was: ' + currentWord, 'lose');
        disableAllLetters();
        clearGameState();
    }
    
    function handleLetterGuess(letter, tile) {
        if (gameOver || guessedLetters.has(letter)) {
            return;
        }
        
        guessedLetters.add(letter);
        tile.classList.add('selected');
        
        if (currentWord.includes(letter)) {
            // Correct guess
            tile.classList.add('correct');
            
            // Reveal all instances of the letter
            for (let i = 0; i < currentWord.length; i += 1) {
                if (currentWord[i] === letter) {
                    guessedWord[i] = letter;
                }
            }
            
            updateWordDisplay();
            
            // Check for win
            if (guessedWord.join('') === currentWord) {
                gameOver = true;
                showGameMessage('Congratulations! You won!', 'win');
                disableAllLetters();
                clearGameState();
            } else {
                saveGameState();
            }
        } else {
            // Wrong guess
            tile.classList.add('incorrect');
            wrongGuesses += 1;
            updateWrongGuessCount();
            drawHangmanPart(wrongGuesses);
            
            // Check for loss
            if (wrongGuesses >= maxWrongGuesses) {
                gameOver = true;
                showGameMessage('Game Over! The word was: ' + currentWord, 'lose');
                disableAllLetters();
                clearGameState();
            } else {
                saveGameState();
            }
        }
    }
    
    function updateWordDisplay() {
        wordDisplay.innerHTML = '';
        
        guessedWord.forEach(function (letter, index) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            if (letter) {
                letterBox.textContent = letter;
                letterBox.classList.add('revealed');
            }
            
            wordDisplay.appendChild(letterBox);
        });
    }
    
    function updateWrongGuessCount() {
        wrongCountElement.textContent = wrongGuesses;
    }
    
    function resetAlphabetGrid() {
        const tiles = alphabetGrid.querySelectorAll('.letter-tile');
        tiles.forEach(function (tile) {
            tile.className = 'letter-tile';
        });
    }
    
    function disableAllLetters() {
        const tiles = alphabetGrid.querySelectorAll('.letter-tile');
        tiles.forEach(function (tile) {
            if (!tile.classList.contains('selected')) {
                tile.classList.add('selected');
            }
        });
    }
    
    function showGameMessage(message, type) {
        gameMessage.textContent = message;
        gameMessage.className = 'game-message ' + type;
        gameMessage.classList.remove('hidden');
    }
    
    function hideGameMessage() {
        gameMessage.classList.add('hidden');
    }
    
    // Add to global init function
    if (typeof window.initHangmanGame === 'undefined') {
        window.initHangmanGame = initHangmanGame;
        
        // Auto-initialize if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHangmanGame);
        } else {
            initHangmanGame();
        }
    }
}());
