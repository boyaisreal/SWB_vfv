(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.Phone", {
            parseValue: function (sValue, sInternalValue) {
                return sValue;
            },
            formatValue: function (sValue, sInternalType) {
                return sValue;
            },
            validateValue: function (sValue) {
                if (sValue && !sValue.match(/^(0{1})[0-9]{0,27}\b/gm))
                    throw new ValidateException(`Telefonnummer muss mit 0 anfangen und darf maximal 28 Ziffern enthalten`);
            }
        });
    });
})();