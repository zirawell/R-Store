/********************************
ButterCam Unlock Vip - Version 1.0
Checkout Source - https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/hy.js
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/H/黄油相机/rewrite/bybutter.conf

********************************/

if (!$response.body) $done({});
let body = $response.body;
const modifiedBody = body
  .replace(/"ownership":\s*"\w+"/g, '"ownership":"free"')
  .replace(/"usageType":\s*"\w+"/g, '"usageType":"unlimited"')
  .replace(/"memberships":\s*\[\]/g, '"memberships":[{"endAt":1780697166,"id":"1","name":"262223689020250215","ownership":"temporary","startAt":1587654321,"usageType":"unlimited"}]')
  .replace(/false/g, "true");
$done({ body: modifiedBody });