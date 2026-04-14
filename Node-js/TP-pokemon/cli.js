const inquirer = require('inquirer');

const MAX_HP = 300;

async function fetchPokemon(identifier) {
    console.log(`\nFetching data for ${identifier}...`);
    try {
        // En utilisant l'API Fetch native de Node.js (Node 18+)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const data = await response.json();
        
        let validMoves = [];
        for (const moveInfo of data.moves) {
            const moveRes = await fetch(moveInfo.move.url);
            const moveData = await moveRes.json();
            
            // On ne prend que les attaques qui font des dégâts (power et accuracy non nulls)
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
            moves: validMoves
        };
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function battle(player, bot) {
    console.log(`\n============================`);
    console.log(`       BATTLE START!        `);
    console.log(`============================`);
    console.log(`${player.name} (HP: ${player.hp}) VS ${bot.name} (HP: ${bot.hp})\n`);

    while (player.hp > 0 && bot.hp > 0) {
        const { moveIndex } = await inquirer.prompt([
            {
                type: 'list',
                name: 'moveIndex',
                message: 'Choose your move:',
                choices: player.moves.map((m, idx) => ({
                    name: `${m.name} (Power: ${m.power}, Acc: ${m.accuracy}%, PP: ${m.pp})`,
                    value: idx
                }))
            }
        ]);

        const playerMove = player.moves[moveIndex];
        const botMove = bot.moves[Math.floor(Math.random() * bot.moves.length)];

        console.log(`\n--- NEW TURN ---`);
        console.log(`You chose ${playerMove.name}.`);
        console.log(`Bot chose ${botMove.name}.`);

        // Si le PP de l'attaque est inférieur à celui de l'ennemi, l'attaque échoue
        let playerCanAttack = playerMove.pp >= botMove.pp;
        let botCanAttack = botMove.pp >= playerMove.pp;

        if (!playerCanAttack) console.log(`Your move's PP (${playerMove.pp}) is lower than the bot's (${botMove.pp}). Your attack fails!`);
        if (!botCanAttack) console.log(`Bot's move PP (${botMove.pp}) is lower than yours (${playerMove.pp}). Bot's attack fails!`);

        // Attaque du joueur
        if (playerCanAttack) {
            if (Math.random() * 100 <= playerMove.accuracy) {
                console.log(`-> Your ${playerMove.name} hit for ${playerMove.power} damage!`);
                bot.hp -= playerMove.power;
            } else {
                console.log(`-> Your ${playerMove.name} missed!`);
            }
        }

        // Attaque du bot
        if (bot.hp > 0 && botCanAttack) {
            if (Math.random() * 100 <= botMove.accuracy) {
                console.log(`-> Bot's ${botMove.name} hit for ${botMove.power} damage!`);
                player.hp -= botMove.power;
            } else {
                console.log(`-> Bot's ${botMove.name} missed!`);
            }
        }

        console.log(`\n[STATUS] ${player.name}: ${Math.max(0, player.hp)} HP | ${bot.name}: ${Math.max(0, bot.hp)} HP\n`);
    }

    console.log(`============================`);
    if (player.hp <= 0 && bot.hp <= 0) {
        console.log("IT'S A DRAW!");
    } else if (player.hp <= 0) {
        console.log("YOU LOST!");
    } else {
        console.log("YOU WON!");
    }
    console.log(`============================\n`);
}

async function start() {
    console.log("Welcome to the Node.js CLI Pokemon Battle!\n");
    
    const { pokemonName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'pokemonName',
            message: 'Enter your Pokemon Name or ID (e.g., pikachu, charizard, 1):',
            validate: input => input.trim() ? true : 'Please enter a valid name or ID.'
        }
    ]);

    const player = await fetchPokemon(pokemonName.toLowerCase().trim());
    if (!player) return console.log("Failed to load player Pokemon. Restart the game.");

    if (player.moves.length < 5) {
        return console.log("This Pokemon doesn't have enough damaging moves. Try another one!");
    }

    const randomBotId = Math.floor(Math.random() * 151) + 1; // Gen 1
    const bot = await fetchPokemon(randomBotId);
    if (!bot) return console.log("Failed to load bot Pokemon.");

    await battle(player, bot);
}

start();
