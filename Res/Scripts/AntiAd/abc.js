/********************************
ABC Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/N/农业银行/rewrite/ABC.conf

********************************/

const url = $request.url;
const header = $request.headers;
const headopt = header["Operation-Type"] || header["operation-type"];

const blockList = [
    "com.bankabc.recommendcenter.homepage.gethpadverinfo",
    "com.bankabc.credit.home.getCcocAdInfo",
    "com.abchina.mbank.common.homepage.getStartParam",
    "com.bankabc.credit.query.custbillqry.getadv",
    "alipay.client.updateVersion"
];

if (blockList?.includes(headopt)) {
  $done({ status: "HTTP/1.1 404 Not Found" });
} else {
  $done({});
}
