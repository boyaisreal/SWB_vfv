(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.ValidMaxMinMoveInDate", {
            parseValue: function (sValue, sInternalValue) {
                return sValue;
            },
            formatValue: function (sValue, sInternalType) {
                return sValue;
            },
            validateValue: function (sValue) {
                let oWeekDate = new Date(new Date().setHours(0,0,0,0)), oMonthDate = new Date(new Date().setHours(0,0,0,0)), dateArray, oDate;
                dateArray = sValue.split("."); // dd.mm.yyyy
                oDate = new Date(dateArray[2], (dateArray[1] - 1), dateArray[0]); // yyyy,mm,dd
                let sSixWeekTime = oWeekDate.setDate(oWeekDate.getDate() - 35);
                if (oDate.getTime() < sSixWeekTime) {
                    throw new ValidateException(`Das Datum darf maximal 5 Wochen in der Vergangenheit liegen.`);
                }
            }
        });
    });
})();