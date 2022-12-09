(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.ValidFromDate", {
            parseValue: function (sValue, sInternalValue) {
                return sValue;
            },
            formatValue: function (sValue, sInternalType) {
                return sValue;
            },
            validateValue: function (sValue) {
                let today,dateDiff, dateArray, oBdayDate, iDaymilliseconds = 86400000;
                dateArray = sValue.split("."); // dd.mm.yyyy
                oBdayDate = new Date(dateArray[2], (dateArray[1] - 1), dateArray[0]); // yyyy,mm,dd
                today = new Date();
                dateDiff = today.getTime() - oBdayDate.getTime();
                if (dateDiff > iDaymilliseconds) {
                    throw new ValidateException(`Das Datum liegt in der Vergangenheit.`);
                }
            }
        });
    });
})();