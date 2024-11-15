<?php
// save_score.php

include('../db.php');

// Récupération des données JSON envoyées
$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['name']) && isset($data['score']) && isset($data['game'])) {
    $playerName = $data['name'];
    $playerScore = $data['score'];
    $gameName = $data['game'];

    try {
        // Vérifier si le joueur existe déjà
        $stmt = $pdo->prepare("SELECT player_id FROM players WHERE player_name = :name");
        $stmt->execute(['name' => $playerName]);
        $player = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si le joueur n'existe pas, l'insérer
        if (!$player) {
            $stmt = $pdo->prepare("INSERT INTO players (player_name) VALUES (:name)");
            $stmt->execute(['name' => $playerName]);
            $playerId = $pdo->lastInsertId();
        } else {
            $playerId = $player['player_id'];
        }

        // Vérifier si le jeu existe déjà
        $stmt = $pdo->prepare("SELECT game_id FROM games WHERE game_name = :name");
        $stmt->execute(['name' => $gameName]);
        $game = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si le jeu n'existe pas, l'insérer
        if (!$game) {
            $stmt = $pdo->prepare("INSERT INTO games (game_name) VALUES (:name)");
            $stmt->execute(['name' => $gameName]);
            $gameId = $pdo->lastInsertId();
        } else {
            $gameId = $game['game_id'];
        }

        // Enregistrer le score
        $stmt = $pdo->prepare("INSERT INTO scores (player_id, game_id, score) VALUES (:player_id, :game_id, :score)");
        $stmt->execute(['player_id' => $playerId, 'game_id' => $gameId, 'score' => $playerScore]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'enregistrement du score']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Données invalides']);
}
?>
