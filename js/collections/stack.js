define([
    'underscore',
    'backbone',
    'collections/cards',
    'helpers/cards'
], function(_, Backbone, CardCollection, CardHelper){
    return CardCollection.extend({

        initialize: function(models, options){
            options || (options = {});
            this.foundation = !!options.foundation;
            this.blockAdding = options.blockAdding;
        },

        shuffle: function () {
            throw new Error("Stacks shouldn't be shuffled");
            return false;
        },

        isComplete: function () {
            if (CardHelper.types.length !== this.length) {
                return false;
            }

            var suit = this.first().get("suit"),
                card,
                index = 0;
            
            for (var i = CardHelper.types.length - 1; i >= 0; i--) {
                card = this.at(index++);
                if (CardHelper.types[i] !== card.get("type") || card.get("suit") !== suit) {
                    return false;
                }
            }

            return true;
        },

        canAdd: function (card) {
            if (!card) {
                return false;
            }
            if (this.blockAdding) {
                return false;
            }
            if (this.foundation) {
                if (this.length === 0) {
                    return card.get("type") === "ace";
                }
                return card.canStackOn(this.last());
            }

            if (this.length === 0) {
                return card.get("type") === "king";
            }
            return card.canAlternateStackOn(this.last());
        }
    });
});