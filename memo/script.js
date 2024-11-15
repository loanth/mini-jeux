// script.js
// JavaScript to handle navbar expansion, selection indicator, and active icon selection
const toggleButton = document.querySelector('.toggle-button');
const navbar = document.querySelector('.navbar');
const navItems = document.querySelectorAll('.nav-item');
const selectionIndicator = document.querySelector('.selection-indicator');

// Toggle the expanded state of the navbar and update the toggle button icon
toggleButton.addEventListener('click', () => {
  navbar.classList.toggle('expanded');
  
  // Change icon of toggle button when navbar is expanded
  toggleButton.querySelector('i').classList.toggle('fa-bars');
  toggleButton.querySelector('i').classList.toggle('fa-times');
});

// Function to move the selection indicator smoothly to the active item
function updateSelectionIndicator(activeItem) {
  const itemRect = activeItem.getBoundingClientRect();
  const navbarRect = navbar.getBoundingClientRect();
  
  // Calculate the offset for the indicator based on the active item position
  const offsetX = itemRect.left - navbarRect.left + navbar.scrollLeft;
  selectionIndicator.style.transform = `translateX(${offsetX}px)`;
  selectionIndicator.style.width = `${itemRect.width}px`;
}

// Add event listeners to each nav item
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    // Remove 'active' class from all items and add to the clicked item
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Update the selection indicator position and smooth transition
    updateSelectionIndicator(item);
    
    // Close navbar if an item is clicked in mobile view
    if (navbar.classList.contains('expanded') && window.innerWidth <= 768) {
      setTimeout(() => {
        navbar.classList.remove('expanded');
        toggleButton.querySelector('i').classList.toggle('fa-bars');
        toggleButton.querySelector('i').classList.toggle('fa-times');
      }, 500); // Delay for smooth transition
    }
  });
});

// Update indicator position on window resize to stay aligned with active item
window.addEventListener('resize', () => {
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem) {
    updateSelectionIndicator(activeItem);
  }
});

// Initialize the position of the selection indicator on page load
document.addEventListener('DOMContentLoaded', () => {
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem) {
    updateSelectionIndicator(activeItem);
  }
});

















document.addEventListener('DOMContentLoaded', () => {
    const cardsArray = [
        { name: '🦊', img: '🦊' },
        { name: '🐼', img: '🐼' },
        { name: '🦄', img: '🦄' },
        { name: '🐸', img: '🐸' },
        { name: '🐍', img: '🐍' },
        { name: '🐙', img: '🐙' },
        { name: '🐝', img: '🐝' },
        { name: '🐧', img: '🐧' },
    ];

    const gameGrid = [...cardsArray, ...cardsArray].sort(() => 0.5 - Math.random());
    const grid = document.querySelector('.memory-game');
    const replayButton = document.getElementById('replay-button');
    const scoreList = document.getElementById('scoreList');
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchCount = 0;

    // Timer variables
    let startTime;
    const timerDisplay = document.getElementById('timer');
    let timerInterval;
    let isTimerRunning = false;

    const gameId = 2; // ID du jeu mémoire, change en fonction de ton jeu

    // Start the timer
    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startTime = new Date().getTime();
        timerInterval = setInterval(() => {
            const elapsedTime = new Date().getTime() - startTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    // Stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Create cards
    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '';

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = card.img;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardElement.appendChild(cardInner);

        cardElement.addEventListener('click', flipCard);
        return cardElement;
    }

    // Flip card logic
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('is-flipped');

        if (!firstCard) {
            firstCard = this;
            startTimer();
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    // Check if the two selected cards match
    function checkForMatch() {
        const isMatch = firstCard.dataset.name === secondCard.dataset.name;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    // Disable cards after a match, but keep them flipped
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        firstCard.classList.add('is-matched');
        secondCard.classList.add('is-matched');

        resetBoard();
        matchCount += 2;

        if (matchCount === gameGrid.length) {
            stopTimer();
            const elapsedTime = new Date().getTime() - startTime; // Calcul du temps écoulé
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            const finalScore = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            setTimeout(() => {
                alert(`Bravo, vous avez gagné en ${finalScore}`);
                saveScoreToServer(finalScore); // Utilisation du temps comme score
                replayButton.style.display = 'block'; // Afficher le bouton "Rejouer"
            }, 500);
        }
    }

    // Save score to server
    function saveScoreToServer(finalScore) {
        const playerName = prompt("Entrez votre nom:");
        if (playerName) {
            fetch('../tir-spatial/save_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName, score: finalScore, game: 'Memory' })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Score enregistré avec succès');
                    getScores(); // Mettre à jour la liste des scores
                } else {
                    console.error('Erreur lors de l\'enregistrement du score');
                }
            })
            .catch(error => console.error('Erreur lors de l\'enregistrement du score', error));
        }
    }

    // Unflip non-matching cards
    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('is-flipped');
            secondCard.classList.remove('is-flipped');
            resetBoard();
        }, 1000);
    }

    // Reset board variables
    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    // Initialize game board
    function initGame() {
        grid.innerHTML = ''; // Réinitialiser le contenu du plateau
        gameGrid.forEach(card => {
            const cardElement = createCardElement(card);
            grid.appendChild(cardElement);
        });
        matchCount = 0;
        resetTimer();
        replayButton.style.display = 'none'; // Cacher le bouton "Rejouer"
    }

    // Reset timer
    function resetTimer() {
        stopTimer();
        timerDisplay.textContent = '00:00';
        isTimerRunning = false;
    }

    // Fetch and display scores
    function getScores() {
        fetch(`../tir-spatial/get_scores.php?game_id=${gameId}`)
            .then(response => response.json())
            .then(data => {
                scoreList.innerHTML = '';

                if (data.success && data.scores) {
                    data.scores.forEach(score => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${score.player_name}: ${score.score}`;
                        scoreList.appendChild(listItem);
                    });
                } else {
                    console.error('Erreur lors de la récupération des scores:', data.message);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des scores:', error);
            });
    }

    // Lancer une nouvelle partie quand l'utilisateur clique sur "Rejouer"
    replayButton.addEventListener('click', () => {
        initGame();
        getScores(); // Actualiser les scores après une nouvelle partie
    });

    // Initialisation du jeu
    initGame();
    getScores();
});
