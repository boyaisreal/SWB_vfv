sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "swd/fair/consumerFriendly/model/formatter",
    "swd/fair/consumerFriendly/util/types/Phone",
    "swd/fair/consumerFriendly/util/types/Email",
    "swd/fair/consumerFriendly/util/types/Mobile",
    "swd/fair/consumerFriendly/util/types/BirthDate",
    "swd/fair/consumerFriendly/util/types/ValidFromDate",
    "swd/fair/consumerFriendly/util/types/ValidMaxMinSupplierDate",
    "swd/fair/consumerFriendly/util/types/ValidMaxMinMoveInDate"
], function (Controller, Fragment, formatter) {
    "use strict";

    return Controller.extend("swd.fair.consumerFriendly.controller.BaseController", {
        oControllerHolder: {},
        formatter: formatter,

        // Provides shorter syntax for getting JSON/oData models
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName); // If model not ready in controller, check it in ownerComponent. 
        },

        // Provides shorter syntax for setting new model to the view
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        // Returns router
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Gibt das Resourcebundle zurück. Mit diesem kann auf i18n-Texte zugegriffen werden.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Erstellt ein Fragement und gibt dieses zurück
         * @param {string} sId - Id für das zu erstellende Fragment
         * @param {string} sPath - Pfad zum Fragment
         * @returns {object} Neu erstelltes Fragment
         */
        createFragment: function (sId, sPath) {
            try {
                return sap.ui.xmlfragment(sId, sPath, this);
            } catch (oError) {
                Log.error(oError.message);
            }
        },
        /**
         * Setzt das "route matched" Event an die übergebene Controller-Instanz und bindet die Funktion onHandleRouteMatched an diesen
         * @param {object} oController: Controller-Instanz
         * @param {string} sRoute: Name der Route
         */
        initHandleRouteMatchedFor: function (oController, sRoute) {
            try {
                oController._oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                oController._oRouter.getRoute(sRoute).attachMatched(oController.onHandleRouteMatched, oController);
            } catch (oError) {
                Log.error(oError.message);
            }
        },

        /**
         * Prüft ob ein String im Quellstring vorkommt
         * @param {string} sSource: Quellstring
         * @param {string} sString: Zeichenkette
         * @returns {boolean} Gibt true zurück, wenn sString in sSource vorkommt, andernfalls wird false zurückgegeben
         */
        containsString: function (sSource, sString) {
            if (sSource.indexOf(sString) > -1) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * Prüft auf Gleichheit zwischen zwei JSON-Objekten
         * @param {object} oObject1: JSON-Objekt
         * @param {object} oObject2: JSON-Objekt
         * @returns {boolean} Gibt true zurück, wenn beide Objekte identisch sind, andernfalls wird false zurückgegeben
         */
        isEqual: function (oObject1, oObject2) {
            return JSON.stringify(oObject1) === JSON.stringify(oObject2);
        },

        getDialog: async function (sDialogName, sId) {
            const oDialog = this.byId(sId);
            if (!oDialog) {
                const sFragmentPath = `swd.fair.consumerFriendly.view.fragment.${sDialogName}`;
                const oNewDialog = await Fragment.load({
                    name: sFragmentPath,
                    controller: this,
                    id: this.getView().getId()
                });
                this.getView().addDependent(oNewDialog);
                oNewDialog.setEscapeHandler((oPromise) => oPromise.reject());
                return oNewDialog;
            }
            return oDialog;
        },

        onCancelDialog: function (sDialogName) {
            this.byId(sDialogName).close();
            this.byId(sDialogName).destroy();
            //this.byId(sDialogName) = null;
        },


        /**
         * Setzt die übergebene Controller-Instanz
         * @param {object} oController: Controller-Instanz
         */
        setController: function (sControllerName) {
            this.oControllerHolder[sControllerName] = this;
        },

        /**
         * Gibt die aktive Controller-Instanz zurück
         * @returns {object} Controller-Instanz
         */
        getController: function (sControllerName) {
            return this.oControllerHolder[sControllerName];
        },

        onSuggestionItemSelected: async function (oEvent, sText) {
            if (oEvent.getParameter("selectedItem") === null) return;
            let oSource = oEvent.getSource(),
                sSelectedCity, sSelectedPLZ, sSelectedCityCode, bSkip = false,
                oModel = this.getModel("util");
            if (sText === "PostCode") {
                sSelectedCity = oEvent.getParameter("selectedItem").getAdditionalText();
                sSelectedPLZ = oEvent.getParameter("selectedItem").getText();
                sSelectedCityCode = oEvent.getParameter("selectedItem").getKey();

                let aFilter = [];
                aFilter.push(new sap.ui.model.Filter("PostCode", sap.ui.model.FilterOperator.EQ, sSelectedPLZ));
                let aCityCodes = await this.oMainService.readCityCodes(aFilter);
                if (oSource.getCustomData()[0].getValue() === "/PersonalData/Customer/") {
                    this.getModel("util").setProperty("/CityCustomerVH", aCityCodes.results);
                    if (aCityCodes.results && aCityCodes.results.length === 1) {
                        this.getModel("util").setProperty("/PersonalData/Customer/City", aCityCodes.results[0].CityName);
                        this.getModel("util").setProperty("/PersonalData/Customer/CityCode", aCityCodes.results[0].CityCode);
                        bSkip = true;
                    }
                } else if (oSource.getCustomData()[0].getValue() === "/PaymentStep/AlternativeBillingAddress/") {
                    this.getModel("util").setProperty("/CityABAVH", aCityCodes.results);
                    if (aCityCodes.results && aCityCodes.results.length === 1) {
                        this.getModel("util").setProperty("/PaymentStep/AlternativeBillingAddress/City", aCityCodes.results[0].CityName);
                        this.getModel("util").setProperty("/PaymentStep/AlternativeBillingAddress/CityCode", aCityCodes.results[0].CityCode);
                        bSkip = true;
                    }
                } else if (oSource.getCustomData()[0].getValue() === "/PaymentStep/AlternativeBillingPartner/") {
                    this.getModel("util").setProperty("/CityABPVH", aCityCodes.results);
                    if (aCityCodes.results && aCityCodes.results.length === 1) {
                        this.getModel("util").setProperty("/PaymentStep/AlternativeBillingPartner/City", aCityCodes.results[0].CityName);
                        this.getModel("util").setProperty("/PaymentStep/AlternativeBillingPartner/CityCode", aCityCodes.results[0].CityCode);
                        bSkip = true;
                    }
                }

            } else {
                sSelectedCity = oEvent.getParameter("selectedItem").getText();
                sSelectedPLZ = oEvent.getParameter("selectedItem").getAdditionalText();
                sSelectedCityCode = oEvent.getParameter("selectedItem").getKey();
            }
            if (!bSkip) {
                oModel.setProperty(oSource.getCustomData()[0].getValue() + "PostCode", sSelectedPLZ);
                oModel.setProperty(oSource.getCustomData()[0].getValue() + "City", sSelectedCity);
                oModel.setProperty(oSource.getCustomData()[0].getValue() + "CityCode", sSelectedCityCode);
            }
            oModel.refresh();
            this.onHandleAdressChanged(oSource, oSource.getCustomData()[0].getValue(), true);
        },

        postCodeChanged: function (oEvent, sModelName) {
            let oSource = oEvent.getSource();
            let sValue = oSource.getValue();
            oSource.setValue(sValue);
            if (sValue.length < 2) {
                oSource.destroySuggestionItems();
                this.getModel("util").setProperty("/" + sModelName, []);
                this.getModel("util").refresh();
            }
        },

        onSuggestPostCode: function (oEvent, sModelName) {
            oEvent.getSource().destroySuggestionItems();
            const sValue = oEvent.getParameter("suggestValue");
            const aPostCodes = this.getModel("util").getProperty("/AllPostCodes").filter(function (item) {
                return item.PostCode.substr(0, sValue.length) === sValue;
            });
            this.getModel("util").setProperty("/" + sModelName, aPostCodes);
            this.getModel("util").refresh();
        },

        /**
         * Is fired when the text in the input field  Street has focus.
         * @param {*} oEvent 
         * @param {*} oBinding 
         */
        onReloadStreet: async function (oEvent, oBinding) {
            let aFilter = [];
            aFilter.push(new sap.ui.model.Filter("PostCode", sap.ui.model.FilterOperator.EQ, oBinding.PostCode));
            aFilter.push(new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, oBinding.CityCode));
            try {
                let oData = await this.oMainService.readStreetSet(aFilter);
                this.getModel("util").setProperty("/StreetDataSet", oData.results);
            } catch (oError) {
                console.log(oError.message);
            }
        },

        /**
         * Is fired when the text in the input field  postCode or City has changed and the focus leaves the input field.
         * @param {*} oEvent 
         * @param {*} oBinding 
         */
        onHandleAdressChanged: async function (oEvent, sPath, bSlected) {
            let oSource = bSlected ? oEvent : oEvent.getSource();
            let oProductsInfos = this.getModel("util").getProperty("/ProductsInfos");
            //Erweiterung: Einblenden der Self Service Information, sobald der DeliveryStep erreicht wurde
            if (sPath === "/DeliveryStep/Premise/" && !(oProductsInfos.OnlineProduct === "N" && oProductsInfos.SelfServiceRegistration === "N")) {
                this.getModel("util").setProperty("/ProductInfoViewControl/UserHasReachedDeliveryStep", true);
            }

            let aFilter = [],
                sText;
            let oBinding = this.getModel("util").getProperty(sPath);
            aFilter.push(new sap.ui.model.Filter("PostCode", sap.ui.model.FilterOperator.EQ, oBinding.PostCode));
            aFilter.push(new sap.ui.model.Filter("CityCode", sap.ui.model.FilterOperator.EQ, oBinding.CityCode));
            try {
                let oData = await this.oMainService.readStreetSet(aFilter);
                if (!oBinding.City || !oBinding.PostCode) return;
                else if ((oData.results.length === 0 || oBinding.CityCode === "") && (parseInt(oBinding.PostCode) >= 40210 && parseInt(oBinding.PostCode) <= 40721)) {
                    this.getModel("util").setProperty("/StreetDataSet", oData.results);
                    oSource.setValueState("Error");
                    oSource.setValueStateText("Bitte die Adresse nochmal überprüfen");
                    try {
                        sText = oSource.getParent().getLabel().getText()
                    } catch (oError) {
                        sText = oSource.getParent().getItems()[0].getText();
                    }
                    this.MessagePopover.addMessageToPopover(this.getController("WizardContainer"), oSource, "Error", "Bitte die Adresse nochmal überprüfen", sText);
                } else {
                    this.getModel("util").setProperty("/StreetDataSet", oData.results);
                    if (!this.getOwnerComponent().bSkipFirstStreetClearance && sPath !== "/DeliveryStep/Premise/") {
                        oBinding.Street = "";
                        oBinding.HouseNumber = "";
                    } else {
                        this.getOwnerComponent().bSkipFirstStreetClearance = false;
                    }
                    if (sPath === "/DeliveryStep/Premise/") return;
                    oSource.setValueState("None");
                    this.MessagePopover.removeMessageFromTarget(this.getController("WizardContainer"), oSource);
                }
            } catch (oError) {
                console.log(oError.message);
            }
        }
    });
});