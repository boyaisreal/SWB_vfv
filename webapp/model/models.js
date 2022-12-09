sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			let oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createJsonModel: function (sDataPath) {
			let oModel;
			if (sDataPath) {
				oModel = new JSONModel(sDataPath);
			} else {
				oModel = new JSONModel();
			}

			oModel.setDefaultBindingMode("TwoWay");
			return oModel;
		}

	};
});
