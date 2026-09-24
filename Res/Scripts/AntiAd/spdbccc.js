/********************************
Spdbccc Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/P/浦大喜奔/rewrite/spdbccc.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/P/浦大喜奔/spdbccc.sgmodule
********************************/

const url = $request.url;
const header = $response.headers;
const fileSize = header["Ohc-File-Size"];

if (fileSize > 400000) {
  $done({body: "", headers: "", status: "HTTP/1.1 204 No Content"});
} else {
  $done({});
}