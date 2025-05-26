/*jslint browser: true, es6: true */
/*global console */

(function () {
    'use strict';
    
    // Game state
    let currentWord = '';
    let guessedWord = [];
    let wrongGuesses = 0;
    let maxWrongGuesses = 6;
    let gameOver = false;
    let guessedLetters = new Set();
    
    // Word bank - programming related words
    const words = [
        'SKIBIDI', 'RIZZ', 'ELO', 'ZELO', 'RAKIETA', 'SIGMA', 'BETA', 'HELLO', 'THERE', 'OBIWAN', 'KENOBI'
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
        
        // Start the first game
        startNewGame();
    }
    
    function setupCanvas() {
        ctx.strokeStyle = '#f8f8f8';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw gallows base
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
            tile.addEventListener('click', function () {
                handleLetterGuess(letter, tile);
            });
            alphabetGrid.appendChild(tile);
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
        
        console.log('New game started. Word:', currentWord); // For debugging
    }
    
    function cancelGame() {
        if (gameOver) {
            return;
        }
        
        gameOver = true;
        showGameMessage('Game cancelled! The word was: ' + currentWord, 'lose');
        disableAllLetters();
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
