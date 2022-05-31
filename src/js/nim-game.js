const EventEmitter = require('events');

/**
 * A nim game with a single heap.
 *
 * - 2 players (human and computer).
 * - Human starts
 * - 10 sticks
 * - Each player can remove 1-3 sticks.
 * - Last player to remove a stick loses.
 */
class NimGame {
  constructor() {
    this.events = new EventEmitter();
    this.restart();
  }

  getNumSticks() {
    return NimGame.NumSticks;
  }

  restart() {
    this.setSticksLeft(NimGame.NumSticks);
    this.setCurrentPlayer(NimGame.Human);
    this.isOver = false;
    this.events.emit('start', this.currentPlayer);
  }

  setSticksLeft(sticksLeft) {
    this.sticksLeft = sticksLeft;
    this.events.emit('sticksChanged');
  }

  setCurrentPlayer(player) {
    this.currentPlayer = player;
    this.events.emit('turn', this.currentPlayer);
  }

  opossitePlayer(player) {
    return player === NimGame.Human ? NimGame.Computer : NimGame.Human;
  }

  switchTurn() {
    this.setCurrentPlayer(this.opossitePlayer(this.currentPlayer));
  }

  onGameWon(player) {
    this.isOver = true;
    this.events.emit('victory', player);
  }

  take(numberOfSticks) {
    if (numberOfSticks < 1 || numberOfSticks > 3) {
      throw new Error('Invalid number of sticks');
    }

    if (numberOfSticks > this.sticksLeft) {
      throw new Error('Not enough sticks');
    }

    this.events.emit('take', numberOfSticks, this.currentPlayer);
    this.setSticksLeft(this.sticksLeft - numberOfSticks);
    if (this.sticksLeft === 1) {
      this.onGameWon(this.currentPlayer);
    } else if (this.sticksLeft === 0) {
      this.onGameWon(this.opossitePlayer(this.currentPlayer));
    } else {
      this.switchTurn();
    }
  }
}

NimGame.NumSticks = 10;
NimGame.Human = 'human';
NimGame.Computer = 'computer';

module.exports = NimGame;
