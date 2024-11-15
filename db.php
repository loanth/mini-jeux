<?php
// db.php

// Paramètres de connexion à la base de données
$host = 'sql100.infinityfree.com';
$db = 'if0_37442174_game_scores';
$user = 'if0_37442174';
$password = '1ptwN82FYxkuXp';

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
