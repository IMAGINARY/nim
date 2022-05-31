/**
 * Solver for the 10-stick version of the nim game
 */

/**
 * Return the amount of sticks to take (up to 3) to win the nim game.
 *
 * @param {number} sticksLeft Number of sticks left on the board
 * @return {number}
 */
function nimBest(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }
  switch (sticksLeft % 4) {
    case 1:
      return 1;
    case 2:
      return 1;
    case 3:
      return 2;
    case 0:
      return 3;
  }
}

/**
 * Return the amount of sticks to take (up to 3) to lose the game (or try to).
 * @param {number} sticksLeft
 * @return {number}
 */
function nimWorst(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }

  switch (sticksLeft % 4) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
    case 0:
      return 1;
  }
}

/**
 * Return a random amount of sticks to take (1-3)
 *
 * @param {number} sticksLeft
 * @return {number}
 */
function nimRandom(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }

  return Math.floor(Math.random() * 3) + 1;
}

module.exports = {nimBest, nimRandom};
