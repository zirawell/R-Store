/********************************
XiaoYuZhou Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/X/小宇宙/rewrite/xiaoyuzhoufm.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/X/小宇宙/xiaoyuzhoufm.sgmodule
********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;

if (url.includes("discovery-feed")) {
    let obj = JSON.parse(body);
    if (obj?.data?.length > 0) {
        obj.data = obj.data.filter(
            (i) =>
                [
                    "DISCOVERY_EPISODE_RECOMMEND",
                    "EDITOR_PICK"
                ]?.includes(i?.type)
        );
    }
    body = JSON.stringify(obj);
}

$done({body});
