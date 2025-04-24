/********************************
Zhuanzhuan Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/Applet/Wechat/Z/转转/rewrite/zhuanzhuan.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);

if (obj?.respData?.popWin) {
	delete obj.respData.popWin;
}
if (obj?.respData?.pendant) {
	delete obj.respData.pendant;
}
if (obj?.respData?.leftPendant) {
	delete obj.respData.leftPendant;
}
if (obj?.respData?.rightOpera) {
	delete obj.respData.rightOpera;
}
if (obj?.respData?.rightOpera2) {
	delete obj.respData.rightOpera2;
}
body = JSON.stringify(obj);
$done({body});