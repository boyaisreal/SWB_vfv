(function () {
    "use strict";
    sap.ui.define(["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"], function (
        SimpleType,
        ValidateException
    ) {
        return SimpleType.extend("swd.fair.consumerFriendly.util.types.BirthDate", {
            parseValue: function (sValue, sInternalValue) {
                return sValue;
            },
            formatValue: function (sValue, sInternalType) {
                return sValue;
            },
            validateValue: function (sValue) {
                let today, oBdayDate, dateArray, dateDiff, yearInMS;
                yearInMS = 31557600000;
                today = new Date();
                sValue = /\b\d{8}\b/.test(sValue) ? sValue.substring(6,8)+"."+sValue.substring(4,6)+"."+sValue.substring(0,4) : sValue;
                dateArray = sValue.split("."); // dd.mm.yyyy
                oBdayDate = new Date(dateArray[2], (dateArray[1] - 1), dateArray[0]); // yyyy,mm,dd
                dateDiff = today.getTime() - oBdayDate.getTime();
                switch (true) {
                    case (oBdayDate.toString() === 'Invalid Date'):
                        throw new ValidateException(`Das Datum muss dem Format dd.mm.yyyy entsprechen.`);
                        break;
                    case (dateDiff < 0): // in the future
                        throw new ValidateException(`Das Datum liegt in der Zukunft.`);
                        break;
                    case ((dateDiff / yearInMS) < 18): // less than 18 years
                        throw new ValidateException(`Der Geschäftspartner ist nicht volljährig.`);
                        break;
                    case ((dateDiff / yearInMS) > 150):
                        throw new ValidateException(`Das Datum liegt mehr als 150 Jahre in der Vergangenheit.`);
                        break;
                    default: //ok date
                }
            }
        });
    });
})();