sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "swd/fair/consumerFriendly/model/models",
	"swd/fair/consumerFriendly/service/MainService"
], function (UIComponent, Device, Models, MainService) {
    "use strict";

    return UIComponent.extend("swd.fair.consumerFriendly.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: async function () {
            this.oMainService = new MainService(this);
            
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(Models.createDeviceModel(), "device");

            this.oBPType = new Promise(resolve => {
                this.resolveBPType  = resolve;
            });

            this.bPostalCodesLoaded = new Promise(resolve => {
                this.resolvePostalCodesLoaded  = resolve;
            });

            // Retrieve parameters from URL
			var sURL = window.location.href;
			// Customer/BP identificator
			var sParam = sURL.split("&").find(function (item) {
				return item.includes("customerid");
			});
			if (sParam) {
				this.sCustomerid = sParam.split("=")[1].toUpperCase();
			}

            try {
                let aPostCodes = await this.oMainService.readPostalCodes();
                this.resolvePostalCodesLoaded(true);
                this.getModel("util").setProperty("/AllPostCodes", aPostCodes.results);
            } catch(oError) {
                console.log(oError);
            }    
      
        }

    });
});