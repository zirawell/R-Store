/********************************
Alicdn Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/#/广告联盟/rewrite/adUnion.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;
body = body.replace(/!function (e, t)/g,'!function0 (e, t)');
$done({ body });
