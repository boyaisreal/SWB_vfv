sap.ui.define([
	"swd/fair/consumerFriendly/util/Validator",
	"swd/fair/consumerFriendly/model/formatter",
	"swd/fair/consumerFriendly/controller/Abstract/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"swd/fair/consumerFriendly/service/MainService",
	"swd/fair/consumerFriendly/service/GenericService",
	"swd/fair/consumerFriendly/util/MessagePopover",
	"sap/m/MessageToast",
	"sap/m/Token",
], function (
	Validator,
	Formatter,
	BaseController,
	Filter,
	FilterOperator,
	MessageBox,
	MainService,
	GenericService,
	MessagePopover,
	MessageToast,
	Token,
) {
	"use strict";

	return BaseController.extend("swd.fair.consumerFriendly.controller.WizardContainer", {
		MessagePopover: MessagePopover,
		formatter: Formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smshub.components.deliktverfolgung.view.punishmentPetitionObjectDetail
		 */
		onInit: function () {
			this.oValidator = new Validator(this);
			this.oMainService = new MainService(this.getOwnerComponent());
			this.oGenericService = new GenericService(this.getOwnerComponent(), "genDataService");
			this._oWizard = this.getView().byId("SWDWizard");
			this.setController.call(this, "WizardContainer");
			MessagePopover.createAndRegisterMessagePopover(this, this.byId("SWDWizard"));
			this.getModel("util").setProperty("/PaymentStep/Bank/MinDateHelper", new Date());
			this.getView().setModel(this.getModel());
			this.byId("SWDWizard").addEventDelegate({
				onAfterRendering: function () {
					for (var i = 0; i <= 6; i++) {
						this.nextStep();
					}
					this.goToStep(this.getSteps()[0]);
				}
			}, this.byId("SWDWizard"));

			// validator for action code input
			var fnValidator = function (args) {
				var text = args.text;

				return new Token({
					key: text,
					text: text
				});
			};

			this.getView().byId("ActionCodeInput").addValidator(fnValidator);
		},

		/**
		 * @override
		 */
		onAfterRendering: async function () {
			await this.getModel("util").dataLoaded()
			this.getModel("util").setProperty("/Wizard/Validated", true);
		},

		onSegmentActionType: function (oEvent) {
			const sKey = oEvent.getSource().getSelectedKey();
			if (sKey === "Z1") {
				this.getModel("util").setProperty("/Parameter/ReferenceCustomerID", "");
				this.getModel("util").setProperty("/Parameter/ReferenceCustomerFullName", "");
				this.getModel("util").setProperty("/Parameter/ActionCodeID", "");
				this.byId("BpInputValueHelp").setValue("");
			} else if (sKey === "Z2") {
				this.getModel("util").setProperty("/Parameter/ActionCodeTextHelper", "");
				this.getModel("util").setProperty("/Parameter/ReferenceCustomerID", "");
				this.getModel("util").setProperty("/Parameter/ReferenceCustomerFullName", "");
				this.byId("BpInputValueHelp").setValue("");
			} else if (sKey === "Z3") {
				this.getModel("util").setProperty("/Parameter/ActionCodeTextHelper", "Kunden werben Kunden");
				this.getModel("util").setProperty("/Parameter/ActionCodeID", "");
			}
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
			this._filterTable.call(this, new Filter({
				filters: aFilters,
				and: true
			}));
		},

		/*
		 * Fire filtering in dialog's table
		 */
		_filterTable: function (oFilter) {
			this.getView().byId("ValueHelpSearchBp").getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}
				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}
				this.getView().byId("ValueHelpSearchBp").update();
			}.bind(this));
		},

		/*
		 * Save BP's data from dialog to tempModel, join BP's data in suitable input value
		 */
		onValueHelpOkPress: function (oEvent) {
			let oToken = oEvent.getParameter("tokens")[0],
				oOBject = oToken.getCustomData()[0].getValue();
			this.getModel("util").setProperty("/Parameter/ReferenceCustomerID", oToken.getKey());
			this.getModel("util").setProperty("/Parameter/ReferenceCustomerFullName", oOBject.McName2 + " " + oOBject.McName1);
			this.getView().byId("BpInputValueHelp").setValue(oOBject.McName2 + " " + oOBject.McName1 + " | " + oToken.getKey());
			this.getModel("util").setProperty("/Parameter/KWKTextHelper", oOBject.McName2 + " " + oOBject.McName1 + " | " + oToken.getKey());
			this.onCancelDialog("ValueHelpSearchBp");
		},


		onPressItem: function (sString) {
			this.getView().byId("productInformation" + sString).setVisible(true);
			switch (sString) {
				case "Electric":
					this.getView().byId("productInformationGas").setVisible(false);
					this.getView().byId("productInformationWater").setVisible(false);
					this.getView().byId("productInformationService").setVisible(false);

					break;
				case "Gas":
					this.getView().byId("productInformationElectric").setVisible(false);
					this.getView().byId("productInformationWater").setVisible(false);
					this.getView().byId("productInformationService").setVisible(false);
					break;
				case "Water":
					this.getView().byId("productInformationGas").setVisible(false);
					this.getView().byId("productInformationElectric").setVisible(false);
					this.getView().byId("productInformationService").setVisible(false);
					break;
				case "Service":
					this.getView().byId("productInformationGas").setVisible(false);
					this.getView().byId("productInformationElectric").setVisible(false);
					this.getView().byId("productInformationWater").setVisible(false);
			}

			//this.getView().byId("productInformationElectric").slideDown( 5000, function() {
			// Animation complete.
			// });
		},

		/**
		 * 
		 * @param {*} oEvent 
		 */
		onBankSegmentBtnChanged: function (oEvent) {
			if (this._oWizard.getCurrentStep().includes("paymentStep")) {
				this._oWizard.validateStep(this.getView().byId("paymentStep"));
				this._oWizard.nextStep(this.getView().byId("legalStep"));
			}
		},

		handleWizardCancel: function () {
			this._handleMessageBoxOpen("Möchten Sie wirklich abbrechen und zum Tarifrechner zurückkehren? Die Daten gehen verloren.");
		},

		_handleMessageBoxOpen: function (sMessage) {
			let dialog = new sap.m.Dialog("dialog", {
				title: "Bestellung abbrechen​",
				icon: "sap-icon://sys-cancel-2",
				type: 'Message',
				content: [
					new sap.m.Text({
						text: sMessage
					}),
				],
				buttons: [
					new sap.m.Button({
						text: 'Zurück zur Bestellung​',
						type: "Ghost",
						press: function () {
							dialog.close();
							dialog.destroy();
						}
					}),
					new sap.m.Button({
						text: 'Bestellung abbrechen​',
						type: "Ghost",
						press: function () {
							dialog.close();
							dialog.destroy();
							window.open(window.location.href, '_self');
						}
					})
				],
			});
			dialog.open();
		},
		discardProgress: function () {
			var oModel = this.getView().getModel("util");
			this._oWizard.discardProgress(this.byId("CensentStep"));
			var clearContent = function (aContent) {
				for (var i = 0; i < aContent.length; i++) {
					if (aContent[i].setValue) {
						aContent[i].setValue("");
					}

					if (aContent[i].getContent) {
						clearContent(aContent[i].getContent());
					}
				}
			};

			oModel.setProperty("/productWeightState", ValueState.Error);
			oModel.setProperty("/productNameState", ValueState.Error);
			clearContent(this._oWizard.getSteps());
		},

		handleWizardCompleted: async function () {
			let IdsArray = ["CustomerPostCode", "CustomerCity", "CustomerStreet", "PremiseStreet", "ActionCodeInput", "ABAddressPostCode", "ABAddressCity", "ABAddressStreet", "BankMaskInput"];
			let oController;
			let bAdressValidation = true;
			this.getMarketingPermissionContatcData();
			IdsArray.forEach(function (item) {
				if (item.includes("Customer")) {
					oController = this.getController("CreateBp");
				} else if (item.includes("ABAddress") || item.includes("Bank")) {
					oController = this.getController("Payment");
				} else {
					oController = this;
				}
				if (oController.byId(item).getValueState() === "Error") {
					bAdressValidation = false;
				}
			}.bind(this));
			if (!bAdressValidation) {
				MessageToast.show("Bitte überprüfen Sie die Pflichtfelder!");
				return;
			}
			this.getModel("util").setProperty("/busyState", true);
			let bvalidated = this.oValidator.validate(this.byId("SWDWizard"), this);
			if (bvalidated) {
				try {
					let aRequestObjects = ["Customer", "FurtherContractPartner", "Incentive", "Parameter", "Premise", "Bank", "AlternativeBillingAddress", "AlternativeBillingPartner"];
					let sDate = this.getModel("util").getProperty("/PaymentStep/Bank/IbanValidFrom");
					if (!!sDate) {
						let dateArray = sDate.split(".");
						this.getModel("util").setProperty("/PaymentStep/Bank/IbanValidFrom", dateArray[2] + dateArray[1] + dateArray[0]);
					}
					let oData = this.getModel("util").getData();
					let oResponse = await this.oGenericService.sendGenericData(oData, aRequestObjects);
					let dialog = new sap.m.Dialog({
						title: "Bestellung abgeschlossen​",
						icon: "sap-icon://sys-enter-2",
						type: 'Message',
						content: [
							new sap.m.Text({
								text: "Zurück zur Kundenübersicht."
							}),
						],
						buttons: [
							new sap.m.Button({
								text: 'Schließen',
								type: "Ghost",
								press: function () {
									dialog.close();
									dialog.destroy();
									window.open(window.location.href, '_self');
								}
							})
						],
					});
					this.getModel("util").setProperty("/busyState", false);
					dialog.setEscapeHandler((oPromise) => oPromise.reject());
					dialog.open();
				} catch (error) {
					this.getModel("util").setProperty("/busyState", false);
					MessageToast.show(error.message);
				}
			} else {
				this.getModel("util").setProperty("/busyState", false);
				MessageToast.show("Bitte überprüfen Sie die Pflichtfelder!")
			}
		},

		_validatedRBtnAndCBox: function () {

		},
		onSelectContractCancelRbn: function (oEvent) {
			let oData = oEvent.getSource().getSelectedButton().getCustomData()[0];
			if (oData.getValue() === "ContractCancelByCustomer") {
				let oMessages = this._MessageManager.getMessageModel().getData();
				oMessages.forEach(function (oMessage) {
					if (oMessage.message.match("3 Wochen")) {
						this._MessageManager.removeMessages(oMessage);
					}
				}.bind(this));
				this.getModel("util").setProperty(`/Parameter/${oData.getValue()}`, true);
				this.getModel("util").setProperty("/Parameter/ContractCancelBySWD", false);
				this.getView().byId("rbgDesiredDeliveryBG").setSelectedIndex(1);
				this.getView().byId("rbgDesiredDeliveryBG").fireSelect({selectedIndex: 1});
				this.getModel("util").setProperty("/bCancelbySWD", false);
			} else {
				this.getModel("util").setProperty(`/Parameter/${oData.getValue()}`, true);
				this.getModel("util").setProperty("/Parameter/ContractCancelByCustomer", false);
				this.getModel("util").setProperty("/bCancelbySWD", true);
				this.byId("SCMoveInDate").setValue("01.01.1990");
				this.byId("SCMoveInDate").setValue(this.getModel("util").getProperty("/Parameter/SCMoveInDate"));
				this.getView().byId("SCMoveInDate").fireChange();
			}
		},

		onCancelByCustDate: function(oEvent){
			let d1 = oEvent.getSource().getDateValue();
			let nD = new Date(d1);
			nD.setDate(nD.getDate() +1);
			this.getView().byId("SCMoveInDate2").setDateValue(nD);
		},

		getMarketingPermissionContatcData:function(){
			let bFlag = this.getView().getModel("util").getProperty("/MarktPermEmail");
			let sFlag = bFlag ? "Y" : "N";
			this.getView().getModel("util").setProperty("/PersonalData/Customer/MarktPermEmail", sFlag);
		},
		/**
		 *Fires when Radio button delivery beginn is pressed
		 */
		onSelectDeliveryRbn: function (oEvent) {
			let oData = oEvent.getSource().getSelectedButton().getCustomData()[0];
			this.getModel("util").setProperty(`/Parameter/${oData.getKey()}`, JSON.parse(oData.getValue()));
			if (JSON.parse(oData.getValue())) this.getModel("util").setProperty("/Parameter/SCMoveInDateVisibilityHelper", false);
			else this.getModel("util").setProperty("/Parameter/SCMoveInDateVisibilityHelper", true);
		},

		/** 
		 * Formatting counter values from contracts
		 * @param oEvent
		 */
		formatCounterState: function (oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			if (sValue.indexOf(",") === -1) {
				oInput.setValue(sValue.replace(/\./g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'));
			} else {
				var aSplitVal = sValue.split(",");
				if (aSplitVal[1].length > 2) {
					oInput.setValue(aSplitVal[0].replace(/\./g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + "," + aSplitVal[1].slice(0, -1));
				} else {
					oInput.setValue(aSplitVal[0].replace(/\./g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + "," + aSplitVal[1]);
				}
			}
		},

		/** 
		 * is fired when the selection of segmentb utton changed
		 * @param oEvent
		 */
		onProcessCodeChanged: function (oEvent) {
			if (oEvent.getSource().getSelectedKey() === "Z1") {
				this.getModel("util").setProperty("/Parameter/SCMoveInDateVisibilityHelper", false);
				this.oValidator.clearValue(this.byId("MoveInOut"));
				this.getModel("util").setProperty("/Parameter/MoveInReasonCode", "0007");
			} else {
				let sSalesRegion = this.getModel("util").getProperty("/ProductsInfos/SalesRegion");
				if (sSalesRegion == "DVG") this.getModel("util").setProperty("/Parameter/MoveInReasonCode", "0001");
				else if (sSalesRegion == "aDVG") this.getModel("util").setProperty("/Parameter/MoveInReasonCode", "0005");
				else this.getModel("util").setProperty("/Parameter/MoveInReasonCode", "0001");
			}
		},

		/** 
		 * set aditionally text of Action Code in util model
		 * @param oEvent
		 */
		onActionCodeSelected: function (oEvent) {
			let sText = oEvent.getSource().getSelectedItem().getText();
			let sAText = oEvent.getSource().getSelectedItem().getAdditionalText();
			this.getModel("util").setProperty("/Parameter/ActionCodeHelper", sText);
			this.getModel("util").setProperty("/Parameter/ActionCodeTextHelper", sAText);
		},

		onHandleTokenUpdate: function (oEvent) {
			if (oEvent.getParameter("type") === "removed") {
				this.getView().byId("ActionCodeInput").setValueState("None");
				this.getView().byId("ActionCodeInput").setValueStateText("");
				this.getModel("util").setProperty("/Incentive", {});
				this.getModel("util").setProperty("/Parameter/ActionCodeID", "");
			} else {
				const sCode = oEvent.getParameter("addedTokens")[0].getProperty("key");
				this.getModel("util").setProperty("/Parameter/ActionCodeID", sCode);
				this.onActionCodeCheck(sCode);
			}
		},

		/**
		 * opens the message popover dialog
		 * @param {*} oEvent 
		 */
		handleMessagePopoverPress: function (oEvent) {
			if (!this.oMP) {
				MessagePopover.createMessagePopover(this);
			}
			this.oMP.toggle(oEvent.getSource());
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
		},

		/**
		 * Is fired when the Date value changed
		 * @param {*} oEvent 
		 */
		onMoveInDateChanged: function (oEvent) {
			let fieldValue = oEvent.getParameter("newValue");
			let today, oDate, dateArray;
			dateArray = fieldValue.split("."); // dd.mm.yyyy
			oDate = new Date(dateArray[2], (dateArray[1] - 1), dateArray[0]).setHours(0,0,0,0);
			today = new Date().setHours(0,0,0,0);

			if (oDate > today) { // Zukunft
				this.getModel("util").setProperty("/moveInDatePast", false);
				this.getModel("util").setProperty("/DeliveryViewControl/CounterSateLabelRequired", false);
				this.getModel("util").setProperty("/DeliveryViewControl/DateOfReadLabelRequired", false);
				this.getModel("util").setProperty("/DeliveryViewControl/CounterSateInputRequired", false);
				this.getModel("util").setProperty("/DeliveryViewControl/DateOfReadDatePickerRequired", false);
			} else { // Vergangenheit
				this.getModel("util").setProperty("/moveInDatePast", true);
				this.getModel("util").setProperty("/DeliveryViewControl/CounterSateLabelRequired", true);
				this.getModel("util").setProperty("/DeliveryViewControl/DateOfReadLabelRequired", true);
				this.getModel("util").setProperty("/DeliveryViewControl/CounterSateInputRequired", true);
				this.getModel("util").setProperty("/DeliveryViewControl/DateOfReadDatePickerRequired", true);
				this.getModel("util").setProperty("/DeliveryViewControl/DateOfReadMaxDate", new Date());
				this.getModel("util").setProperty("/Parameter/DateOfRead", fieldValue);
			}
		},

		/**
		 * Fired when navigating in Calendar popup "WunchTermin".
		 * @param {*} oEvent 
		 */
		onDatePickerSupplierNav: function (oEvent) {
			if (this.getModel("util").getProperty("/bCancelbySWD")) {
				let oWeekDate = new Date(new Date().setHours(0, 0, 0, 0));
				let oMonthDate = new Date(new Date().setHours(0, 0, 0, 0));
				oEvent.getSource().setMinDate(new Date(oWeekDate.setDate(oWeekDate.getDate() + 21)));
				oEvent.getSource().setMaxDate(new Date(oMonthDate.setMonth(oMonthDate.getMonth() + 6)));
			}else{
				oEvent.getSource().setMinDate();
				oEvent.getSource().setMaxDate();
			}
		},

		/**
		 * Fired when navigating in Calendar popup "WunchTermin".
		 * @param {*} oEvent 
		 */
		onDatePickerMoveInNav: function (oEvent) {
			let oWeekDate = new Date(new Date().setHours(0, 0, 0, 0));
			let oMonthDate = new Date(new Date().setHours(0, 0, 0, 0));
			oEvent.getSource().setMinDate(new Date(oWeekDate.setDate(oWeekDate.getDate() - 35)));
		}
	});
});