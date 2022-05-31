/* globals IMAGINARY */

const NimGame = require('./nim-game');
const NimGameView = require('./nim-game-view');

IMAGINARY.i18n.init({
  queryStringVariable: 'lang',
  translationsDirectory: 'tr',
  defaultLanguage: 'en'
}).then(function(){
  $('[data-component="nim-game"]').each((i, container) => {
    const game = new NimGame();
    const view = new NimGameView(game);
    $(container).append(view.$element);
    window.gameView = view;
  });
}).catch(function(err){
  console.error(err);
});
