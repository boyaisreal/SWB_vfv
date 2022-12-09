# Start App in localhost #  
npm run start

# Test data # 
## For localhost ##  
Noted: local test is pretty limited due to lack of data from previous app 

http://localhost:8080/index.html

## For Gateway ## 
ProdBerater has to be startet first, in order to initialise all data 

https://power-gw.4brandsreply.de:44300/sap/bc/ui5_ui5/reply/APSL004PT/index.html?&customerid=1000000655 (ProdBerater-App) 

If no data necessary 

https://power-gw.4brandsreply.de:44300/sap/bc/ui5_ui5/REPLY/APSL004VFV/index.html

PLZ: 58ß93 

Ort: Hagen 

Straße: Sievekingstr. 

Nr. 12

# Delete App in system before deploy # 
SE38, 

Put "/UI5/UI5_REPOSITORY_LOAD" in field Programm, 

Ausführen, 

Put "/REPLY/APSL004VFV" in field Name der SAPUI5-App, 

Select "löschen", 

Select "In Orig. Sprache Pflegen"

# Deploy App #
npm run deploy-new