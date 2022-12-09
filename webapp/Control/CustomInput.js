sap.ui.define(
    ["sap/m/Input"],
    function (Input) {
        return Input.extend("swd.fair.consumerFriendly.Control.CustomInput", {
            metadata: {
                events: {
                    focusin: {}
                },
                aggregations: {
                    content: {
                        type: "sap.ui.core.Control"
                    }
                },
                defaultAggregation: "content",
            },
            renderer: {},
            onAfterRendering: function () {
                if (Input.prototype.onAfterRendering) {
                    Input.prototype.onAfterRendering.apply(this, arguments);
                }
                this.addFocusInEvent()
            },
            addFocusInEvent: function () {
                this.$().bind('focusin', function (oEvent) {
                    //oEvent.preventDefault();
                    this.fireFocusin({
                        Event: oEvent
                    });
                    $(this).unbind("focusin");
                }.bind(this))
            }
        });
    });