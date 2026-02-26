let score = { wins: 0, losses: 0, ties: 0 };
try {
  const stored = localStorage.getItem('score');
  if (stored) {
    score = JSON.parse(stored);
  }
} catch (e) {
  score = { wins: 0, losses: 0, ties: 0 };
}

updateScoreElement();
document.querySelector('.js-rock-button')
  .addEventListener('click', () => {
    playGame('rock');
  });

document.querySelector('.js-paper-button')
  .addEventListener('click', () => {
    playGame('paper');
  });

document.querySelector('.js-scissors-button')
  .addEventListener('click', () => {
    playGame('scissors');
  });

document.querySelector('.js-reset-score-button')
  .addEventListener('click', () => {
    score.wins = 0;
    score.losses = 0;
    score.ties = 0;
    try {
      localStorage.removeItem('score');
    } catch (e) {
      console.error('Could not clear localStorage:', e);
    }
    updateScoreElement();
    document.querySelector('.js-result').innerHTML = '';
    document.querySelector('.js-moves').innerHTML = '';
  });

document.addEventListener('keydown', function(event) {
  if (event.key === 'r') {
    playGame('rock');
  } else if (event.key === 'p') {
    playGame('paper');
  } else if (event.key === 's') {
    playGame('scissors');
  }
});

function playGame(playerMove) {
  const computerMove = pickComputerMove();

  let result = '';
    if (playerMove === 'rock') {
      if (computerMove === 'rock') {
        result = 'Tie.';
        score.ties++;
      } else if (computerMove === 'paper') {
        result = 'You lose.';
        score.losses++;
      } else if (computerMove === 'scissors') {
        result = 'You win.';
        score.wins++;
      }
    } else if (playerMove === 'paper') {
      if (computerMove === 'rock') {
        result = 'You win.';
        score.wins++;
      } else if (computerMove === 'paper') {
        result = 'Tie.';
        score.ties++;
      } else if (computerMove === 'scissors') {
        result = 'You lose.';
        score.losses++;
      }
    } else if (playerMove === 'scissors') {
      if (computerMove === 'rock') {
        result = 'You lose.';
        score.losses++;
      } else if (computerMove === 'paper') {
        result = 'You win.';
        score.wins++;
      } else if (computerMove === 'scissors') {
        result = 'Tie.';
        score.ties++;
      }
    }

  document.querySelector('.js-result').innerHTML = result;
  document.querySelector('.js-moves').innerHTML = `You 
<img src="images/${playerMove}-emoji.png" class="move-icon">
-
<img src="images/${computerMove}-emoji.png" class="move-icon">
Computer`;

  try {
    localStorage.setItem('score', JSON.stringify(score));
  } catch (e) {
    // Handle localStorage errors (quota exceeded, corrupted, etc.)
    console.error('Could not save score to localStorage:', e);
  }
  updateScoreElement();
  

}

function updateScoreElement() {
  document.querySelector('.js-score')
    .innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`;
}

function pickComputerMove() {
  const randomNumber = Math.random();

  let computerMove = '';

  if (randomNumber >= 0 && randomNumber < 1 / 3) {
    computerMove = 'rock';
  } else if (randomNumber >= 1 / 3 && randomNumber < 2 / 3) {
    computerMove = 'paper';
  } else if (randomNumber >= 2 / 3 && randomNumber < 1) {
    computerMove = 'scissors';
  }

  return computerMove;
}