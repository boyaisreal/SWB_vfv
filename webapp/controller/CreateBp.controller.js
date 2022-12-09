sap.ui.define([
	"swd/fair/consumerFriendly/controller/Abstract/BaseController",
	"swd/fair/consumerFriendly/util/Validator",
	"swd/fair/consumerFriendly/util/MessagePopover",
	"swd/fair/consumerFriendly/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"swd/fair/consumerFriendly/service/GenericService",
	"swd/fair/consumerFriendly/service/MainService"
], function (
	BaseController,
	Validator,
	MessagePopover,
	Formatter,
	Filter,
	FilterOperator,
	MessageToast,
	GenericService,
	MainService) {
	"use strict";

	return BaseController.extend("swd.fair.consumerFriendly.controller.CreateBp", {
		formatter: Formatter,
		MessagePopover: MessagePopover,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smshub.components.deliktverfolgung.view.punishmentPetitionObjectDetail
		 */
		onInit: function () {
			this.oGenericService = new GenericService(this.getOwnerComponent(), "genDataService");
			this.oMainService = new MainService(this.getOwnerComponent());
			this.getView().setModel(this.getModel());
			this.setController.call(this, "CreateBp");
		},

		/**
		 * @override
		 */
		onAfterRendering: async function () {
			this.oValidator = new Validator(this.getController("WizardContainer"));
			const sBPType = await this.getOwnerComponent().oBPType;
			if (sBPType === "1" || sBPType === "3") {
				this.getView().byId("segmCompanyPerson").getItems()[0].setKey(sBPType)
			}
		},

		/**
		 * Insert given fragment to createBPContent container
		 */
		onBpSegmentBtnChanged: function (oEvent) {
			const sSlektedtKey = oEvent.getSource().getSelectedKey();
			var oContent = this.byId("createBPContent");
			if (sSlektedtKey === "1") {
				this.getModel("util").setProperty("/PersonalData/Customer/Type", sSlektedtKey);
				["Name1", "Name2", "ContactPersonFirstName", "ContactPersonLastName", "CompanyRegistrationNo"].forEach(function (item) {
					delete this.getModel("util").getData()["PersonalData"]["Customer"][item];
				}.bind(this));
				this.oValidator.clearValueState(this.byId("BpFragmentBox"));
			} else {
				this.getModel("util").setProperty("/PersonalData/Customer/Type", sSlektedtKey);
				["TitleKey", "TitleAca1Key", "FirstName", "LastName", "BirthDate"].forEach(function (item) {
					delete this.getModel("util").getData()["PersonalData"]["Customer"][item];
				}.bind(this));
				this.oValidator.clearValueState(this.byId("BpFragmentBox"));
			}
		},

		/*
		 * Return fragment for a given name
		 */
		_getFormFragment: function (sFragmentName) {
			return sap.ui.xmlfragment(this.getView().getId(), "swd.fair.consumerFriendly.view.fragment." + sFragmentName, this);
		},

		CommmunicationSelect: function(oEvent){
			let key =oEvent.getSource().getSelectedKey();
			this.getView().getModel("util").setProperty("/PersonalData/Customer/MarktPermDefaultChannel", key);

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

		/**
		 * Event Handler to add a new Bp Form
		 * @param {*} oEvent 
		 */
		onAddNewBpForm: async function (oEvent) {
			this.getModel("util").setProperty("/FCPartnerVisibility", true);
		},

		/**
		 * Event Handler to delete the new Bp Form
		 * @param {*} oEvent 
		 */
		onDeleteNewBpForm: function () {
			this.getModel("util").setProperty("/FCPartnerVisibility", false);
			this.oValidator.clearValueState(this.byId("FutherCPartner"));
			this.getModel("util").setProperty("/PersonalData/FurtherContractPartner", {});
		},

		/**
		 * Fires when RadioButton selection is changed by user.
		 */
		onRegSelfServiceRBtnSelected: function (oEvent) {
			let bRegisterSelfService = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();
			this.getModel("util").setProperty("/PersonalData/RegSelfSrvInfoHelper", true);
			let bSlected = bRegisterSelfService === 'true' ? true : false
			this.getModel("util").setProperty("/PersonalData/Customer/RegisterSelfService", bSlected);
		},

		/**
		 * Is fired when the text in the input field  Street has changed and the focus leaves the input field.
		 * @param {*} oEvent 
		 * @param {*} oBinding 
		 */
		onHandleStreetChanged: function (oEvent, oBinding) {
			this.oGenericService.onHandleStreetChanged.call(this, oEvent, oBinding);
			let oCustomer = this.getModel("util").getProperty("/PersonalData/Customer");
			let oPromise = this.getModel("util").getProperty("/DeliveryStep/Premise");
			if (oCustomer.PostCode === oPromise.PostCode && oCustomer.CityCode === oPromise.CityCode && !!oCustomer.Street && !oPromise.Street) {
				this.getModel("util").setProperty("/DeliveryStep/Premise/Street", oCustomer.Street);
				this.getModel("util").setProperty("/DeliveryStep/Premise/HouseNumber", oCustomer.HouseNumber);
			}
		},

		/**
		 * Is fired when the text in the input field HouseNumber has changed and the focus leaves the input field
		 * @param {*} oEvent 
		 * @param {*} oBinding 
		 */
		onHouseNumberChanged: function (oEvent, oBinding) {
			let oCustomer = this.getModel("util").getProperty("/PersonalData/Customer");
			let oPromise = this.getModel("util").getProperty("/DeliveryStep/Premise");
			if (oCustomer.PostCode === oPromise.PostCode && oCustomer.CityCode === oPromise.CityCode && !!oCustomer.Street) {
				this.getModel("util").setProperty("/DeliveryStep/Premise/Street", oCustomer.Street);
				this.getModel("util").setProperty("/DeliveryStep/Premise/HouseNumber", oCustomer.HouseNumber);
			}
		},

		selefServiceVisibility: async function () {
			let sSelfServiceRegistration = this.getModel("util").getProperty("/ProductsInfos").SelfServiceRegistration;
			let sOnlineProduct = this.getModel("util").getProperty("/ProductsInfos").OnlineProduct;
			if (sOnlineProduct === "Y") {
				if (sSelfServiceRegistration === "Y") {
					this.byId("RegistrationMesssage").setText(this.getResourceBundle().getText("OnlineSSRegistered"));
					this.byId("RegistrationRbtg").setVisible(false);
					this.byId("RegistrationLabel").setVisible(false);

				} else {
					this.byId("RegistrationMesssage").setText(this.getResourceBundle().getText("OnlineSSNotRegistered"));
					this.byId("RegistrationRbtg").setSelectedIndex(0);
					this.byId("RegistrationRbtg").setEnabled(false);
					this.byId("RegistrationRbtg").getButtons()[1].setVisible(false);
				}
				this.getModel("util").setProperty("/PersonalData/Customer/RegisterSelfService", true);
			} else if (sSelfServiceRegistration === "Y") {
				this.getModel("util").setProperty("/PersonalData/Customer/RegisterSelfService", true);
				this.byId("RegistrationMesssage").setText(this.getResourceBundle().getText("NotOnlineSSRegistered"));
				this.byId("RegistrationRbtg").setSelectedIndex(0);
				this.byId("RegistrationRbtg").setEnabled(false);
				this.byId("RegistrationRbtg").getButtons()[1].setVisible(false);
			} else {
				this.byId("RegistrationMesssage").setText(this.getResourceBundle().getText("NotOnlineNotSSRegistered"));
			}
			await this.getOwnerComponent().oBPType;
		}

	});
});