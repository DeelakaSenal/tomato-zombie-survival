
/*
 * Puzzle interoperability adapter.
 *
 * Set the Banana API URL only after checking its actual documentation.
 * Do not guess the endpoint or response properties.
 */

const BANANA_API_URL = '';

const fallbackPuzzles = [
  { question: '🍅 + 🍅 = 20', answer: 10 },
  { question: '🍅 + 🍅 + 🍅 = 24', answer: 8 },
  { question: '🍅 × 4 = 36', answer: 9 },
  { question: '(🍅 + 3) × 2 = 26', answer: 10 },
  { question: '(🍅 × 3) - 7 = 32', answer: 13 },
  { question: '🍅 × 🍅 = 49', answer: 7 },
  { question: '🍅 + 🍅 + 5 = 31', answer: 13 },
  { question: '(🍅 - 2) × 5 = 35', answer: 9 }
];

function normalize(data) {
  /*
   * Update this mapping after checking the actual
   * Banana API response structure.
   *
   * Expected internal format:
   * { question: string, answer: number }
   */

  if (
    typeof data.question !== 'string' ||
    !Number.isFinite(Number(data.answer))
  ) {
    throw new Error(
      'Unexpected Banana API response. Update the response mapping.'
    );
  }

  return {
    question: data.question,
    answer: Number(data.answer),
    source: 'Banana API'
  };
}

export async function getPuzzle() {
  if (BANANA_API_URL) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    try {
      const response = await fetch(BANANA_API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(
          `Puzzle service returned ${response.status}`
        );
      }

      const data = await response.json();

      return normalize(data);

    } catch (error) {
      console.warn(
        'Banana API unavailable; using local puzzle:',
        error.message
      );

    } finally {
      clearTimeout(timeout);
    }
  }

  const puzzle =
    fallbackPuzzles[
      Math.floor(Math.random() * fallbackPuzzles.length)
    ];

  return {
    ...puzzle,
    source: 'Local fallback puzzle'
  };
}
