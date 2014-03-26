define([
	'underscore',
	'backbone',
    '../helpers/cards'
], function(_, Backbone, CardHelper){
	return Backbone.Model.extend({
		defaults: {
      		suit: "spade",
      		type: "ace",
      		hidden: true,
	    },

		getPictureSectionCount: function () {
			return CardHelper.sectionCounts[this.get("type")];
		},

		toChar: function () {
			return CardHelper.chars[this.get("type")];
		},

		isRed: function () {
			return this.get("suit") === "diamond" || this.get("suit") === "heart";
		},

		isBlack: function () {
			return this.get("suit") === "spade" || this.get("suit") === "clubs";
		},

		canAlternateStackOn: function (card) {
			return this.isRed() === card.isBlack() && this.isAfter(card);
		},

		canStackOn: function (card) {
			return this.get("suit") === card.get("suit") && card.isAfter(this);
		},

		isAfter: function (card) {
			return this.cardIndex() === card.cardIndex() + 1;
		},

		cardIndex: function () {
			return _.indexOf(CardHelper.types, this.get("type"));
		}
	});
});