<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
	session_set_cookie_params([
		'httponly' => true,
		'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
		'samesite' => 'Lax'
	]);

	session_start();
}

function sendJson(array $data, int $statusCode = 200): void
{
	http_response_code($statusCode);
	echo json_encode($data);
	exit;
}

function getJsonInput(): array
{
	$input = file_get_contents('php://input');
	$data = json_decode($input, true);

	if (!is_array($data)) {
		sendJson([
			'success' => false,
			'message' => 'Invalid JSON request.'
		], 400);
	}

	return $data;
}

function requireMethod(string $method): void
{
	if ($_SERVER['REQUEST_METHOD'] !== $method) {
		header('Allow: ' . $method);
		sendJson([
			'success' => false,
			'message' => 'Method not allowed.'
		], 405);
	}
}

function requireLogin(): int
{
	if (empty($_SESSION['player_id'])) {
		sendJson([
			'success' => false,
			'message' => 'Please log in to continue.'
		], 401);
	}

	return (int) $_SESSION['player_id'];
}

function getPlayerResponse(array $player): array
{
	return [
		'id' => (int) $player['id'],
		'name' => $player['name'],
		'email' => $player['email']
	];
}
