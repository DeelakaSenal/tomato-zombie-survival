<?php

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../config/database.php';

requireMethod('GET');
$playerId = requireLogin();

try {
	$statement = $pdo->prepare(
		'SELECT id, name, email FROM players WHERE id = :id LIMIT 1'
	);
	$statement->execute(['id' => $playerId]);
	$player = $statement->fetch();

	if (!$player) {
		session_unset();
		session_destroy();
		sendJson([
			'success' => false,
			'message' => 'Player account not found.'
		], 404);
	}

	sendJson([
		'success' => true,
		'player' => getPlayerResponse($player)
	]);
} catch (PDOException $exception) {
	error_log($exception->getMessage());
	sendJson([
		'success' => false,
		'message' => 'Unable to retrieve player information.'
	], 500);
}
