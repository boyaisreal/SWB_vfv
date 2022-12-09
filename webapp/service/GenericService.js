sap.ui.define([
    "swd/fair/consumerFriendly/service/BackendCommunicationService"
], function (BackendCommunicationService) {
    "use strict";

    let oDateStringReg = new RegExp(/^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.\d{4}\s*$/);
    let oDateStringRegExtended = new RegExp(/^\s*((?:19|20)\d{2})\-(1[012]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])\s*$/);
    const oGenericService = function (oComponent, sModel) {
        this.oComponent = oComponent;
        this.oGenericModel = oComponent.getModel(sModel);
        this.oBackendCommunicationService = new BackendCommunicationService(this.oGenericModel);
    };

    oGenericService.prototype.getGenericData = async function (oPayload) {
        let oData = await this.oBackendCommunicationService.getCreateEntityPromise("/GENFunctionSet", oPayload)
        return _mapGenericDataResponse(oData)
    };

    oGenericService.prototype.readServicesuppliers = async function(aFilter) {
        return await this.oBackendCommunicationService.getReadEntitySetPromise("/ServiceProviderSet", aFilter);
    };

    oGenericService.prototype.readServiceType = async function(aFilter) {
        return await this.oBackendCommunicationService.getReadEntitySetPromise("/CustomizingServiceTypeSet", aFilter);
    };

    oGenericService.prototype.sendGenericData = async function (oData, aObjects) {
        var oSturctur = this.oComponent.getModel("util").getProperty("/GenericStructur");
        oSturctur.Functionname = "PSL004_SaveOrder"
        oSturctur.FunctionParams = [];
        let oPayload = _mapGenericDataRequest(oData, oSturctur, aObjects, this.oComponent.getModel("util"));
        let util = this.oComponent.getModel("util");
        let i = 1;
        let iString;
        if(this.oComponent.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductelectric/Data"))
        {
            iString=i.toString();
            mapProductsGeneric(oPayload, iString, util, "electric");
            i=++i;
        
        }
        if(this.oComponent.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductgas/Data"))
        {
            iString=i.toString();
            mapProductsGeneric(oPayload, iString, util, "gas");
            i=++i;
        }
        if(this.oComponent.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductwater/Data"))
        {
            iString=i.toString();
           mapProductsGeneric(oPayload, iString, util, "water");
           i=++i;
        }
        console.log(oPayload);
        return await this.oBackendCommunicationService.getCreateEntityPromise("/GENFunctionSet", oPayload)
    };

    oGenericService.prototype.onHandleStreetChanged = async function (oEvent, oBinding) {
        let oStructur = this.getModel("util").getProperty("/GenericStructur"),
            oSource = oEvent.getSource();
        if (!!oBinding.Street && !!oBinding.City && !!oBinding.PostCode) {
            try {
                const aStreet = this.getModel("util").getProperty("/StreetDataSet").filter(function (item) {
                    return item.StreetText.replace(".", "") === oBinding.Street.replace(".", "");
                });
                if (aStreet.length === 0 && parseInt(oBinding.PostCode) >= 40210 && parseInt(oBinding.PostCode) <= 40721) {
                    oSource.setValueState("Error")
                    oSource.setValueStateText("Bitte die Adresse nochmal überprüfen");
                    this.MessagePopover.addMessageToPopover(this.getController("WizardContainer"), oSource, "Error", "Bitte die Adresse nochmal überprüfen", oSource.getCustomData()[0].getValue());
                } else {
                    oSource.setValueState("None")
                    this.MessagePopover.removeMessageFromTarget(this.getController("WizardContainer"), oSource);
                }
            } catch (oError) {
                console.log(oError.message);
            }
        }
    };

    async function _mapGenericDataResponse(oData) {
        let aList = [],
            aUniqueObjectId = [],
            oResponse = {};
        oData.FunctionParams.results.forEach(function (item, index, aData) {
            if ($.inArray(item.Objectid, aUniqueObjectId) === -1) {
                aUniqueObjectId.push(item.Objectid);
                if (index !== 0) {
                    aList.push(oResponse);
                    oResponse = {};
                }
            }
            oResponse[item.Fieldname] = item.Fieldvalue;
            if (aData.length - 1 === index) aList.push(oResponse);
        });
        return Promise.resolve(aList);
    };

    function _mapGenericDataRequest(oData, oSturctur, aObjects) {
        for (let key in oData) {
            if (aObjects.includes(key)) {
                for (let key2 in oData[key]) {
                    if (_checkInvalidateBackendProperty(key2)) {
                        let sValue  = oData[key][key2];
                        if (oDateStringReg.test(sValue)) {
                            let dateArray = sValue.split(".");
                            sValue = dateArray[2] + dateArray[1] + dateArray[0]
                        } else if (oDateStringRegExtended.test(sValue)) {
                            sValue = sValue.replaceAll("-", "");
                        } else if (typeof (sValue) === "boolean") sValue = sValue === true ? "Y" : "N";
                        if (sValue !== null && sValue !== undefined) {
                            let oGenObject = {
                                "Objectid": "1",
                                "Objectname": key,
                                "Fieldname": key2,
                                "Fieldvalue": sValue
                            }
                            oSturctur.FunctionParams.push(oGenObject);
                        }
                    }
                }
            }
            if (typeof (oData[key]) == "object")
                _mapGenericDataRequest(oData[key], oSturctur, aObjects);
        }
        return oSturctur;
    }

    function mapProductsGeneric(oSturctur, ObjectID, util, energyType){
        let aKey=["ProductId",
            "ConfigId",
            "Description",
            "Division",
            "InitValidityDuration",
            "InitValidityUnit",
            "IsRecommended",
            "IsSelected",
            "PriceGuaranteeDate",
            "PriceGuaranteeDuration",
            "PriceGuaranteeType",
            "PriceGuaranteeUnit",
            "PriceId",
            "ProductFamily",
            "ProductInfo",
            "TariffType",
            "Yearprice",
            "TotalPrice",
            "BasePrice",
            "WorkPrice",
            "Consumption",
            "SerialNumber",
            "PreviousSupplierHelper",
            "ContractAccountNo"
        ];

        let aValues=[];

        aValues[0]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/ProductId");
        aValues[1]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/ConfigId");
        aValues[2]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/Description");
        aValues[3]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/Division");
        aValues[4]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/InitValidityDuration").toString();
        aValues[5]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/PriceGuaranteeUnit");
        aValues[6]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/IsRecommended");
        if(util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/IsSelected")){
            aValues[7]= "X";
        }else{
            aValues[7]="";
        }
        aValues[8]=unixformatter(util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/PriceGuaranteeDate"));
        aValues[9]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/PriceGuaranteeDuration").toString();
        aValues[10]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/PriceGuaranteeType");
        aValues[11]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/InitValidityUnit");
        aValues[12]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/PriceId");
        aValues[13]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/ProductFamily");
        aValues[14]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/ProductInfo");
        aValues[15]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/TariffType");
        aValues[16]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Product/Yearprice");
        aValues[17]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Prices/results/2/PriceGross");
        aValues[18]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Prices/results/1/PriceGross");
        aValues[19]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/Data/Prices/results/0/PriceGross");
        aValues[20]=util.getProperty("/ProductList/selectedProducts/selectedProduct"+energyType+"/consumption");

        if(energyType == "electric"){
            aValues[21]=util.getProperty("/Parameter/SerialNumber");
            aValues[22]=util.getProperty("/Parameter/PreviousSupplierHelper");
            if(util.getProperty("/Parameter/ContractAccountNo")){
            aValues[23]=util.getProperty("/Parameter/ContractAccountNo");
            }
        }
        if(energyType == "gas"){
            aValues[21]=util.getProperty("/Parameter/SerialNumber2");
            aValues[22]=util.getProperty("/Parameter/PreviousSupplierHelper2");
            if(util.getProperty("/Parameter/ContractAccountNo2")){
                aValues[23]=util.getProperty("/Parameter/ContractAccountNo2");
            }

        }

        if(energyType == "water"){
            aValues[21]=util.getProperty("/Parameter/SerialNumber3");
            aValues[22]=util.getProperty("/Parameter/PreviousSupplierHelper3");
            if(util.getProperty("/Parameter/ContractAccountNo3")){
                aValues[23]=util.getProperty("/Parameter/ContractAccountNo3");
            }

        }


        for(let i=0; aValues.length>i;i++){
    
        let oGenObject = {
            "Objectid": ObjectID,
            "Objectname": "Product",
            "Fieldname": aKey[i],
            "Fieldvalue": aValues[i]
        }
        oSturctur.FunctionParams.push(oGenObject);
    }

    return;

    }

    function unixformatter(sUnixDate){
        let sUnixDateNew = sUnixDate.replace("/Date(","").replace(")/","");
        let sUnixDateNewInt = parseInt(sUnixDateNew);
        var date = new Date(sUnixDateNewInt);
        // Hours part from the timestamp
        var year = date.getFullYear();
        year= year.toString();
        // Minutes part from the timestamp
        var month =  date.getMonth();
        month= month.toString();
        // Seconds part from the timestamp
        var day = date.getDay();
        day= day.toString();

        if(month.length==1){
            month= '0'+month;
        }
        if(day.length==1){
            day= '0'+day;
        }

        var formattedTime = year + month + day;

        return formattedTime;
    }

    function _checkInvalidateBackendProperty(key) {
        let bValid = true;
        let aFeldName = ["BankName", "Valid", "Blz"];
        if (key.indexOf("Helper") !== -1) {
            bValid = false;
        } else if ($.inArray(key, aFeldName) !== -1) {
            bValid = false;
        }
        return bValid;
    }
    return oGenericService;
})