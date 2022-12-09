(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.ValidMaxMinSupplierDate", {
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
                let sTreeWeekTime = oWeekDate.setDate(oWeekDate.getDate() + 21);
                let sSixMonthTime = oMonthDate.setMonth(oMonthDate.getMonth() + 6);
                if (oDate.getTime() < sTreeWeekTime || oDate.getTime() > sSixMonthTime) {
                    throw new ValidateException(`Das Datum darf mindestens 3 Wochen und maximal 6 Monate in der Zukunft liegen.`);
                }
            }
        });
    });
})();