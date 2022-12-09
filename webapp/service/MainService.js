sap.ui.define([
    "swd/fair/consumerFriendly/service/BackendCommunicationService"
], function (BackendCommunicationService) {
    "use strict";

    const oMainService = function (oComponent) {
        this.oComponent = oComponent;
        this.oMainModel = oComponent.getModel();
        this.oBackendCommunicationService = new BackendCommunicationService(this.oMainModel);
    };
    
    oMainService.prototype.readIbanValidation = async function (sKey) {
       return this.oBackendCommunicationService.getReadEntityPromise(`/IbanValidationSet('${sKey}')`)
    }

     oMainService.prototype.readBusinessPartner = function (sPartner) {
        return this.oBackendCommunicationService.getReadEntityPromise(`/BupaaSet('${sPartner}')`);
    };
    oMainService.prototype.readStreetSet= function (aFilter, sParam) {
        return this.oBackendCommunicationService.getReadEntitySetPromise(`/StreetSet`, aFilter, sParam);
    };

    oMainService.prototype.readPostalCodes = async function(aFilter) {
        return this.oBackendCommunicationService.getReadEntitySetPromise("/PostalCodeSet", aFilter);
    };
    
    oMainService.prototype.readCityCodes = async function(aFilter) {
        return this.oBackendCommunicationService.getReadEntitySetPromise("/CitySet", aFilter);
    };

    oMainService.prototype.onValueHelpBpSearchRequested = async function (oEvent) {
        var oColModel = new sap.ui.model.json.JSONModel({
            cols: [{
                label: "GeschäftsPartnerNr",
                template: "Partner"
            }, {
                label: "Nachname",
                template: "McName1"
            }, {
                label: "Vorname",
                template: "McName2"
            }, {
                label: "Postleitzahl",
                template: "PostCode1"
            }, {
                label: "Ort",
                template: "McCity1"
            }, {
                label: "Straße",
                template: "McStreet"
            }, {
                label: "Hausnummer",
                template: "HouseNum1"
            }]
        });
        let oDialog = await this.getDialog("ValueHelpSearchBp", "ValueHelpSearchBp");
        oDialog.getTableAsync().then(function (oTable) {
            oTable.setModel(oColModel, "columns");
            var aCols = oColModel.getData().cols;
            if (oTable.bindRows) {
                oTable.bindAggregation("rows", "/BupaaSet");
            }
            if (oTable.bindItems) {
                oTable.bindAggregation("items", "/BupaaSet", function () {
                    return new sap.m.ColumnListItem({
                        cells: aCols.map(function (column) {
                            return new sap.m.Label({
                                text: "{" + column.template + "}"
                            });
                        })
                    });
                });
            }
            oDialog.update();
        }.bind(this));
        oDialog.addStyleClass("sapUiSizeCompact");
        oDialog.open()
    };

    oMainService.prototype.mapAlternativeBillingPartner = function (object) {
        return {
            PartnerID: object.Partner,
            FirstName: object.McName2,
            LastName: object.McName1,
            HouseNumber: object.HouseNum1,
            PostCode: object.PostCode1,
            City: object.McCity1,
            Street: object.McStreet,
        };
    }

    return oMainService;
})