<?php
// db.php

// Paramètres de connexion à la base de données
$host = 'localhost';
$db = 'game_scores';
$user = 'root';
$password = '';

try {
    // Connexion à la base de données avec PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    // Gérer l'erreur de connexion et retourner un message JSON
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion à la base de données']);
    exit();
}
?>
