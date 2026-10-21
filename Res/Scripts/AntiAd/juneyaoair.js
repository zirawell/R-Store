/********************************
JuneYaoAir Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/J/吉祥航空/rewrite/juneyaoair.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/J/吉祥航空/juneyaoair.sgmodule
********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

const adLocations = [
  "POSITION_POP",         // 首页弹窗
  "FLOATING",             // 首页悬浮窗
  "POSITION_TRIP_HOT",    // 行程底部广告
  "POSITION_MY_ADD"       // 我的页中间横幅广告
];

if (obj?.objData?.length > 0) {
  obj.objData = obj.objData.filter(
    item => !adLocations.some(loc => item?.picLocation?.includes(loc))
  );
}

$done({body: JSON.stringify(obj)});