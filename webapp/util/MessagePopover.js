sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/ui/core/message/Message'
], function (MessagePopover, MessageItem, Message) {
	"use strict";

	return {

		createAndRegisterMessagePopover: function (oController, oView) {
			oController._MessageManager = sap.ui.getCore().getMessageManager();
			oController._MessageManager.removeAllMessages();
			oController._MessageManager.registerObject(oView, true);
			oController.oView.setModel(oController._MessageManager.getMessageModel(), "MessageModel");

			this.createMessagePopover(oController);
		},

		createMessagePopover: function (oController) {
			oController.oMP = new MessagePopover({
				items: {
					path: "MessageModel>/",
					template: new MessageItem({
						title: "{MessageModel>message}",
						subtitle: "{MessageModel>additionalText}",
						type: "{MessageModel>type}",
						description: "{MessageModel>additionalText}"
					})
				},
				beforeOpen: function () {
					let oListHeader = oController.oMP._oMessageView._getListHeader(),
						oDetailListHeader = oController.oMP._oMessageView._getDetailsHeader();
					oListHeader.addStyleClass("messagePopoverBar");
					oDetailListHeader.addStyleClass("messagePopoverBar");
				}.bind(oController)
			});
			oController.getView().byId("messagePopoverBtn").addDependent(oController.oMP);
			oController.oMP.getBinding("items").attachChange(function (oEvent) {
				let oMpBtn = oController.getView().byId("messagePopoverBtn");
				oMpBtn.setIcon(this.buttonIconFormatter(oController));
				oMpBtn.removeStyleClass("messagePopoverButtonError");
				oMpBtn.removeStyleClass("messagePopoverButtonWarning");
				let sStyleClassName = this.buttonTypeFormatter(oController);
				if (sStyleClassName) oMpBtn.addStyleClass(sStyleClassName);
			}.bind(this));
		},

		addMessageToPopover: function (oController, oInput, type, msgText, sAdditionalText) {
			let sTarget;
			if (oInput) {
				try {
					switch (oInput.getMetadata().getName()) {
						case "sap.m.ComboBox":
							sTarget = oInput.getBindingInfo("selectedKey").binding;
							break;
						case "sap.m.RadioButtonGroup":
							sTarget = oInput.getBindingInfo("selectedIndex").binding;
							break;
						case "sap.m.Select":
							sTarget = oInput.getBindingInfo("selectedKey").binding;
							break;
						case "sap.m.CheckBox":
							sTarget = oInput.getBindingInfo("selected").binding
							break;
						default:
							sTarget = oInput.getBindingInfo("value").binding;
							break;
					}
				} catch (e) {
					sTarget = oInput.getId();
				}
				this.removeMessageFromTarget(oController, oInput);
				try {
					//oInput.setShowValueStateMessage(false);
				} catch (err) {
					oInput.setValueStateText();
					let sValStateTextFromSpecificElements = oInput.getSimpleFixFlex().getFixContent();
					if (sValStateTextFromSpecificElements) sValStateTextFromSpecificElements.destroy();
				}
				if (msgText, type, sAdditionalText) {
					oController._MessageManager.addMessages(
						new Message({
							target: sTarget,
							message: msgText,
							type: type,
							additionalText: "Feld: " + sAdditionalText
						})
					);
				}
			} else {
				oController._MessageManager.addMessages(
					new Message({
						message: msgText,
						type: type
					})
				);
			}

		},

		addMultipleFieldsMessageToPopover: function (oController, diffFields, type, msgText, sTarget) {
			this.removeMultipleFieldsMessageFromTarget(oController, sTarget);
			let sFieldsName = "";
			for (var i in diffFields) {
				if (+i === diffFields.length - 1) {
					sFieldsName = sFieldsName + diffFields[i].getParent().getItems()[0].getText().slice(0, -1);
				} else {
					sFieldsName = sFieldsName + diffFields[i].getParent().getItems()[0].getText().slice(0, -1) + ", ";
				}
				try {
					diffFields[i].setShowValueStateMessage(false);
				} catch (err) {
					//Field is not support ValueStateMessages
					//For example in case of sap.m.Select element
					//we should destroy Value state messages instead of hiding
					diffFields[i].setValueStateText();
					let sValStateTextFromSpecificElements = diffFields[i].getSimpleFixFlex().getFixContent();
					if (sValStateTextFromSpecificElements) sValStateTextFromSpecificElements.destroy();
				}
			}
			if (msgText, type, sFieldsName) {
				oController._MessageManager.addMessages(
					new Message({
						target: sTarget,
						message: msgText,
						type: type,
						additionalText: "Felder: " + sFieldsName
					})
				);
			}
		},

		removeMessageFromTarget: function (oController, oInput) {
			try {
				let sTarget;
				try {
					switch (oInput.getMetadata().getName()) {
						case "sap.m.ComboBox":
							sTarget = oInput.getBindingInfo("selectedKey").binding;
							break;
						case "sap.m.RadioButtonGroup":
							sTarget = oInput.getBindingInfo("selectedIndex").binding;
							break;
						case "sap.m.Select":
							sTarget = oInput.getBindingInfo("selectedKey").binding;
							break;
						case "sap.m.CheckBox":
							sTarget = oInput.getBindingInfo("selected").binding
							break;
						default:
							sTarget = oInput.getBindingInfo("value").binding;
							break;
					}
				} catch (e) {
					sTarget = oInput.getId();
				}
				oController._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
					if ((oMessage.target === sTarget) || (oMessage.target.getPath() === sTarget.getPath() && oMessage.target.getValue() === sTarget.getValue())) {
						oController._MessageManager.removeMessages(oMessage);
					}
				}.bind(oController));
			} catch (err) {
				//element is not required
			}
		},

		removeMultipleFieldsMessageFromTarget: function (oController, sTarget) {
			oController._MessageManager.getMessageModel().getData().forEach(function (oMessage) {
				if (oMessage.target === sTarget) {
					oController._MessageManager.removeMessages(oMessage);
				}
			}.bind(oController));
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function (oController) {
			let sHighestSeverity;
			let aMessages = oController._MessageManager.getMessageModel().getData();
			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverity = "messagePopoverButtonError";
						break;
					case "Warning":
						sHighestSeverity = sHighestSeverity !== "messagePopoverButtonError" ? "messagePopoverButtonWarning" : sHighestSeverity;
						break;
				}
			});
			return sHighestSeverity;
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function (oController) {
			let sIcon;
			let aMessages = oController._MessageManager.getMessageModel().getData();

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sIcon = "sap-icon://message-error";
						break;
					case "Warning":
						sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
						break;
				}
			});

			return sIcon;
		}
	};

});