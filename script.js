const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const startGameButton = document.getElementById('start-game');
const endGameButton = document.getElementById('end-game');
const mineCountSelect = document.getElementById('mine-count');
const balanceInput = document.getElementById('balance');
const betInput = document.getElementById('bet');

// User profile management
const userProfileIcon = document.getElementById('user-profile-icon');
const logoutButton = document.getElementById('logout-button');

const boardSize = 5;  // 5x5 grid
const totalTiles = boardSize * boardSize; // 25 tiles
let board = [];
let mines = [];
let gameOver = false;
let gameStarted = false;
let balance = 1000;
let bet = 1;
let safeTilesClicked = 0;
let currentWinnings = 0;
let userLoggedIn = false;
let userId = null;

const incrementalWinnings = {
    1: 0.07,
    2: 0.10,
    3: 0.13,
    4: 0.18,
    5: 0.24
};

function initGame() {
    const mineCount = parseInt(mineCountSelect.value);
    board = Array(totalTiles).fill(0);
    mines = [];
    gameOver = false;
    safeTilesClicked = 0;
    currentWinnings = 0;
    statusElement.textContent = 'Click a tile!';
    betInput.max = balance;  // Set bet max to current balance
    betInput.value = Math.min(betInput.value, balance);  // Adjust bet value if necessary
    bet = parseInt(betInput.value, 10);  // Update bet value to integer

    // Place mines
    while (mines.length < mineCount) {
        const minePosition = Math.floor(Math.random() * totalTiles);
        if (!mines.includes(minePosition)) {
            mines.push(minePosition);
        }
    }
    
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((_, index) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.addEventListener('click', () => handleTileClick(index));
        boardElement.appendChild(tile);
    });
}

function handleTileClick(index) {
    if (gameOver || !gameStarted) return; // Prevent clicks if game is over or not started

    const tile = boardElement.children[index];
    const mineCount = parseInt(mineCountSelect.value);
    const incrementalMultiplier = incrementalWinnings[mineCount] || 0.13; // Default to 0.13 for unspecified mine counts

    setTimeout(() => {
        if (gameOver) return; // Prevent processing if game is over

        if (mines.includes(index)) {
            balance -= (bet + currentWinnings);  // Lose the bet amount and current winnings
            if (balance < 0) balance = 0;
            balanceInput.value = balance.toFixed(2);
            statusElement.textContent = 'Boom! Game over.';
            tile.classList.add('mine');
            revealMines();
            gameOver = true;
            endGameButton.disabled = false;
            startGameButton.classList.add('start-game-disabled');
        } else {
            tile.classList.add('safe');
            tile.textContent = 'X';  // Reverting back to "X"
            safeTilesClicked++;
            currentWinnings += bet * incrementalMultiplier;
            balance += bet * incrementalMultiplier; // Increase balance by incremental winnings
            balanceInput.value = balance.toFixed(2);
        }
        tile.classList.add('clicked');
    }, 100);
}

function revealMines() {
    mines.forEach(mine => {
        const tile = boardElement.children[mine];
        tile.classList.add('mine');
        tile.classList.add('clicked');
    });
}

function startGame() {
    if (gameStarted || bet < 1) return; // Check if the bet is less than $1
    gameStarted = true;
    initGame();
    startGameButton.disabled = true;
    endGameButton.disabled = false;
    mineCountSelect.disabled = true; // Disable mine count dropdown during game
    betInput.disabled = true; // Disable bet input during the game
    startGameButton.classList.remove('start-game-disabled');
    startGameButton.classList.add('start-game-enabled');
}

function endGame() {
    if (!gameStarted) return;
    gameStarted = false;
    gameOver = true;

    revealMines(); // Reveal mines when the game ends

    statusElement.textContent = 'Game ended. Start a new game.';
    endGameButton.disabled = true;
    startGameButton.disabled = false;
    mineCountSelect.disabled = false; // Enable mine count dropdown after game ends
    betInput.disabled = false; // Enable bet input after the game ends
    startGameButton.classList.remove('start-game-disabled');
    startGameButton.classList.add('start-game-enabled');
}

// Ensure bet does not exceed balance and is a natural number
betInput.addEventListener('input', () => {
    bet = parseInt(betInput.value, 10); // Convert bet to integer
    if (isNaN(bet) || bet < 1) {
        bet = 1;
    }
    if (bet > balance) {
        bet = balance;
    }
    betInput.value = bet;
    startGameButton.disabled = bet < 1; // Disable Start Game button if bet is less than 1
});

// Authentication handling
function handleUserProfile() {
    if (userLoggedIn) {
        userProfileIcon.style.display = 'block';
        userProfileIcon.innerText = 'User';
    } else {
        userProfileIcon.style.display = 'none';
    }
}

function logout() {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                userLoggedIn = false;
                userId = null;
                handleUserProfile();
                window.location.href = '/'; // Redirect to home page
            }
        });
}

if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

startGameButton.addEventListener('click', startGame);
endGameButton.addEventListener('click', endGame);

initGame();
handleUserProfile(); // Initialize user profile visibility
