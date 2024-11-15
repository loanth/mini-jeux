<?php
include('../db.php'); // Inclusion de la connexion via db.php

header('Content-Type: application/json');

// Récupère l'ID du jeu depuis les paramètres GET
$gameId = isset($_GET['game_id']) ? intval($_GET['game_id']) : 0;

if ($gameId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID du jeu non valide']);
    exit();
}

try {
    // Préparation de la requête SQL en fonction de l'ID du jeu
    if ($gameId == 2) {
        // Si game_id est 2, trier les scores par ordre croissant
        $stmt = $pdo->prepare("
            SELECT p.player_name, s.score 
            FROM scores s 
            JOIN players p ON s.player_id = p.player_id 
            WHERE s.game_id = :game_id 
            ORDER BY s.score ASC 
            LIMIT 5
        ");
    } else {
        // Sinon, trier les scores par ordre décroissant
        $stmt = $pdo->prepare("
            SELECT p.player_name, s.score 
            FROM scores s 
            JOIN players p ON s.player_id = p.player_id 
            WHERE s.game_id = :game_id 
            ORDER BY s.score DESC 
            LIMIT 5
        ");
    }
    
    $stmt->execute(['game_id' => $gameId]);
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Vérification s'il y a des scores à afficher
    if (empty($scores)) {
        echo json_encode(['success' => false, 'message' => 'Aucun score trouvé']);
    } else {
        echo json_encode(['success' => true, 'scores' => $scores]);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur SQL : ' . $e->getMessage()]);
}
?>
