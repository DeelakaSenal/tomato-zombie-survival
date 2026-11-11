<?php

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../config/database.php';

requireMethod('POST');

$data = getJsonInput();
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
	sendJson([
		'success' => false,
		'message' => 'Email and password are required.'
	], 422);
}

try {
	$statement = $pdo->prepare(
		'SELECT id, name, email, password_hash
		 FROM players
		 WHERE email = :email
		 LIMIT 1'
	);
	$statement->execute(['email' => $email]);
	$player = $statement->fetch();

	if (!$player || !password_verify($password, $player['password_hash'])) {
		sendJson([
			'success' => false,
			'message' => 'Invalid email or password.'
		], 401);
	}

	session_regenerate_id(true);
	$_SESSION['player_id'] = (int) $player['id'];

	sendJson([
		'success' => true,
		'message' => 'Login successful.',
		'player' => getPlayerResponse($player)
	]);
} catch (PDOException $exception) {
	error_log($exception->getMessage());
	sendJson([
		'success' => false,
		'message' => 'Unable to log in.'
	], 500);
}
