<?php

declare(strict_types=1);

$database = getenv('DB_PATH') ?: __DIR__ . '/../../database/tomato_zombie_survival.sqlite';

try {
	$pdo = new PDO(
		'sqlite:' . $database,
		null,
		null,
		[
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
		]
	);

	$pdo->exec('PRAGMA foreign_keys = ON');
	$schema = file_get_contents(__DIR__ . '/../../database/schema.sql');

	if ($schema === false) {
		throw new PDOException('Unable to read the SQLite schema.');
	}

	$pdo->exec($schema);
} catch (PDOException $exception) {
	error_log($exception->getMessage());

	http_response_code(500);
	header('Content-Type: application/json; charset=utf-8');

	echo json_encode([
		'success' => false,
		'message' => 'Database connection failed.'
	]);

	exit;
}
