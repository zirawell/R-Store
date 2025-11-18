/********************************
Meituan Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/M/美团/rewrite/meituan.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/M/美团/meituan.sgmodule
********************************/

const url = $request.url;
const iconRegex1 = /\.(gif|jpg|webp|png)@(100w_100h|120w_120h|150w_150h|250w_250h|132w_96h|186w_135h|1284w|250w_0h|400w_0h|700w_0h|1200w_0h)/;
const iconRegex2 = /%(4088h_88w|40115h_115w|4047h_189w|40157h_189w)_1e_1l\.(gif|jpg|webp|png)/;
const urlRegex1 = /https?:\/\/p\d\.meituan\.net\/linglong\/\w+\.(gif|jpg|webp|png)$/;
var removeFlag = true;
if (url.includes("/linglong")) {
    if (urlRegex1.test(url)) {
        const header = $request.headers;
        const traceKey = Object.keys(header).find(key => /^ai|dt|al|u/i.test(key));
        removeFlag = traceKey ? true : false;
    } else {
        if (url.match(iconRegex1) || url.match(iconRegex2)) {
            removeFlag = false;
        }
    }
    
    if (removeFlag) {
        $done({body: "", headers: "", status: "HTTP/1.1 204 No Content"});
    } else {
        $done({});
    }
}
