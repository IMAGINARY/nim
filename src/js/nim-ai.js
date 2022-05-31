const {nimBest, nimRandom} = require('./nim');

/**
 * Return the amount of sticks to take (up to 3), based on the quality of the AI.
 *
 * If the quality is N with N in [0, 1] the AI will make the best move with probability N.
 * If the quality is N with N in [-1, 0) the AI will avoid the best move with probability -N.
 *
 * @param sticksLeft
 * @param quality
 */
function nimAi(sticksLeft, quality) {
  if (quality >= 0) {
    return Math.random() < quality ? nimBest(sticksLeft) : nimRandom(sticksLeft);
  }
  return Math.random() < -quality ? nimWorst(sticksLeft) : nimRandom(sticksLeft);
}
