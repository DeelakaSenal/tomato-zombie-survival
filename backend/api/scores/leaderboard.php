<?php

require_once __DIR__ . '/../../helpers.php';
require_once __DIR__ . '/../../config/database.php';

requireMethod('GET');
$playerId = requireLogin();

try {
	$statement = $pdo->query(
		'SELECT
			p.id AS player_id,
			p.name,
			MAX(s.score) AS best_score,
			MAX(s.wave) AS highest_wave
		 FROM players p
		 INNER JOIN scores s ON s.player_id = p.id
		 GROUP BY p.id, p.name
		 ORDER BY best_score DESC, highest_wave DESC
		 LIMIT 10'
	);

	$players = $statement->fetchAll();
	$leaderboard = array_map(
		static function (array $player): array {
			return [
				'player_id' => (int) $player['player_id'],
				'name' => $player['name'],
				'best_score' => (int) $player['best_score'],
				'highest_wave' => (int) $player['highest_wave']
			];
		},
		$players
	);

	$bestStatement = $pdo->prepare(
		'SELECT COALESCE(MAX(score), 0) FROM scores WHERE player_id = :player_id'
	);
	$bestStatement->execute(['player_id' => $playerId]);

	sendJson([
		'success' => true,
		'leaderboard' => $leaderboard,
		'personalBest' => (int) $bestStatement->fetchColumn()
	]);
} catch (PDOException $exception) {
	error_log($exception->getMessage());
	sendJson([
		'success' => false,
		'message' => 'Unable to retrieve leaderboard.'
	], 500);
}
