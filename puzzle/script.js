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

















let rows = 4; // Valeur par défaut de la grille
let cols = 4; // Valeur par défaut de la grille
const puzzleContainer = document.getElementById('puzzle-container');
const shuffleButton = document.getElementById('shuffle');
const gridSizeInput = document.getElementById('grid-size');
const imageUploadInput = document.getElementById('image-upload');
let puzzleImage = ''; // Variable pour stocker l'image sélectionnée

let pieces = [];

// Fonction pour ajuster la taille de la grille en fonction de la sélection de l'utilisateur
function updateGridStyles() {
    const pieceSize = 400 / Math.max(rows, cols); // Calcul de la taille des pièces
    puzzleContainer.style.gridTemplateColumns = `repeat(${cols}, ${pieceSize}px)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${rows}, ${pieceSize}px)`;

    pieces.forEach(piece => {
        piece.style.width = `${pieceSize}px`;
        piece.style.height = `${pieceSize}px`;
        piece.style.backgroundSize = `${pieceSize * cols}px ${pieceSize * rows}px`; // Ajuster l'image en fonction de la taille des pièces
    });
}

// Fonction pour créer les pièces du puzzle
function createPuzzle() {
    puzzleContainer.innerHTML = ''; // Vider le conteneur à chaque initialisation
    pieces = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = document.createElement('div');
            piece.classList.add('piece');
            piece.style.backgroundImage = `url(${puzzleImage})`; // L'image de fond
            piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`; // Découpe de l'image
            piece.dataset.row = row;
            piece.dataset.col = col;
            piece.dataset.id = row * cols + col;
            piece.style.left = `${col * 100}px`;
            piece.style.top = `${row * 100}px`;

            piece.setAttribute('draggable', true);
            piece.addEventListener('dragstart', dragStart);
            piece.addEventListener('dragover', dragOver);
            piece.addEventListener('drop', dropPiece);
            piece.addEventListener('dragend', dragEnd);

            pieces.push(piece);
            puzzleContainer.appendChild(piece);
        }
    }

    updateGridStyles(); // Mettre à jour la taille de la grille
}

// Fonction pour gérer le changement de taille de la grille
gridSizeInput.addEventListener('input', function() {
    const gridSize = parseInt(gridSizeInput.value);
    if (gridSize >= 3 && gridSize <= 10) {
        rows = gridSize;
        cols = gridSize;
        createPuzzle(); // Recréer le puzzle avec la nouvelle taille
    }
});

// Fonction pour gérer l'importation d'une image
imageUploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            puzzleImage = e.target.result; // Lien de l'image importée
            createPuzzle(); // Recréer le puzzle avec la nouvelle image
        };
        reader.readAsDataURL(file);
    } else {
        alert("Veuillez sélectionner une image valide.");
    }
});

// Gestion du début du glisser-déposer
function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

// Autoriser le dépôt de la pièce (emplacement cible)
function dragOver(event) {
    event.preventDefault();
}

// Déplacer la pièce après avoir été lâchée
function dropPiece(event) {
    event.preventDefault();
    const draggedPieceId = event.dataTransfer.getData("text/plain");
    const draggedPiece = document.querySelector(`.piece[data-id="${draggedPieceId}"]`);

    const targetPiece = event.target;

    if (draggedPiece !== targetPiece) {
        swapPieces(draggedPiece, targetPiece);
    }
}

// Échanger les positions des pièces
function swapPieces(piece1, piece2) {
    const tempLeft = piece1.style.left;
    const tempTop = piece1.style.top;

    piece1.style.left = piece2.style.left;
    piece1.style.top = piece2.style.top;

    piece2.style.left = tempLeft;
    piece2.style.top = tempTop;

    const tempRow = piece1.dataset.row;
    const tempCol = piece1.dataset.col;

    piece1.dataset.row = piece2.dataset.row;
    piece1.dataset.col = piece2.dataset.col;

    piece2.dataset.row = tempRow;
    piece2.dataset.col = tempCol;
}

// Réinitialiser les pièces après le "dragend"
function dragEnd(event) {
    if (checkCompletion()) {
        alert("Bravo, vous avez complété le puzzle!");
    }
}

// Vérifier si le puzzle est complet
function checkCompletion() {
    return pieces.every(piece => {
        const correctRow = parseInt(piece.dataset.row);
        const correctCol = parseInt(piece.dataset.col);
        const correctId = correctRow * cols + correctCol;

        return parseInt(piece.dataset.id) === correctId;
    });
}

// Mélanger les pièces
function shufflePieces() {
    let shuffledPositions = [];
    for (let i = 0; i < pieces.length; i++) {
        shuffledPositions.push(i);
    }

    shuffledPositions.sort(() => Math.random() - 0.5);

    pieces.forEach((piece, index) => {
        const row = Math.floor(shuffledPositions[index] / cols);
        const col = shuffledPositions[index] % cols;

        piece.style.left = `${col * 100}px`;
        piece.style.top = `${row * 100}px`;
        piece.dataset.row = row;
        piece.dataset.col = col;
    });
}

// Lancer la création et le mélange du puzzle à l'initialisation
createPuzzle();

// Mélanger les pièces lors du clic sur le bouton
shuffleButton.addEventListener('click', shufflePieces);
