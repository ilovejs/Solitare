define([
    'jquery',
    'underscore',
    'backbone',
    'views/klondike/game',
    'collections/deck'
], function($, _, Backbone, KlondikeGameView, Deck){
    var AppRouter = Backbone.Router.extend({
        currentView: null,

        routes: {
          '*actions': 'play'
        },

        play: function() {

            if (this.currentView) {
                this.currentView.remove();
            }
            this.currentView = new KlondikeGameView({
                model: new Deck()
            });
        }
    });

    return AppRouter;
});