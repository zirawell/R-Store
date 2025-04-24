/********************************
51Job Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/0-9/51job/rewrite/51job.conf

********************************/

if (!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);
obj.resultbody.adsTabFeeds = [];
body = JSON.stringify(obj);
$done({body});
