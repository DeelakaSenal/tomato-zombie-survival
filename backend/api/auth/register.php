<?php

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../config/database.php';

requireMethod('POST');

$data = getJsonInput();

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($name === '' || $email === '' || $password === '') {
	sendJson([
		'success' => false,
		'message' => 'All fields are required.'
	], 422);
}

if (strlen($name) > 100) {
	sendJson([
		'success' => false,
		'message' => 'Name must be 100 characters or fewer.'
	], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
	sendJson([
		'success' => false,
		'message' => 'Please enter a valid email address.'
	], 422);
}

if (strlen($password) < 8) {
	sendJson([
		'success' => false,
		'message' => 'Password must contain at least 8 characters.'
	], 422);
}

try {
	$check = $pdo->prepare(
		'SELECT id FROM players WHERE email = :email LIMIT 1'
	);
	$check->execute(['email' => $email]);

	if ($check->fetch()) {
		sendJson([
			'success' => false,
			'message' => 'An account with this email already exists.'
		], 409);
	}

	$statement = $pdo->prepare(
		'INSERT INTO players (name, email, password_hash)
		 VALUES (:name, :email, :password_hash)'
	);
	$statement->execute([
		'name' => $name,
		'email' => $email,
		'password_hash' => password_hash($password, PASSWORD_DEFAULT)
	]);

	$playerId = (int) $pdo->lastInsertId();
	session_regenerate_id(true);
	$_SESSION['player_id'] = $playerId;

	sendJson([
		'success' => true,
		'message' => 'Account created successfully.',
		'player' => [
			'id' => $playerId,
			'name' => $name,
			'email' => $email
		]
	], 201);
} catch (PDOException $exception) {
	error_log($exception->getMessage());
	sendJson([
		'success' => false,
		'message' => 'Unable to create your account.'
	], 500);
}
