sap.ui.define([
    "swd/fair/consumerFriendly/controller/Abstract/BaseController",
    "swd/fair/consumerFriendly/service/GenericService",
    "swd/fair/consumerFriendly/service/MainService",
    "sap/ui/core/ValueState"
], function (
    BaseController,
    GenericService,
    MainService,
    ValueState
) {
    "use strict";

    return BaseController.extend("swd.fair.consumerFriendly.controller.App", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf smshub.components.deliktverfolgung.view.punishmentPetitionObjectDetail
         */
        onInit: function () {
            this.setController.call(this, "App");
            sap.ui.getCore().getConfiguration().setLanguage("de-De");
            this.oGenericService = new GenericService(this.getOwnerComponent(), "genDataService");
            this.oSupplierService = new GenericService(this.getOwnerComponent(), "nguDisplayService");
            this.oMainService = new MainService(this.getOwnerComponent());
            sap.ui.getCore().attachValidationError(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.Error);
            }.bind(this));
            sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                oEvent.getParameter("element").setValueState(ValueState.None);
            });
        },

        /**
         * @override
         */
        onAfterRendering: async function () {
            await this.getModel("util").dataLoaded();
            var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            var oData = JSON.parse(oStorage.get("sendData"));
            // Testdata
            /*oData=
            {
                "selectedProducts":{
                    "selectedProductelectric": {
                        "consumption":"2500",
                        "Data": {
                            "ConfigId": "CONF3",
                            "Product": {
                                "ConfigId": "CONF2",
                                "IsRecommended": "",
                                "ProductId": "PROD2",
                                "PriceId": "PRICE2",
                                "Description": "Basis",
                                "TariffType": "TARIFF1",
                                "ProductFamily": "Product Family 2",
                                "PriceGuaranteeType": "DAT",
                                "PriceGuaranteeDate": "\/Date(1655078400000)\/",
                                "PriceGuaranteeDuration": 0,
                                "PriceGuaranteeUnit": "",
                                "InitValidityDuration": 12,
                                "InitValidityUnit": "Monate",
                                "ProductInfo": "Kundigungsfrist: 2 Woche",
                                "Division": "20",
                                "IsSelected": "",
                                "Yearprice": ""
                            },
                            "Prices": {
                                "results": [
                                    {
                                        "ConfigId": "CONF2",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE4",
                                        "TimeType": "",
                                        "PriceComponent": "WORK_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "0.28850000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "0.26990000",
                                        "PriceLevel": 1,
                                        "Currency": "EUR"
                                    },
                                    {
                                        "ConfigId": "CONF2",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE2",
                                        "TimeType": "",
                                        "PriceComponent": "BASE_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "11.50000000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "10.50000000",
                                        "PriceLevel": 2,
                                        "Currency": "EUR"
                                    },
                                    {
                                        "ConfigId": "CONF2",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE3",
                                        "TimeType": "",
                                        "PriceComponent": "TOTAL_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "55.00000000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "50.00000000",
                                        "PriceLevel": 3,
                                        "Currency": "EUR"
                                    }
                                ]
                            },
                            "Options": {
                                "results": [
                                    {
                                        "ConfigId": "CONF2",
                                        "Amount": "0.00000000",
                                        "OptionId": "OPTION2",
                                        "Currency": "",
                                        "OptionType": "",
                                        "OptionText": ""
                                    }
                                ]
                            }
                        }
                    },
                    "selectedProductgas": {
                        "consumption":"7000",
                        "Data": {
                            "ConfigId": "CONF4",
                            "Product": {
                                "ConfigId": "CONF4",
                                "IsRecommended": "",
                                "ProductId": "PROD4",
                                "PriceId": "PRICE4",
                                "Description": "Super-Premium",
                                "TariffType": "TARIFF3",
                                "ProductFamily": "Product Family 4",
                                "PriceGuaranteeType": "DUR",
                                "PriceGuaranteeDate": "\/Date(1655078400000)\/",
                                "PriceGuaranteeDuration": 0,
                                "PriceGuaranteeUnit": "",
                                "InitValidityDuration": 14,
                                "InitValidityUnit": "Monate",
                                "ProductInfo": "Testprodukt mit jährlichem Grundpreis!",
                                "Division": "20",
                                "IsSelected": "",
                                "Yearprice": "X"
                            },
                            "Prices": {
                                "results": [
                                    {
                                        "ConfigId": "CONF4",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE4",
                                        "TimeType": "",
                                        "PriceComponent": "WORK_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "0.32850000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "0.29990000",
                                        "PriceLevel": 1,
                                        "Currency": "EUR"
                                    },
                                    {
                                        "ConfigId": "CONF4",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE3",
                                        "TimeType": "",
                                        "PriceComponent": "BASE_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "15.50000000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "13.50000000",
                                        "PriceLevel": 2,
                                        "Currency": "EUR"
                                    },
                                    {
                                        "ConfigId": "CONF4",
                                        "TimeBasis": "",
                                        "PriceId": "PRICE5",
                                        "TimeType": "",
                                        "PriceComponent": "TOTAL_PRICE",
                                        "ConsumptionFrom": "",
                                        "PriceGross": "65.00000000",
                                        "ConsumptionTo": "",
                                        "PriceNet": "60.00000000",
                                        "PriceLevel": 3,
                                        "Currency": "EUR"
                                    }
                                ]
                            },
                            "Options": {
                                "results": [
                                    {
                                        "ConfigId": "CONF4",
                                        "Amount": "0.00000000",
                                        "OptionId": "OPTION4",
                                        "Currency": "",
                                        "OptionType": "",
                                        "OptionText": "IPad Air + Zuzahlung * 60 € Neukundenbonus"
                                    }
                                ]
                            }
                        }
                    },
                    "selectedProductservice": {},
                    "selectedProductwater": {}
                },
                "selectedAdress":{
                    "City": "Karlsruhe",
                    "CustomerType": "PK",
                    "HouseNumber": "308",
                    "PostCode": "76133",
                    "Street": "Ludwig-Erhard-Allee."
                },
                "bp":{
                    "bpId": "1000004121"
                },
                "counter":{
                    "ElectricInstallation" : "17089484930",
                    "GasInstallation" : "",
                    "WaterInstallation" :""

                }
            }*/

            oStorage.clear();
            this.getView().getModel("util").setProperty("/ProductList", oData);
            if (oData) {
                await this.getOwnerComponent().bPostalCodesLoaded;
                this.getOwnerComponent().bSkipFirstStreetClearance
                this.getView().getModel("util").setProperty("/PersonalData/Customer/PostCode", oData.selectedAdress.PostCode);
                this.getView().getModel("util").setProperty("/PersonalData/Customer/City", oData.selectedAdress.City);
                this.getView().getModel("util").setProperty("/PersonalData/Customer/Street", oData.selectedAdress.Street);
                this.getView().getModel("util").setProperty("/PersonalData/Customer/HouseNumber", oData.selectedAdress.HouseNumber);
                this.getView().getModel("util").setProperty("/DeliveryStep/Premise/PostCode", oData.selectedAdress.PostCode);
                this.getView().getModel("util").setProperty("/DeliveryStep/Premise/City", oData.selectedAdress.City);
                this.getView().getModel("util").setProperty("/DeliveryStep/Premise/Street", oData.selectedAdress.Street);
                this.getView().getModel("util").setProperty("/DeliveryStep/Premise/HouseNumber", oData.selectedAdress.HouseNumber);
                this.getView().getModel("util").setProperty("/DeliveryStep/Premise/PremiseID", oData.selectedAdress.PremiseID);
                this.getView().getModel("util").setProperty("/PersonalData/Customer/Type", oData.selectedAdress.CustomerType === "PK" ? "1" : "2");
                this.getView().getModel("util").setProperty("/Parameter/SerialNumber", oData.counter.ElectricInstallation);
                this.getView().getModel("util").setProperty("/Parameter/SerialNumber2", oData.counter.GasInstallation);
                this.getView().getModel("util").setProperty("/Parameter/SerialNumber3", oData.counter.WaterInstallation);
                ("IDs" in oData.oldContract) && this.getView().getModel("util").setProperty("/Parameter/OldContracts", oData.oldContract.IDs);

                //data if BP is given
                if (this.getView().getModel("util").getProperty("/ProductList/bp/bpId")) {
                    let oStructur = this.getModel("util").getProperty("/GenericStructur");
                    oStructur.Functionname = "PSL004_GetPartner";
                    oStructur.FunctionParams = [];
                    oStructur.FunctionParams.push({
                        "Fieldname": "PartnerID",
                        "Fieldvalue": this.getView().getModel("util").getProperty("/ProductList/bp/bpId")
                    });
                    let oBpData = await this.oGenericService.getGenericData(oStructur);
                    if (oBpData.length > 0) {
                        this.getModel("util").setProperty("/existClient", true);
                        oBpData[0].BirthDate = oBpData[0].BirthDate === "00000000" ? "" : oBpData[0].BirthDate;
                        oBpData[0].CityCode = oBpData[0].CityCode.replace(/^(0+)/g, '');
                    }
                    this.getModel("util").setProperty("/PersonalData/Customer", oBpData[0]);
                    this.getOwnerComponent().resolveBPType(oBpData[0].Type);
                } else {
                    this.getOwnerComponent().resolveBPType("1");
                }

                let electricCost = 0;
                let gasCost = 0;
                let waterCost = 0;
                let oSuppliers = await this.oSupplierService.readServicesuppliers([]);
                let oTypes = await this.oSupplierService.readServiceType([]);
                if (this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductelectric/Data")) {
                    electricCost = parseFloat(this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductelectric/Data/Prices/totalMonthPrice"));
                    let sDivision = this.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductelectric/Data").Product.Division;
                    let sServiceType = oTypes.results.filter(obj => obj.CustKey.match("DIV_ELECTRICITY_SERVTYPE"))[0].CustValue;
                    let oSupplierElec = oSuppliers.results.filter(obj => obj.DivisionID === sDivision && obj.ServiceTypeID === sServiceType);
                    this.getModel("util").setProperty("/SupplierDataElec", oSupplierElec);
                }
                if (this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductgas/Data")) {
                    gasCost = parseFloat(this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductgas/Data/Prices/totalMonthPrice"));
                    let sDivision = this.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductgas/Data").Product.Division;
                    let sServiceType = oTypes.results.filter(obj => obj.CustKey.match("DIV_GAS_SERVTYPE"))[0].CustValue;
                    let oSupplierGas = oSuppliers.results.filter(obj => obj.DivisionID === sDivision && obj.ServiceTypeID === sServiceType);
                    this.getModel("util").setProperty("/SupplierDataGas", oSupplierGas);
                }
                if (this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductwater/Data")) {
                    waterCost = parseFloat(this.getView().getModel("util").getProperty("/ProductList/selectedProducts/selectedProductwater/Data/Prices/totalMonthPrice"));
                    let sDivision = this.getModel("util").getProperty("/ProductList/selectedProducts/selectedProductwater/Data").Product.Division;
                    let sServiceType = oTypes.results.filter(obj => obj.CustKey.match("DIV_WATER_SERVTYPE"))[0].CustValue;
                    let oSupplierWater = oSuppliers.results.filter(obj => obj.DivisionID === sDivision && obj.ServiceTypeID === sServiceType);
                    this.getModel("util").setProperty("/SupplierDataWater", oSupplierWater);
                }
                let totalPriceOfAllProducts = electricCost + gasCost + waterCost;
                this.getView().getModel("util").setProperty("/ProductList/totalPrice", totalPriceOfAllProducts.toFixed(2));
            }
            this.getModel("util").setProperty("/busyState", false);
        }

    });
});