/********************************
Jingxi Remove Ads - Version 1.0
Checkout Source - https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/jingxiAd.js
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/J/京喜/rewrite/jx.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);
if (obj?.data?.materialList) {
  obj.data.materialList.startTime = 3667476800000;
  obj.data.materialList.endTime = 3667908800000;
}
$done({body: JSON.stringify(obj)});