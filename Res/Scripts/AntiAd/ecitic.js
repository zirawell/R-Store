/********************************
Ecitic Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/Z/中信银行/rewrite/ecitic.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/Z/中信银行/ecitic.sgmodule
********************************/

const url = $request.url;
const queryParam = url.split('?')[1] || '';
const params = {};

for (const param of queryParam.split('&')) {
  const [key, value] = param.split('=');
  if (key) params[key] = value;
}

const width = Number(params["width"]);
const height = Number(params["height"]);

const blockFlag =
  Number.isFinite(width) &&
  Number.isFinite(height) &&
  width > 0 &&
  height > 0 &&
  height * 750 === width * 1624;

if (blockFlag) {
  $done({status: "HTTP/1.1 404 Not Found"});
} else {
  $done();
}