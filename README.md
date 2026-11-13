
# 🍅 Tomato Zombie Survival

Tomato Zombie Survival is a 2D browser-based survival game developed for the CIS046-3 Software For Enterprise assignment.

The player controls a tomato character, shoots approaching zombies, survives increasingly difficult waves and solves a tomato number puzzle after losing a life to earn a life back.

## Main Features

- Player registration and login
- Individual player profiles
- 2D top-down survival gameplay
- WASD and arrow-key movement
- Mouse aiming and shooting
- Zombies that chase the player
- Lives, score and increasing difficulty
- Tomato number puzzle challenges
- Personal best score
- Individual score tracking
- Leaderboard
- External Banana API integration for image-based puzzles

## Technologies

| Area | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Game | HTML Canvas |
| Backend | PHP |
| Database | MySQL |
| API Communication | REST API, Fetch API, JSON |
| Version Control | Git and GitHub |

## Requirements

- PHP 8.1 or later
- MySQL 8 or compatible MariaDB
- A modern web browser
- Git
- VS Code (recommended)
- XAMPP, MAMP or PHP built-in development server

## Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Enter the project directory:

   ```bash
   cd tomato-zombie-survival
   ```

3. Start your MySQL server.

4. Import the database schema:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. Configure the database credentials in:

   `backend/config/database.php`

6. Start the PHP development server:

   ```bash
   php -S 127.0.0.1:8000
   ```

7. Open the application:

   `http://127.0.0.1:8000`

## Game Controls

| Control | Action |
|---|---|
| W / Arrow Up | Move up |
| A / Arrow Left | Move left |
| S / Arrow Down | Move down |
| D / Arrow Right | Move right |
| Mouse | Aim |
| Left Click | Shoot |
| Space | Shoot |
| P / Escape | Pause or resume |

## Software Engineering Concepts

### 1. Event-Driven Programming
The game responds to keyboard, mouse, button and form events through JavaScript event listeners.

### 2. Interoperability
The frontend communicates with the PHP backend through HTTP requests and JSON. The puzzle module also consumes the external Banana API at `https://marcconrad.com/uob/banana/api.php?out=json&base64=yes`. Banana returns a Base64-encoded PNG in `question` and the numeric answer in `solution`; `assets/js/puzzles.js` maps those fields to the game's internal puzzle format. The documentation is available at https://marcconrad.com/uob/banana/doc.php.

### 3. Virtual Identity
Players can register, log in and maintain an authenticated session.

### 4. Individual Scores
Each player's completed game scores are stored separately and used to calculate personal best scores and leaderboard rankings.

### 5. Version Control
Git is used to track development progress through meaningful commits and GitHub repository management.

## Project Structure

```text
tomato-zombie-survival/
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── app.js
│       ├── events.js
│       ├── game.js
│       └── puzzles.js
├── backend/
│   ├── config/
│   ├── api/
│   └── helpers.php
└── database/
    └── schema.sql
```

## Notes

The Banana API integration uses the documented JSON/Base64 endpoint and response format. Local fallback puzzles are used when the external service is unavailable.

## Code and External Sources

The game logic and integration code in this repository was written for this project. GitHub Copilot was used as an AI coding assistant to help implement and explain the Banana API response mapping; the code was reviewed, tested and integrated by the student. The Banana API is an external service provided by Marc Conrad and is consumed according to its documentation. The response mapping is documented in `assets/js/puzzles.js`. No third-party source code is copied into this repository.

This project is intended for educational purposes.
