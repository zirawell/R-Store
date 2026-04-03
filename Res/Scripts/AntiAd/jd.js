/********************************
Jingdong Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/J/京东/rewrite/jd.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/Surge/Adblock/App/J/京东/jd.sgmodule
********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);


const PERSON_INFO_BUSINESS_MID_EXCLUDE = [
  "bigSaleFloor",             // 双十一
  "buyOften",                 // 常买常逛
  "newAttentionCard",         // 关注的频道
  "newBigSaleFloor",          // 双十一
  "newStyleAttentionCard",    // 新版关注的频道
  "newsFloor",                // 京东快讯
  "noticeFloor",              // 顶部横幅
  "recommendfloor",           // 我的推荐
];

const WELCOME_HOME_TYPE_INCLUDE = [
  "topTab",                   // 顶部分类
  "searchC",                  // 搜索
  "dynamicIcon",
  "locPermission",
  "login",
  "hybrid",
  "recommend"
 
];

const CUSTOM_SURFACE_NAME_INCLUDE = [
  "index",                    // 首页
  "messagenew",               // 消息
  "cart",                     // 购物车
  "home"                      // 我的

 
];


// 开屏广告
if (url.includes("functionId=start")) {
  if (obj?.images?.length > 0) {
    obj.images = [];
  }
  if (obj?.showTimesDaily) {
    obj.showTimesDaily = 0;
  }
} else if (url.includes("functionId=welcomeHome")) {
  // 首页配置
  if (obj?.floorList?.length > 0) {
    // 首页 图层列表
    obj.floorList = obj.floorList.filter((i) => WELCOME_HOME_TYPE_INCLUDE.includes(i?.type));
  }
  // 首页 下拉二楼
  if (obj?.webViewFloorList?.length > 0) {
    obj.webViewFloorList = [];
  }
  // 首页 顶部右部推荐
  if (obj?.promotionTabs) {
    delete obj.promotionTabs;
  }
} else if (url.includes("functionId=readCustomSurfaceList")) {
  if (obj?.result?.modeMap?.dark?.navigationAll.length > 0) {
    obj.result.modeMap.dark.navigationAll = obj.result.modeMap.dark.navigationAll.filter((i) => CUSTOM_SURFACE_NAME_INCLUDE.includes(i?.functionId));
  }
  if (obj?.result?.modeMap?.normal?.navigationAll.length > 0) {
    obj.result.modeMap.normal.navigationAll = obj.result.modeMap.normal.navigationAll.filter((i) => CUSTOM_SURFACE_NAME_INCLUDE.includes(i?.functionId));
  }
}else if (url.includes("functionId=deliverLayer") || url.includes("functionId=orderTrackBusiness")) {
  // 物流页面
  if (obj?.bannerInfo) {
    // 收货时寄快递享八折 享受条件苛刻 故移除
    delete obj.bannerInfo;
  }
  if (obj?.floors?.length > 0) {
    // 运费八折
    obj.floors = obj.floors.filter((i) => !["banner", "jdDeliveryBanner"]?.includes(i?.mId));
  }
} else if (url.includes("functionId=getTabHomeInfo")) {
  // 新品页面
  if (obj?.result?.iconInfo) {
    // 新品页 悬浮动图
    delete obj.result.iconInfo;
  }
  if (obj?.result?.roofTop) {
    // 新品页 下拉二楼
    delete obj.result.roofTop;
  }
} else if (url.includes("functionId=myOrderInfo")) {
  // 订单页面
  if (obj?.floors?.length > 0) {
    let newFloors = [];
    for (let floor of obj.floors) {
      if (["bannerFloor", "bpDynamicFloor", "plusFloor"]?.includes(floor?.mId)) {
        // bannerFloor满意度评分 bpDynamicFloor专属权益 plusFloor开通会员
        continue;
      } else {
        if (floor?.mId === "virtualServiceCenter") {
          // 服务中心
          if (floor?.data?.virtualServiceCenters?.length > 0) {
            let newItems = [];
            for (let item of floor.data.virtualServiceCenters) {
              if (item?.serviceList?.length > 0) {
                let newCards = [];
                for (let card of item.serviceList) {
                  if (card?.serviceTitle === "精选特惠") {
                    continue;
                  }
                  newCards.push(card);
                }
                item.serviceList = newCards;
              }
              newItems.push(item);
            }
            floor.data.virtualServiceCenters = newItems;
          }
        }
        if (floor?.mId === "customerServiceFloor") {
          // 客户服务
          if (floor?.data?.moreText) {
            // 点此获得更多服务
            delete floor.data.moreIcon;
            delete floor.data.moreIcon_dark;
            floor.data.moreText = " ";
          }
        }
        newFloors.push(floor);
      }
    }
    obj.floors = newFloors;
  }
} else if (url.includes("functionId=personinfoBusiness")) {
  if (obj?.floors?.length > 0) {
    obj.floors = processFloors(obj.floors);
  }
  
  if (obj?.others?.floors?.length > 0) {
    obj.others.floors = processFloors(obj.others.floors);
  }
}

$done({body: JSON.stringify(obj)});




/**
 * 清理单个楼层数据（删除弹窗、广告等冗余字段）
 * @param {Object} floor - 楼层对象
 */
function cleanFloorData(floor) {
  if (!floor || !floor.mId) return;

  switch (floor.mId) {
    case 'basefloorinfo':
      // 弹窗
      delete floor.data?.commonPopup;
      delete floor.data?.commonPopup_dynamic;
      // 底部会员续费横幅
      if (floor.data?.commonTips?.length) floor.data.commonTips = [];
      // 弹窗
      if (floor.data?.commonWindows?.length) floor.data.commonWindows = [];
      // 右下角动图
      delete floor.data?.floatLayer;
      break;

    case 'orderIdFloor':
      // 发布评价提醒
      if (floor.data?.commentRemindInfo?.infos?.length) {
        floor.data.commentRemindInfo.infos = [];
      }
      break;

    case 'userinfo':
      // 开通plus会员卡片
      delete floor.data?.newPlusBlackCard;
      // 注：个人页顶部背景图已注释，按需取消注释
      // delete floor.data?.bgImgInfo?.bgImg;
      break;
  }
}

/**
 * 过滤并处理楼层数组
 * @param {Array} floors - 原始楼层数组
 * @returns {Array} 处理后的新楼层数组
 */
function processFloors(floors) {
  if (!Array.isArray(floors) || floors.length === 0) return floors;

  const newFloors = [];
  for (const floor of floors) {
    // 跳过指定类型的楼层
    if (PERSON_INFO_BUSINESS_MID_EXCLUDE.includes(floor?.mId)) continue;

    // 清理当前楼层数据
    cleanFloorData(floor);

    newFloors.push(floor);
  }
  return newFloors;
}
