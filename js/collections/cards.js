define([
    'underscore',
    'backbone',
    'models/card'
], function(_, Backbone, CardModel){
    return Backbone.Collection.extend({
        model: CardModel,

        setHidden: function (hidden) {
            this.each(function (card) {
                card.set("hidden", hidden, { silent: true });
            });
            this.trigger("change:hidden");
        },

        getAllAfter: function(card) {
            var index = this.indexOf(card);
            
            return this.models.slice(index);
        },

        hasOnTop: function(card) {
            return this.getAllAfter(card).length === 1;
        },

        getVisible: function(card) {
            return this.filter(function (card) {
                return !card.get("hidden");
            });
        },

        // Prevent Sort
        comparator: function(chapter) {
            return false;
        }
    });
});