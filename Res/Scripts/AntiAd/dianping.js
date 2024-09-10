/********************************
Dianping Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/D/大众点评/rewrite/dianPing.conf

********************************/

const url = $request.url;
const header = $request.headers;
const resp = {};
const headopt = header["M-SHARK-TRACEID"] || header["m-shark-traceid"];

if (headopt != null) {
  $done({ body:"", headers:"", status: "HTTP/1.1 204 No Content" });
} else{
  $done({});
}
