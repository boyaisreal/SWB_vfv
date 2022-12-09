sap.ui.define([], function () {
    "use strict";

    function formatImagePath(sRelativeImagePath) {
        return `${jQuery.sap.getModulePath("swd.fair.consumerFriendly")}${sRelativeImagePath}`;
    }


    function formatTextFinalApp(sValue, sText) {
        return sValue ? sText + " " + sValue : "";
    }
    
    function formatDateTextFinalApp(sValue, sText) {
        let sDate;
        if(!sValue) return "";
        if(sValue.includes("-")) {
            let aValue = sValue.split("-");
            sDate = aValue[2] + "." + aValue[1] + "." + aValue[0];
             return sText + " " + sDate;
        }        
        return sText + " " + sValue;
    }

    function abapDateToReadableDate(sValue) {
        return sValue.substr(6, 2) + "." + sValue.substr(4, 2) + "." + sValue.substr(0, 4);
    }

    function formatSalutation(sValue) {
        if (sValue) {
            switch (sValue) {
                case '0001':
                    return "Frau";
                case '0002':
                    return "Herr";
                default:
                    return '';
            }
        }
    }


    function formatProcessCode(sValue, sText) {
        let sFormattedText;
        if (sValue) {
            if (sValue === 'Z1') {
                sFormattedText = "Versorgerwechsel";
            } else if (sValue === 'Z2') {
                sFormattedText = "Einzug/ Umzug​";
            } else {
                sFormattedText = 'Retention';
            }
        }
        return sText + " " + sFormattedText
    }

    function formatActionType(sValue, sText) {
        let sFormattedText;
        if (sValue) {
            if (sValue === 'Z1') {
                sFormattedText = "Keine";
            } else if (sValue === 'Z2') {
                sFormattedText = "Aktionscode​";
            } else {
                sFormattedText = 'KwK';
            }
        }
        return sText + " " + sFormattedText
    }

    function academicTitle(sValue) {
        if (sValue) {
            switch (sValue) {
                case '0001':
                    return "Dr.";
                case '0002':
                    return "Prof.";
                case '0003':
                    return "Prof. Dr.";
                case '0004':
                    return "B.A.";
                case '0005':
                    return "BA";
                default:
                    return "Ph.D";
            }
        }
    }

    function toCurrency(sValue) {
        if (sValue) {
            let fValue = parseFloat(sValue).toFixed(2);
            let strValue = fValue.toString();
            return strValue.replace(".", ",");
        }
    }

    function toCurrencyInCt(sValue) {
        if (sValue) {
            let fValue = (parseFloat(sValue) * 100).toFixed(2);
            let strValue = fValue.toString();
            return strValue.replace(".", ",");
        }
    }

    return {
        formatImagePath: formatImagePath,
        formatTextFinalApp: formatTextFinalApp,
        formatSalutation: formatSalutation,
        academicTitle: academicTitle,
        formatProcessCode: formatProcessCode,
        formatActionType: formatActionType,
        formatDateTextFinalApp: formatDateTextFinalApp,
        abapDateToReadableDate: abapDateToReadableDate,
        toCurrency: toCurrency,
        toCurrencyInCt: toCurrencyInCt
    };
});