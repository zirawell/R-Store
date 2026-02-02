/********************************
MGW Remove Ads - Version 1.0
Inluding - ABC, eCNY, boscLife, 12306
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/0-9/12306/rewrite/12306.conf
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/S/上银美好生活/rewrite/bosclife.conf
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/S/数字人民币/rewrite/ecny.conf
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/Z/中国农业银行/rewrite/abc.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/0-9/12306/12306.sgmodule
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/S/上银美好生活/bosclife.sgmodule
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/S/数字人民币/ecny.sgmodule
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/Z/中国农业银行/abc.sgmodule
********************************/

const url = $request.url;
const header = $request.headers;
const headopt = header["Operation-Type"] || header["operation-type"];

const generalBlockList = [
  "alipay.client.updateVersion",
  "alipay.client.getUnionResource"
];

const blockListForABC = [
  "com.bankabc.recommendcenter.homepage.gethpadverinfo",
  "com.bankabc.credit.welfareCenter.getadverinfo",
  //"com.bankabc.credit.home.getCcocAdInfo",
  "com.bankabc.credit.query.custbillqry.getadv",
  "com.abchina.mbank.common.homepage.getStartParam",
  "com.abchina.mbank.securitycenter.msmp.antiHijack"
];

const blockListForECNY = [
    "com.dcep.walletapp.api.securityEnvDetect"
];

const blockListForBoscLife = [
  "com.GLMobile.Market.PopupListQry",
  "com.GLMobile.Customer.QryGreeting",
  "com.GLMobile.Market.SecondFloorResourcesQry",
  "com.GLMobile.NewOnlineService.HomeData",
  "com.GLMobile.Customer.HomePageInfoQry"
];

const blockListFor12306 = [
  //"com.cars.otsmobile.integration.activityBanner",            // 活动横幅
  "com.cars.otsmobile.memberInfo.getMemberQa",                  // 铁路会员 常见问题
  // "com.cars.otsmobile.memberInfo.integrationHomeInit",       // 铁路会员 会员信息
  // "com.cars.otsmobile.newHomePage.getWeatherByStationCode",  // 天气信息
  "com.cars.otsmobile.newHomePage.initData",                    // 热门资讯
  "com.cars.otsmobile.newHomePageBussData"                      // 商品信息流
];

const isGeneralBlock = generalBlockList.includes(headopt);
const isAbcBlock = url.includes("mobilepaas.abchina.com") && blockListForABC.includes(headopt);
const isECNYBlock = url.includes("mgs.wallet.pbcdci.cn") && blockListForECNY.includes(headopt);
const isBoscLifeBlock = url.includes("mgs1.bosc.cn") && blockListForBoscLife.includes(headopt);
const is12306Block = url.includes("mobile.12306.cn") && blockListFor12306.includes(headopt);

if (isGeneralBlock || isAbcBlock || isECNYBlock || isBoscLifeBlock || is12306Block) {
  $done({status: "HTTP/1.1 204 No Content", body: "", headers: ""});   
} else {
  $done({});
}
