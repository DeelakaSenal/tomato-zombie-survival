
/*
 * Puzzle interoperability adapter.
 *
 * Banana API documentation:
 * https://marcconrad.com/uob/banana/doc.php
 * The API returns { question: Base64 PNG, solution: number } when
 * out=json&base64=yes is used.
 */

const BANANA_API_URL =
  'https://marcconrad.com/uob/banana/api.php?out=json&base64=yes';

const fallbackPuzzles = [
  { question: '� + � = 20', answer: 10 },
  { question: '� + � + � = 24', answer: 8 },
  { question: '� × 4 = 36', answer: 9 },
  { question: '(� + 3) × 2 = 26', answer: 10 },
  { question: '(� × 3) - 7 = 32', answer: 13 },
  { question: '� × � = 49', answer: 7 },
  { question: '� + � + 5 = 31', answer: 13 },
  { question: '(� - 2) × 5 = 35', answer: 9 }
];

function normalize(data) {
  if (
    typeof data.question !== 'string' ||
    !Number.isFinite(Number(data.solution))
  ) {
    throw new Error(
      'Unexpected Banana API response. Update the response mapping.'
    );
  }

  return {
    image: `data:image/png;base64,${data.question}`,
    question: '',
    answer: Number(data.solution),
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

      const puzzle = normalize(data);

      window.dispatchEvent(new CustomEvent('puzzle:loaded', {
        detail: { source: puzzle.source }
      }));

      return puzzle;

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
    image: null,
    source: 'Local fallback puzzle'
  };
}
