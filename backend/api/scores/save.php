<?php

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../config/database.php';

requireMethod('POST');

$playerId = requireLogin();
$data = getJsonInput();

$score = filter_var($data['score'] ?? null, FILTER_VALIDATE_INT);
$wave = filter_var($data['wave'] ?? null, FILTER_VALIDATE_INT);
$duration = filter_var(
	$data['duration_seconds'] ?? 0,
	FILTER_VALIDATE_INT
);

if (
	$score === false ||
	$wave === false ||
	$duration === false ||
	$score < 0 ||
	$wave < 1 ||
	$duration < 0
) {
	sendJson([
		'success' => false,
		'message' => 'Invalid score information.'
	], 422);
}

try {
	$statement = $pdo->prepare(
		'INSERT INTO scores
			(player_id, score, wave, duration_seconds)
		 VALUES
			(:player_id, :score, :wave, :duration_seconds)'
	);
	$statement->execute([
		'player_id' => $playerId,
		'score' => $score,
		'wave' => $wave,
		'duration_seconds' => $duration
	]);

	sendJson([
		'success' => true,
		'message' => 'Game score saved successfully.',
		'score' => [
			'id' => (int) $pdo->lastInsertId(),
			'score' => $score,
			'wave' => $wave,
			'duration_seconds' => $duration
		]
	], 201);
} catch (PDOException $exception) {
	error_log($exception->getMessage());
	sendJson([
		'success' => false,
		'message' => 'Unable to save game score.'
	], 500);
}
