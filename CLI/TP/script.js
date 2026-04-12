const MAX_HP = 300;
let player = null;
let bot = null;

const setupDiv = document.getElementById('setup');
const battleDiv = document.getElementById('battle');
const loadingMsg = document.getElementById('loadingMsg');
const logDiv = document.getElementById('log');
const movesContainer = document.getElementById('movesContainer');
const turnIndicator = document.getElementById('turnIndicator');

function logMessage(msg) {
    const p = document.createElement('div');
    p.className = 'log-entry';
    p.textContent = msg;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

async function fetchPokemon(identifier) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const data = await response.json();
        
        let validMoves = [];
        for (const moveInfo of data.moves) {
            const moveRes = await fetch(moveInfo.move.url);
            const moveData = await moveRes.json();
            
            // Only take moves that deal damage
            if (moveData.power !== null && moveData.accuracy !== null) {
                validMoves.push({
                    name: moveData.name.toUpperCase(),
                    power: moveData.power,
                    accuracy: moveData.accuracy,
                    pp: moveData.pp
                });
            }
            if (validMoves.length === 5) break; 
        }

        return {
            name: data.name.toUpperCase(),
            hp: MAX_HP,
            moves: validMoves,
            sprite: data.sprites.front_default
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

document.getElementById('startBtn').addEventListener('click', async () => {
    const pokemonName = document.getElementById('pokemonName').value.trim().toLowerCase();
    if (!pokemonName) return;

    loadingMsg.textContent = "Loading your Pokemon...";
    player = await fetchPokemon(pokemonName);
    
    if (!player) {
        loadingMsg.textContent = "Pokemon not found! Try another name or ID.";
        return;
    }

    if (player.moves.length < 5) {
        loadingMsg.textContent = "This Pokemon doesn't have enough damaging moves. Try another one!";
        return;
    }

    loadingMsg.textContent = "Loading bot opponent...";
    const randomBotId = Math.floor(Math.random() * 151) + 1; // Gen 1
    bot = await fetchPokemon(randomBotId);

    setupBattle();
});

function setupBattle() {
    setupDiv.style.display = 'none';
    battleDiv.style.display = 'block';

    // Set UI for player
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('playerImg').src = player.sprite;
    
    // Set UI for bot
    document.getElementById('botName').textContent = bot.name;
    document.getElementById('botImg').src = bot.sprite;

    updateUI();
    logDiv.innerHTML = '';
    logMessage(`Battle started! ${player.name} VS ${bot.name}`);

    // Create move buttons
    movesContainer.innerHTML = '';
    player.moves.forEach((move, idx) => {
        const btn = document.createElement('button');
        btn.innerHTML = `${move.name}<br><small>Pow: ${move.power} | Acc: ${move.accuracy}% | PP: ${move.pp}</small>`;
        btn.onclick = () => playTurn(idx);
        movesContainer.appendChild(btn);
    });
}

function updateUI() {
    // Player
    document.getElementById('playerHpTxt').textContent = Math.max(0, player.hp);
    document.getElementById('playerHpBar').style.width = `${Math.max(0, (player.hp / MAX_HP) * 100)}%`;
    if(player.hp < 100) document.getElementById('playerHpBar').style.backgroundColor = "red";

    // Bot
    document.getElementById('botHpTxt').textContent = Math.max(0, bot.hp);
    document.getElementById('botHpBar').style.width = `${Math.max(0, (bot.hp / MAX_HP) * 100)}%`;
    if(bot.hp < 100) document.getElementById('botHpBar').style.backgroundColor = "red";
}

function playTurn(playerMoveIdx) {
    if (player.hp <= 0 || bot.hp <= 0) return;

    const playerMove = player.moves[playerMoveIdx];
    const botMoveIdx = Math.floor(Math.random() * bot.moves.length);
    const botMove = bot.moves[botMoveIdx];

    logMessage(`--- NEW TURN ---`);
    logMessage(`You chose ${playerMove.name}.`);
    logMessage(`Bot chose ${botMove.name}.`);

    let playerCanAttack = playerMove.pp >= botMove.pp;
    let botCanAttack = botMove.pp >= playerMove.pp;

    if (!playerCanAttack) logMessage(`Your move's PP (${playerMove.pp}) is lower than the bot's (${botMove.pp}). Your attack fails!`);
    if (!botCanAttack) logMessage(`Bot's move PP (${botMove.pp}) is lower than yours (${playerMove.pp}). Bot's attack fails!`);

    // Player attacks
    if (playerCanAttack) {
        if (Math.random() * 100 <= playerMove.accuracy) {
            logMessage(`Your ${playerMove.name} hit the bot for ${playerMove.power} damage!`);
            bot.hp -= playerMove.power;
        } else {
            logMessage(`Your ${playerMove.name} missed!`);
        }
    }

    updateUI();
    if (checkWin()) return;

    // Bot attacks
    if (bot.hp > 0 && botCanAttack) {
        if (Math.random() * 100 <= botMove.accuracy) {
            logMessage(`Bot's ${botMove.name} hit you for ${botMove.power} damage!`);
            player.hp -= botMove.power;
        } else {
            logMessage(`Bot's ${botMove.name} missed!`);
        }
    }

    updateUI();
    checkWin();
}

function checkWin() {
    if (player.hp <= 0 && bot.hp <= 0) {
        endGame("It's a draw!");
        return true;
    } else if (player.hp <= 0) {
        endGame("You lost!");
        return true;
    } else if (bot.hp <= 0) {
        endGame("You won!");
        return true;
    }
    return false;
}

function endGame(msg) {
    turnIndicator.textContent = msg;
    logMessage(`*** GAME OVER: ${msg} ***`);
    
    // Disable buttons
    const buttons = movesContainer.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);
}