define([
    'underscore',
    'backbone',
    'collections/cards',
    'collections/stack',
    'helpers/cards'
], function(_, Backbone, CardCollection, Stack, CardHelper){
	var STACK_COUNT = 7;

    return CardCollection.extend({

    	initialize: function(){
	        this.reset();
	    },

    	reset: function () {
    		this.dealt = false;
    		var newDeck = _.shuffle(this.generate());
			return CardCollection.prototype.reset.apply(this, [newDeck]);
    	},

    	generate: function () {
			var deck = [];

			for (var i = CardHelper.suits.length - 1; i >= 0; i--) {
				for (var j = CardHelper.types.length - 1; j >= 0; j--) {
					deck.push({
						type: CardHelper.types[j],
						suit: CardHelper.suits[i],
						hidden: true
					});
				}
			}

			return deck;
    	},

        complete: function () {
            for (var i = 0; i < this.dealt.foundations.length; i++) {
                if (!this.dealt.foundations[i].isComplete()) {
                    return false;
                }
            }
            return true;
        },

    	score: function () {
        	if (!this.dealt) {
        		return 0;
        	}

        	var score = -7 * 5; // To have a score of zero at start
        	for (var i = 0; i < this.dealt.stacks.length; i++) {
        		score += this.dealt.stacks[i].getVisible().length * 5;
        	}

        	for (var i = 0; i < this.dealt.foundations.length; i++) {
        		score += this.dealt.foundations[i].length * 15;
        	}

        	return score;
    	},

        deal: function() {
        	if (this.dealt) {
        		return this.dealt;
        	}
			var stacks = [],
				cards = this.models,
				i;

			for (i = 0; i < STACK_COUNT; i++) {
				stacks.push(new Stack([], { blockAdding: false }));
			}

			for (var startFrom = 0; startFrom < STACK_COUNT; startFrom++) {
				for (i = startFrom; i < STACK_COUNT; i++) {
					var card = cards.pop();
					card.set("hidden", i !== startFrom);
					stacks[i].push(card);
				}
			}

			var foundations = [];

			for (i = 0; i < CardHelper.suits.length; i++) {
				foundations.push(new Stack([], { foundation: true, blockAdding: false }));
			}
			
			this.dealt = {
				stacks: stacks,
				foundations: foundations,
				pile: new Stack(cards, { blockAdding: true }),
				drawn: new Stack([], { blockAdding: true })
			};
            return this.dealt;
        },

        moveCards: function (cards, oldStack, newStack) {
        	if (!_.isArray(cards)) cards = cards ? [cards] : [];
            oldStack.remove(cards);
            newStack.add(cards);

            if (oldStack.length > 0) {
                oldStack.last().set("hidden", false);
            }
        },

        moveToFoundation: function (card, stack) {
            if (!stack.foundation && stack.hasOnTop(card)) {
                var foundations = this.dealt.foundations;
                if (card.get("type") === "ace") {
                    for (var i = foundations.length - 1; i >= 0; i--) {
                        if (foundations[i].length == 0) {
                            this.moveCards(card, stack, foundations[i]);
                            return;
                        }
                    }
                    throw new Error("Ace can't be moved as there are no free foundations");
                } else {
                    for (var i = foundations.length - 1; i >= 0; i--) {
                        if (foundations[i].length > 0 && card.canStackOn(foundations[i].last())) {
                            this.moveCards(card, stack, foundations[i]);
                        }
                    }
                }
            }
        },
    });
});