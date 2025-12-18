/********************************
JuneYaoAir Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/J/吉祥航空/rewrite/juneyaoair.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/J/吉祥航空/juneyaoair.sgmodule
********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (obj?.objData?.length > 0) {
  obj.objData = obj.objData.filter(item => !(item?.picLocation?.includes("POSITION_POP") || item?.picLocation?.includes("FLOATING")));
}

$done({body: JSON.stringify(obj)});