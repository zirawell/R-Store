/********************************
Freshippo Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/H/盒马/rewrite/freshippo.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);
// 首页
if (url.indexOf("queryindexpage") != -1) {
  const sceneTemplateId = [
    "509",
    "738"
  ];
  if (obj?.data?.scenes?.length > 0) {
    let scenes = [];
    for (let scene of obj.data.scenes) {
      if (sceneTemplateId.includes(scene.sceneTemplateId)) {
        scenes.push(scene);
      }
    }
    obj.data.scenes = scenes;
  }
// 我的页
} else if (url.indexOf("querymypage") != -1) {
  const sceneTemplateId = [
    "906",
    "907",
    "198",
    "286",
    "431",
    "185",
    "230",
    "978",
    "709",
    "432",
    "403",
    "350"
  ];
  if (obj?.data?.scenes?.length > 0) {
    let scenes = [];
    for (let scene of obj.data.scenes) {
      if (sceneTemplateId.includes(scene.sceneTemplateId)) {
        scenes.push(scene);
      }
    }
    obj.data.scenes = scenes;
  }
// 我的页及购物车页推荐信息流
} else if (url.indexOf("querytabfeedstream") != -1) {
  if (obj?.data?.pageName && obj.data.pageName.includes("盒马商家")) {
    obj.data = {};
  }
} else {
  $done({});
}
$done({body: JSON.stringify(obj)});

