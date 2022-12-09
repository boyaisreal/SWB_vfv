sap.ui.define([
	"swd/fair/consumerFriendly/controller/Abstract/BaseController",
	"swd/fair/consumerFriendly/util/Validator",
	"swd/fair/consumerFriendly/util/MessagePopover",
	"swd/fair/consumerFriendly/service/MainService",
	"swd/fair/consumerFriendly/service/GenericService",
	"swd/fair/consumerFriendly/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (
	BaseController,
	Validator,
	MessagePopover,
	MainService,
	GenericService,
	Formatter,
	Filter,
	FilterOperator,
	MessageToast
) {
	"use strict";

	return BaseController.extend("swd.fair.consumerFriendly.controller.Payment", {
		MessagePopover: MessagePopover,
		Formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smshub.components.deliktverfolgung.view.punishmentPetitionObjectDetail
		 */
		onInit: function () {
			this.oMainService = new MainService(this.getOwnerComponent());
			this.oGenericService = new GenericService(this.getOwnerComponent(), "genDataService");
			this.getView().setModel(this.getModel());
			this.setModel(this.getModel("util"), "util");
			this.setController.call(this, "Payment");
			this.oUtilModel = this.getModel("util");
		},

		/**
		 * @override
		 */
		onAfterRendering: function () {
			this.oValidator = new Validator(this.getController("WizardContainer"));
		},

		onNaveToPaymentStep: function () {
			let oWizardController = this.getController("WzardContainer");
		},

		onFocusInIbanValidate: function (oEvent) {
			let oObject = this.oUtilModel.getProperty("/PaymentStep/Bank");
			oObject.OKHelper = false;
			this.oUtilModel.setProperty("/PaymentStep/Bank", [oObject]);
		},

		/*
		 * Check if all fields are filled, check if given Iban is valid, save new bank account
		 */
		onChangeInAltRecipientIbanValidate: async function (oEvent) {
			let oSource = oEvent.getSource();
			var oBankData = this.oUtilModel.getProperty("/PaymentStep/AlternativeBillingPartner");
			try {
				if (!oBankData.Iban) return;
				let oData = await this.oMainService.readIbanValidation(oBankData.Iban.replace(/ /g, ""));
				if (oData.Valid) {
					let oObj = Object.assign(oBankData, oData);
					oObj.OKHelper = true;
					this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", oObj);
					delete oObj.__metadata;
					delete oObj.Bic;
					oSource.setValueState("None");
					return;
				} else {
					oSource.setValueState("Error");
					oSource.setValueStateText("Die eingegebene IBAN ist ungültig.");
					let oObj = Object.assign(oBankData, oData);
					oObj.OKHelper = false;
					this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", oObj);
				}
			} catch (oError) {
				oSource.setValueState("Error");
				MessageToast.show("Fehler beim Anfordern von /IbanValidationSet, " + oError.message);
			}

		},

		/*
		 * Check if all fields are filled, check if given Iban is valid, save new bank account
		 */
		onChangeInIbanValidate: async function (oEvent) {
			let oSource = oEvent.getSource();
			var oBankData = this.oUtilModel.getProperty("/PaymentStep/Bank");
			try {
				if (!oBankData.Iban) return;
				let oData = await this.oMainService.readIbanValidation(oBankData.Iban.replace(/ /g, ""));
				if (oData.Valid) {
					let oObj = Object.assign(oBankData, oData);
					oObj.OKHelper = true;
					this.oUtilModel.setProperty("/PaymentStep/Bank", oObj);
					delete oObj.__metadata;
					delete oObj.Bic;
					oSource.setValueState("None");
					this.MessagePopover.removeMessageFromTarget(this.getController("WizardContainer"), oSource);
					return;
				} else {
					oSource.setValueState("Error");
					oSource.setValueStateText("Die eingegebene IBAN ist ungültig.");
					this.MessagePopover.addMessageToPopover(this.getController("WizardContainer"), oSource, "Error", "Die eingegebene IBAN ist ungültig.", "IBAN");
					let oObj = Object.assign(oBankData, oData);
					oObj.OKHelper = false;
					this.oUtilModel.setProperty("/PaymentStep/Bank", oObj);
				}
			} catch (oError) {
				oSource.setValueState("Error");
				MessageToast.show("Fehler beim Anfordern von /IbanValidationSet, " + oError.message);
			}

		},

		/**
		 * Called to switch  Bank details view to read mode 
		 */
		onIbanReadMode: function () {
			var oBankData = this.oUtilModel.getProperty("/PaymentStep/Bank");
			if (oBankData.Iban && oBankData.AccountOwner && oBankData.IbanValidFrom && oBankData.Valid) {
				let oObject = this.oUtilModel.getProperty("/PaymentStep/Bank");
				oObject.addedHelper = true;
				this.oUtilModel.setProperty("/PaymentStep/Bank", oObject);
			} else {
				MessageToast.show("Bitte füllen Sie alle Felder aus!");
			}
		},

		/**
		 * Called to switch  Bank details view to edit mode 
		 */
		onIbanEditMode: function () {
			let oObject = this.oUtilModel.getProperty("/PaymentStep/Bank");
			oObject.addedHelper = false;
			this.oUtilModel.setProperty("/PaymentStep/Bank", oObject);
		},

		/**
		 * Called to add new deviating address
		 * @param {*} oEvent 
		 */
		onDeviatingAddress: function (oEvent) {
			if (oEvent.getSource().getIcon().includes("add")) {
				this.oUtilModel.setProperty("/PaymentStep/deviatingAdressForm", true);
				this.oUtilModel.setProperty("/PaymentStep/deviatingAdressActivated", true);
				this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
			} else {
				try {
					this.getView().byId("alterBillRecipient").setValue("");
				} catch (oError) {
					console.log(oError);
				}
				this.oUtilModel.setProperty("/PaymentStep/deviatingAdressActivated", false);
				this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
				this.oUtilModel.setProperty("/PaymentStep/deviatingAdressForm", false);
				this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingAddress", {});
				this.oValidator.clearValueState(this.getView().byId("CreateDeviatingRecipienBox"));
			}
		},


		/**
		 * Called to open dialog "DialogAddAddress" to create a new BusinessPartner
		 * @param {*} oEvent
		 */
		openNewBPDialog: async function (oEvent) {
			let oDialog = await this.getDialog("DialogAddNewBpForRecipient", "dialogAddNewBpForRecipient");
			oDialog.open();
		},

		/**
		 * Öffnet den Dialog zum Erstellen eines neuen Rechnungsempfängers
		 * 
		 * @listens press
		 * @async
		 */
		onOpenNewRecipientDialog: async function (oEvent) {
			if(this.bOldBillingPartnerSelected) this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
			this.getOwnerComponent().bSkipFirstStreetClearance = true;
			let sType = this.oUtilModel.getProperty("/PaymentStep/AlternativeBillingPartner/Type");
			!sType ? this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/Type", "1"): this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/Type", sType);
			this.oNewAltRecipientDialog = await this.getDialog("AddNewRecipientDialog", "createBPDialog");
			this.oNewAltRecipientDialog.open();
		},

		onConfirmAltRecipientChanges: function () {
			const oAlternativePartner = this.oUtilModel.getProperty("/PaymentStep/AlternativeBillingPartner");
			let sTargetHelpString = "";
			let sValueState = this.getView().byId("MaskInputIbanDialog").getValueState();
			if(sValueState === "Error"){
				MessageToast.show("Die eingegebene IBAN ist ungültig.");
				return;
			} 
			let bAddress = this.byId("ABPPostCode").getValueState() === "Error" || this.byId("ABPCity").getValueState() === "Error" || this.byId("ABPStreet").getValueState() === "Error" ? false : true;
			if(!bAddress){
				MessageToast.show("Bitte die Adresse nochmal überprüfen.");
				return;
			}
			let bvalidated = this.oValidator.validate(this.byId("createBPDialog"), this);
			if (bvalidated) {
				if (oAlternativePartner.Type === "1") {
					sTargetHelpString = [oAlternativePartner.FirstName, oAlternativePartner.LastName].join(" ") + ", " + [oAlternativePartner.PostCode, oAlternativePartner.City, oAlternativePartner.Street, oAlternativePartner.HouseNumber].join(", ");
				} else {
					sTargetHelpString = [oAlternativePartner.NameOrg1, oAlternativePartner.NameOrg2].join(" ") + ", " + [oAlternativePartner.PostCode, oAlternativePartner.City, oAlternativePartner.Street, oAlternativePartner.HouseNumber].join(", ");
				}
				this.getView().byId("alterBillRecipient").setValue(sTargetHelpString);
				this.onCloseNewRecipientDialog("Confirm");
			}else{
				MessageToast.show("Bitte überprüfen Sie die Pflichtfelder!")
			}
		},

		onCloseNewRecipientDialog: function (sKey) {
			try {
				if(sKey !== "Confirm"){
					this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
					this.getView().byId("alterBillRecipient").setValue("");
				}
				this.oNewAltRecipientDialog.close();
				this.oNewAltRecipientDialog.destroy();
				this.oNewAltRecipientDialog = null
			} catch (oError) {}
		},

		onDeleteNewRecipient: function () {
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
			this.getView().byId("alterBillRecipient").setValue("");
			this.bOldBillingPartnerSelected = false;

		},

		onPersonBPSelected: function () {
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/TitleKey", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/FirstName", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/LastName", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/TitleAca1Key", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/BirthDate", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/PostCode", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/City", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/CityCode", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/Street", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/HouseNumber", "");
			this.getView().byId("alterBillRecipient").setValue("");
		},

		onCompanyBPSelected: function () {
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/NameOrg1", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/NameOrg2", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/ContactPersonFirstName", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/ContactPersonLastName", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/CompanyRegistrationNo", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/PostCode", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/City", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/CityCode", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/Street", "");
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner/HouseNumber", "");
			this.getView().byId("alterBillRecipient").setValue("");
		},

		/*
		 * Collect and form filters from dialog, fire filtering
		 */
		onFilterBarSearch: function (oEvent) {
			var aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}
				return aResult;
			}, []);
			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		/*
		 * Fire filtering in dialog's table
		 */
		_filterTable: function (oFilter) {
			var oValueHelpDialog = this.getView().byId("ValueHelpSearchBp");
			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}
				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}
				oValueHelpDialog.update();
			});
		},

		/**
		 * This event listner is fired when the user selects an item .
		 * @param {*} oEvent 
		 */
		onValueHelpOkPress: function (oEvent) {
			var oItem = oEvent.getParameter("tokens")[0].getCustomData()[0].getProperty("value");
			var sTargetHelpString = [oItem.McName1, oItem.McName2].join(" ") + ", " + [oItem.PostCode1, oItem.McCity1, oItem.McStreet, oItem.HouseNum1]
				.join(", ");
			this.getView().byId("alterBillRecipient").setValue(sTargetHelpString);
			this.onCancelDialog("ValueHelpSearchBp");
			delete oItem.__metadata;
			let oObjectData = this.oMainService.mapAlternativeBillingPartner(oItem);
			this.bOldBillingPartnerSelected = true;
			this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", oObjectData);
			this.oUtilModel.setProperty("/PaymentStep/deviatingReceiverActivated", true);
		},

		onAlterInputChange: function (oEvent) {
			let oSource = oEvent.getSource();
			if (oSource.getValue() === "") {
				this.oUtilModel.setProperty("/PaymentStep/deviatingReceiverActivated", false);
				this.oUtilModel.setProperty("/PaymentStep/AlternativeBillingPartner", {});
			}
		},

		/**
		 * Fires when selection is changed by user interaction (RadioButtonGroup).
		 * @param {*} oEvent 
		 */
		onSelectPaymentBySEPA: function (oEvent) {
			let oSource = oEvent.getSource();
			let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			if (oSource.getSelectedIndex() === 0) {
				this.oUtilModel.setProperty("/PaymentStep/Payment/PaymentBySEPA", true);
				this.oUtilModel.setProperty("/PaymentStep/Bank/IbanValidFrom", oDateFormat.format(new Date()));
			} else {
				this.oUtilModel.setProperty("/PaymentStep/Payment/PaymentBySEPA", false);
				this.oUtilModel.setProperty("/PaymentStep/Bank", {});
				this.oUtilModel.setProperty("/PaymentStep/Bank/OKHelper", false);
				this.oUtilModel.setProperty("/PaymentStep/Bank/addedHelper", false);
			}
		},

		/**
		 * opnes the Valuehelp dialog
		 * @param {*} oEvent 
		 */
		onValueHelpBpSearchRequested: function (oEvent) {
			this.oMainService.onValueHelpBpSearchRequested.call(this, oEvent);

		},

		/**
		 * Is fired when the text in the input field  Street has changed and the focus leaves the input field.
		 * @param {*} oEvent 
		 * @param {*} oBinding 
		 */
		onHandleStreetChanged: function (oEvent, oBinding) {
			this.oGenericService.onHandleStreetChanged.call(this, oEvent, oBinding);
		}
	});
});