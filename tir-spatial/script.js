// JavaScript pour gérer l'extension du navbar, l'indicateur de sélection, et la sélection des icônes actives
const toggleButton = document.querySelector('.toggle-button');
const navbar = document.querySelector('.navbar');
const navItems = document.querySelectorAll('.nav-item');
const selectionIndicator = document.querySelector('.selection-indicator');

// Toggle la classe "expanded" de la navbar et l'icône du bouton
toggleButton.addEventListener('click', () => {
  navbar.classList.toggle('expanded');
  
  // Changer l'icône du bouton lorsqu'on ouvre/ferme la navbar
  toggleButton.querySelector('i').classList.toggle('fa-bars');
  toggleButton.querySelector('i').classList.toggle('fa-times');
});

// Fonction pour mettre à jour la position de l'indicateur de sélection
function updateSelectionIndicator(activeItem) {
  const itemRect = activeItem.getBoundingClientRect();
  const navbarRect = navbar.getBoundingClientRect();
  
  const offsetX = itemRect.left - navbarRect.left + navbar.scrollLeft;
  selectionIndicator.style.transform = `translateX(${offsetX}px)`;
  selectionIndicator.style.width = `${itemRect.width}px`;
}

// Event listener pour chaque item de la navbar
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    updateSelectionIndicator(item);

    // Ferme la navbar sur mobile après un clic
    if (navbar.classList.contains('expanded') && window.innerWidth <= 768) {
      setTimeout(() => {
        navbar.classList.remove('expanded');
        toggleButton.querySelector('i').classList.toggle('fa-bars');
        toggleButton.querySelector('i').classList.toggle('fa-times');
      }, 500);
    }
  });
});

// Met à jour la position de l'indicateur lors du redimensionnement
window.addEventListener('resize', () => {
  const activeItem = document.querySelector('.nav-item.active');
  if (activeItem) {
    updateSelectionIndicator(activeItem);
  }
});

// Initialisation du canvas et du contexte
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Définir les dimensions du canvas
canvas.width = 800;
canvas.height = 600;

// Variables globales
let player, bullets, enemies, particles, isGameOver, score, missedEnemies;
let keys = {};
let canShoot = true;

// Chargement des images
const playerImg = new Image();
playerImg.src = 'assets/player.svg';

const enemyImg = new Image();
enemyImg.src = 'assets/enemy.svg';

// Sélection du bouton Rejouer
const replayButton = document.getElementById('replayButton');
replayButton.addEventListener('click', restartGame);

// Classe pour le vaisseau du joueur
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.image = playerImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] && this.x + this.width < canvas.width) {
            this.x += this.speed;
        }
        if (keys[' '] && canShoot) {  // Vérifier l'espace
            this.shoot();
            canShoot = false;
            setTimeout(() => { // Temporisation pour les tirs
                canShoot = true;
            }, 300);
        }
    }

    shoot() {
        bullets.push(new Bullet(this.x + this.width / 2 - 2.5, this.y));
    }
}

// Classe pour les tirs
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 7;
        this.color = '#D6955B';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

// Classe pour les ennemis
class Enemy {
    constructor(x, y) {
        this.width = 40;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.image = enemyImg;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

// Classe pour les particules d'explosion
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 5 + 2;
        this.color = color;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 20;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 1;
    }
}

// Fonction d'initialisation du jeu
function init() {
    player = new Player();
    bullets = [];
    enemies = [];
    particles = [];
    isGameOver = false;
    score = 0;
    missedEnemies = 0;
    replayButton.style.display = 'none'; // Cacher le bouton Rejouer
    document.getElementById('playButton').style.display = 'none'; // Cacher le bouton Play
    spawnEnemies();
    gameLoop();
}

// Boucle du jeu
function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        if (isColliding(player, enemy)) {
            endGame();
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(index, 1);
                score += 10;
                createExplosion(enemy.x, enemy.y);
            }
        });

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            missedEnemies++;
            if (missedEnemies >= 5) {
                endGame();
            }
        }
    });

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    displayScore();
    requestAnimationFrame(gameLoop);
}

// Fonction pour générer les ennemis
function spawnEnemies() {
    setInterval(() => {
        const x = Math.random() * (canvas.width - 40);
        enemies.push(new Enemy(x, -40));
    }, 1000);
}

// Affichage du score
function displayScore() {
    ctx.fillStyle = '#FEEAA1';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Missed: ${missedEnemies} / 5`, 10, 60);
}

// Vérification des collisions
function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// Création d'une explosion
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, '#FF6347'));
    }
}

// Fonction de fin du jeu
function endGame() {
    isGameOver = true;
    replayButton.style.display = 'block'; // Affiche le bouton Rejouer
    saveScoreToServer();
}

// Fonction pour redémarrer le jeu
function restartGame() {
    init();
}

// Fonction pour sauvegarder le score
function saveScoreToServer() {
    const playerName = prompt("Entrez votre nom:");
    if (playerName) {
        fetch('save_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName, score: score, game: 'Space Shooter' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Score enregistré avec succès');
            } else {
                console.error('Erreur lors de l\'enregistrement du score');
            }
        })
        .catch(error => console.error('Erreur lors de l\'enregistrement du score', error));
    }
}

// Gestion des touches
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Ajout du gestionnaire d'événement pour démarrer le jeu au clic sur le bouton
const playButton = document.getElementById('playButton');
playButton.addEventListener('click', init);







document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById("playButton");
    const replayButton = document.getElementById("replayButton");
    const scoreList = document.getElementById("scoreList");

    // ID du jeu, remplace 1 par l'ID réel de ton jeu
    const gameId = 1;

    // Fonction pour récupérer les meilleurs scores
    function getScores() {
        // Ajoute l'ID du jeu dans la requête avec un paramètre GET
        fetch(`get_scores.php?game_id=${gameId}`) // Appel au fichier PHP pour récupérer les scores
            .then(response => response.json())
            .then(data => {
                scoreList.innerHTML = ''; // Réinitialise la liste des scores

                // Vérifie si la réponse est réussie
                if (data.success && data.scores) {
                    // Affiche les 5 meilleurs scores
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

    // Appeler la fonction pour récupérer les scores dès que le document est chargé
    getScores();

    // Logique pour démarrer le jeu
    playButton.addEventListener('click', function() {
        // Cache le bouton Jouer et affiche le jeu
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        replayButton.style.display = 'block';
        // Code pour démarrer le jeu ici
    });

    // Logique pour rejouer
    replayButton.addEventListener('click', function() {
        // Code pour réinitialiser et rejouer le jeu ici
        getScores();  // Réactualise les scores après chaque partie
    });
});
