define([
    'jquery',
    'jqueryui',
    'underscore',
    'backbone',
    'views/klondike/stack',
    'text!templates/klondike/board.htc'
], function($, UI, _, Backbone, StackView, klondikeBoardTemplate) {

    return Backbone.View.extend({
        events: {
            "click .redeal": "redealClick",
            "click .draw-pile": "handleDraw",
            "click .card:not(.card-hidden)": "handleCardClick",
            "click .board-stacks .stack:empty": "handleEmptyBoardStackClick",
            "click .board-foundations .stack:empty": "handleEmptyFoundationStackClick"
        },

        el: $('#container'),

        lastClickTime: null,
        selectedCard: null,
        selectedStack: null,

        initialize: function() {
            this.prepareDeck();
            this.render();
        },

        prepareDeck: function () {
            this.deal = this.model.deal();
            this.playShuffle();
        },

        redealClick: function () {
            this.model.reset();
            this.prepareDeck();
            this.render();
            return false;
        },

        handleDraw: function () {
            this.clearSelectedCard();
            var card = this.deal.pile.pop();
            
            if (card) {
                this.playMove();
                card.set("hidden", false);
                this.deal.drawn.push(card);
            } else {
                this.playShuffle();
                this.deal.pile.reset(this.deal.drawn.models.reverse());
                this.deal.pile.setHidden(true);
                this.deal.drawn.reset();
            }
        },

        checkWinState: function () {
            if (this.model.complete()) {
                this.playWin();
                this.redealClick();
            }
        },

        updateScore: function () {
            this.$(".score span").text(this.model.score());
        },

        handleCardClick: function (e) {
            var el = $(e.currentTarget),
                cid = el.data("cid");

            if (this.selectedCard !== null && this.selectedCard.cid === cid) {
                this.playMove();
                if (new Date().getTime() - this.lastClickTime < 800) {
                    this.model.moveToFoundation(this.selectedCard, this.selectedStack);
                    this.afterMove();
                }
                this.clearSelectedCard();
                return;
            }

            if (el.closest(".draw-pile").length > 0) {
                this.clearSelectedCard();
                return;
            }

            var stack = this.getStack(el);

            if (stack !== null) {
                var card = stack.get(cid);
                if (this.selectedCard !== null && this.selectedStack !== stack) {
                    if (stack.canAdd(this.selectedCard)) {
                        this.moveSelectedCardsTo(stack);
                    } else {
                        this.illegalMove();
                    }
                } else {
                    this.playMove();
                    this.setSelectedCard(card, stack);
                }
            }
        },

        getStack: function (el) {
            var stackEl = el.closest(".drawn-pile"),
                stack = null;

            if (stackEl.length > 0) {
                this.clearSelectedCard();
                stack = this.deal.drawn;
                card = this.deal.drawn.last();
            } else {
                stackEl = el.closest(".board-foundations .stack");
                if (stackEl.length > 0) {
                    stack = this.deal.foundations[stackEl.index()];
                } else {
                    stackEl = el.closest(".board-stacks .stack");
                    if (stackEl.length > 0) {
                        stack = this.deal.stacks[stackEl.index()];
                    }
                }
            }
            return stack;
        },

        illegalMove: function () {
            alert("Invalid move");
            this.clearSelectedCard();
        },

        playShuffle: function () {
            var audio = $("#audio-shuffle").get(0);
            this.playAudio(audio);
        },

        playWin: function () {
            var audio = $("#audio-win").get(0);
            this.playAudio(audio);
        },

        playMove: function () {
            var audio = $("#audio-move").get(0);
            this.playAudio(audio);
        },

        playAudio: function (audio) {
            audio.pause();
            try {
                audio.currentTime = 0;
            } catch (e) {
                console.log(e);
            }
            audio.play();
        },

        handleEmptyBoardStackClick: function (e) {
            var el = $(e.currentTarget),
                stack = this.deal.stacks[el.index()];

            if (this.selectedCard !== null) {
                if (this.selectedCard.get("type") === "king") {
                    this.moveSelectedCardsTo(stack);
                } else {
                    this.illegalMove();
                }
            }
        },

        handleEmptyFoundationStackClick: function (e) {
            var el = $(e.currentTarget),
                stack = this.deal.foundations[el.index()];

            if (this.selectedCard !== null) {
                if (stack.canAdd(this.selectedCard)) {
                    this.moveSelectedCardsTo(stack);
                } else {
                    this.illegalMove();
                }
            }
        },

        moveSelectedCardsTo: function (stack) {
            this.playMove();
            this.model.moveCards(this.getSelectedCards(), this.selectedStack, stack);
            this.afterMove();
        },

        afterMove: function (stack) {
            this.clearSelectedCard();
            this.checkWinState();
            this.updateScore();
        },

        clearSelectedCard: function () {
            this.$(".selected.card").removeClass("selected");
            this.selectedCard = null;
            this.selectedStack = null;
            this.lastClickTime = null;
        },

        setSelectedCard: function (card, stack) {
            this.clearSelectedCard();
            this.$(".card[data-cid=" + card.cid + "]").addClass("selected")
                .parent().nextAll().find(".card").addClass("selected");
            this.selectedCard = card;
            this.selectedStack = stack;
            this.lastClickTime = new Date().getTime();
        },

        getSelectedCards: function () {
            return this.selectedStack.getAllAfter(this.selectedCard);
        },

        render: function() {
            this.$el.html(_.template(klondikeBoardTemplate));

            this.stackViews = [];

            var stackEls = this.$(".board-stacks .stack");
            for (var i = 0; i < this.deal.stacks.length; i++) {
                this.stackViews.push(new StackView({
                    el: stackEls.eq(i),
                    collection: this.deal.stacks[i],
                    board: this
                }).render());
            }

            this.foundationViews = [];

            var foundationEls = this.$(".board-foundations .stack");
            for (var i = 0; i < this.deal.foundations.length; i++) {
                this.foundationViews.push(new StackView({
                    el: foundationEls.eq(i),
                    collection: this.deal.foundations[i],
                    board: this
                }).render());
            }

            this.pileView = new StackView({
                el: this.$(".draw-pile"),
                collection: this.deal.pile,
                board: this
            }).render();

            this.drawnView = new StackView({
                el: this.$(".drawn-pile"),
                collection: this.deal.drawn,
                board: this
            }).render();
        }
    });
});