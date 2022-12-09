(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.Email", {
            parseValue: function (sValue, sInternalValue) {
                return sValue;
            },
            formatValue: function (sValue, sInternalType) {
                return sValue;
            },
            validateValue: function (sValue) {
                if (sValue && !sValue.match(/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/igm))
                    throw new ValidateException(`${sValue} ist keine gültige Email!`);
            }
        });
    });
})();