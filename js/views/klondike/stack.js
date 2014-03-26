define([
    'jquery',
    'jqueryui',
    'underscore',
    'backbone',
    'text!templates/klondike/card.htc',
    'text!templates/klondike/card-hidden.htc'
], function($, UI, _, Backbone, klondikeCardTemplate, klondikeCardHiddenTemplate){
    var CARD_SIZES = {
        stacked: $(".common-card-size").outerHeight(),
        normal: $(".last-card-size").outerHeight()
    };

    return Backbone.View.extend({

        initialize: function(options){
            _.bindAll(this, "dragStart", "dragStop", "drop", "checkCondensed");
            this.board = options.board;
            this.addDroppable(this.$el);
            this.listenTo(this.collection, 'add remove reset change:hidden', _.throttle(this.render, 100));

            this.lazyResize = _.debounce(this.checkCondensed, 300);
            $(window).on("resize", this.lazyResize);
        },

        dragStart: function(e, ui) {
            var el = $(e.currentTarget).find(".card"),
                cid = el.data("cid");

            if (cid) {
                $(e.currentTarget).addClass("hidden-for-drag");
                $(e.currentTarget).nextAll("li").addClass("hidden-for-drag");

                this.board.setSelectedCard(this.collection.get(cid), this.collection);
            } else {
                // TODO cancel drag
            }
        },

        dragStop: function(e, ui) {
            this.$(".hidden-for-drag").removeClass("hidden-for-drag");
            this.board.clearSelectedCard();
        },

        drop: function(e, ui) {
            if (this.collection.canAdd(this.board.selectedCard)) {
                $(ui.helper).remove();
                this.board.moveSelectedCardsTo(this.collection);
            }
        },

        addDroppable: function($el) {
            $el.droppable({
                accept: ".stack li:not(.no-drag)",
                activeClass: "ui-state-hover",
                hoverClass: "ui-state-active",
                drop: this.drop
            });
        },

        checkCondensed: function () {
            if (this.$el.closest(".board-stacks").length > 0) {
                var offset = this.$el.offset().top,
                    $els = this.$("li").each(function () {
                        offset += CARD_SIZES.stacked;
                    });

                if ($els.length > 1) {
                    offset += CARD_SIZES.normal - CARD_SIZES.stacked;
                }

                var distanceFromBottom = $(window).height() - offset;

                this.$el.toggleClass("condensed", distanceFromBottom < 220);
            }
        },

        render: function() {
            this.$el.empty();

            this.collection.each(function (card) {
                if (!card.get("hidden")) {
                    this.$el.append(_.template(klondikeCardTemplate, {
                        card: card
                    }));
                } else {
                    this.$el.append(_.template(klondikeCardHiddenTemplate));
                }
            }, this);

            this.$("li:not(.no-drag)").draggable({ 
                revert: true, 
                containment: "body", 
                distance: 10,
                start: this.dragStart,
                stop: this.dragStop,
                helper: function () {
                    var $helper = $("<ul />");
                    $helper.append($(this).clone());
                    $helper.append($(this).nextAll().clone());
                    return $helper.appendTo("body");
                }
            });

            this.checkCondensed();
            this.addDroppable(this.$("li"));

            return this;
        }
    });
});