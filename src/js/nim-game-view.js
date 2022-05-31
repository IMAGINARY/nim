/* globals IMAGINARY */
require('../sass/nim-game-view.scss');
const {nimBest, nimRandom} = require('./nim');

class NimGameView {
  constructor(game) {
    this.game = game;

    this.game.events.on('start', () => { this.onGameStart() });
    this.game.events.on('take', (amount, player) => { this.onTake(amount, player); });
    this.game.events.on('turn', (player) => { this.onTurn(player); });
    this.game.events.on('victory', (player) => { this.onVictory(player); });

    this.$element = $('<div></div>').addClass('nim-game');
    this.$messageBoxContainer = $('<div></div>').addClass('message-box-container');
    this.$messageBox = $('<div></div>').addClass('message-box').text('Human wins')

    this.$take1Btn = $('<button></button>').attr('type', 'button');
    this.$take2Btn = $('<button></button>').attr('type', 'button');
    this.$take3Btn = $('<button></button>').attr('type', 'button');
    this.$restartBtn = $('<button></button>').attr('type', 'button');

    // Sticks
    this.sticks = [];
    for (let i = 0; i < game.getNumSticks(); i += 1) {
      this.sticks.push($('<div></div>').addClass(['stick', 'img-fluid']));
    }
    this.$element.append(
      $('<div></div>').addClass('stick-container')
        .append($('<div></div>').addClass(['row', 'content-justify-center'])
          .append(this.sticks.map(stick => $('<div></div>')
            .addClass('col')
            .append(stick))))
        .append(this.$messageBoxContainer.append(this.$messageBox)));

    // Input
    this.$element.append(
      $('<div></div>').addClass('input-pane')
        .append(
          $('<div></div>').addClass('row justify-content-between')
            .append([
              $('<div></div>').addClass('col-9')
                .append($('<div></div>').addClass('row')
                  .append([
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take1Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '1'))
                          .on('click', () => { this.handleTake(1); })
                      )
                    ),
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take2Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '2'))
                          .on('click', () => { this.handleTake(2); })
                        )
                    ),
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take3Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '3'))
                          .on('click', () => { this.handleTake(3); })
                      )
                    )
                  ])),
              $('<div></div>').addClass('col-3').append(
                $('<div>').addClass('col').append(
                  $('<div>').addClass('d-grid').append(
                    this.$restartBtn.addClass(['btn', 'btn-outline-secondary', 'btn-restart'])
                      .text(IMAGINARY.i18n.t('RESTART'))
                      .on('click', () => { this.handleRestart(); })
                  )
                )
              ),
            ])
        )
    );
  }

  removeSticks(amount, direction) {
    this.sticks.filter(stick => !stick.hasClass('taken')).reverse().slice(0, amount)
      .forEach(stick => stick.addClass(['taken', `taken-${direction}`]));
  }

  resetSticks() {
    this.sticks.forEach(stick => stick.removeClass(['taken', 'taken-n', 'taken-s']));
  }

  showMessage(text) {
    this.$messageBox.text(text);
    this.$messageBoxContainer.addClass('visible');
  }

  hideMessage() {
    this.$messageBoxContainer.removeClass('visible');
  }

  disableInput() {
    this.disableTake();
    this.disableRestart();
  }

  enableInput() {
    this.enableTake();
    this.enableRestart();
  }

  disableTake() {
    [ this.$take1Btn, this.$take2Btn, this.$take3Btn ].forEach((button) => {
      button.addClass('disabled').attr('disabled', true);
    });
  }

  enableTake() {
    [ this.$take1Btn, this.$take2Btn, this.$take3Btn ].forEach((button) => {
      button.removeClass('disabled').attr('disabled', false);
    });
  }

  disableRestart() {
    this.$restartBtn.addClass('disabled').attr('disabled', true);
  }

  enableRestart() {
    this.$restartBtn.removeClass('disabled').attr('disabled', false);
  }

  handleTake(amount) {
    this.game.take(amount);
  }

  handleRestart() {
    this.game.restart();
  }

  onGameStart() {
    this.hideMessage();
    this.resetSticks();
  }

  onTake(amount, player) {
    this.removeSticks(amount, player === 'human' ? 's' : 'n');
  }

  onTurn(player) {
    if (player === 'human') {
      this.enableInput();
    } else {
      this.disableInput();
    }

    if (player === 'computer') {
      setTimeout(() => {
        this.game.take(nimBest(this.game.sticksLeft));
      }, Math.random() * 1500 + 1000);
    }
  }

  onVictory(player) {
    this.showMessage(player === 'human' ? IMAGINARY.i18n.t('HUMAN_WINS') : IMAGINARY.i18n.t('COMPUTER_WINS'))
    this.disableTake();
    this.enableRestart();
  }
}

module.exports = NimGameView;
