/********************************
Tuhu Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/T/途虎养车/rewrite/tuhu.conf
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/Applet/Wechat/T/途虎养车/rewrite/tuhu.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/T/途虎养车/tuhu.sgmodule
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/Applet/Wechat/T/途虎养车/tuhu.sgmodule

********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

// 首页净化
if (url.indexOf("/homePage/getHomePageInfo") != -1) {
  
  const moduleIdForApp = [
    51, //车型模块
    53, //四大金刚
    87, //三十宫格
    129, //算法版1切3通栏
    119, //多帧位轮播通栏
  ];

  const moduleIdForApplet = [
    51, //车型模块
    53, //四大金刚
    87, //三十宫格
    120, //算法版1切3通栏
    119, //多帧位轮播通栏
  ];

  if (obj.data?.cmsInfo?.cmsList?.length > 0) {
    if (url.indexOf("cl-homepage-service") != -1) {
      obj.data.cmsInfo.cmsList = obj.data.cmsInfo.cmsList.filter(item => moduleIdForApp.includes(item.moduleId));
    } else if (url.indexOf("cl-common-api") != -1){
      obj.data.cmsInfo.cmsList = obj.data.cmsInfo.cmsList.filter(item => moduleIdForApplet.includes(item.moduleId));
    }
  }
  if (obj.data?.cmsInfo?.otherList?.length > 0) {
    obj.data.cmsInfo.otherList = [];
  }
  if (obj.data?.cmsAggregationResp) {
    delete obj.data.cmsAggregationResp;
  }
// 我的页净化
} else if (url.indexOf("/personalCenter/getCmsModuleList") != -1) {
  const moduleTypeIdForApp = [
    149, //个人信息
    148, //个人中心超级会员入口
    150, //我的资产
    151, //我的订单
    152, //我的爱车
  ];
  const mainTitlesToDelete = ["保养超值卡", "特价团购", "合作加盟", "集团客户", "评价途虎"];
  if (obj.data?.cmsList?.length > 0) {
    obj.data.cmsList = obj.data.cmsList.filter(item => moduleTypeIdForApp.includes(item.moduleTypeId) && !mainTitlesToDelete.includes(item.mainTitle));
  }
} else if (url.indexOf("/shopTab/getModuleForC") != -1) {
  delete obj.data.bannersList;
  if (obj.data?.cmsList) {
    obj.data.cmsList = obj.data.cmsList.reduce((acc, module) => {
      if (module.bottomMargin !== 12) {
        acc.push(module);
      }
      return acc;
    }, []);
  }
} else {
  $done({});
}
$done({body: JSON.stringify(obj)});
