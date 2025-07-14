/********************************
Cloud139 Remove Ads - Version 1.0
Checkout Source - https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/cloud139.js
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/Z/中国移动云盘/rewrite/mcloud.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("ad.mcloud.139.com/advertapi/adv-filter/")) {
  // 广告组件
  if (obj?.body) {
    if (obj?.body?.length > 0) {
      let newBods = [];
      for (let item of obj.body) {
        if (
            [
              "APP-启动页",
              "APP-我的-底部卡片",
              "APP-我的-悬浮窗",
              "APP-我的-文字链",
              "APP-我的-活动推广专区",
              "APP-相册上传界面-banner",
              "APP-首页-云朵中心卡片"
            ]?.includes(item?.adposname)
        ) {
          continue;
        }
        newBods.push(item);
      }
      obj.body = newBods;
    } else {
      obj.body = {};
    }
  }
} else if (url.includes("jzts.cmpassport.com/personalized/getPushContent")) {
  // 开屏广告
  if (obj?.data?.length > 0) {
    for (let item of obj.data) {
      if (item?.actsList?.length > 0) {
        for (let i of item.actsList) {
          if (i?.putStartTime) {
            i.putStartTime = "2090-12-31 00:00:00.0";
          }
          if (i?.putEndTime) {
            i.putEndTime = "2090-12-31 23:59:59.0";
          }
          if (i?.adUrl) {
            i.adUrl = "";
          }
        }
      }
    }
  }
}

$done({body: JSON.stringify(obj)});
