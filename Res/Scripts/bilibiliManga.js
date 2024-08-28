/********************************
Bilibili Manga Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/B/哔哩哔哩漫画/rewrite/bilibiliManga.conf

********************************/

const url = $request.url;
if (!$response.body) $done();
let body = $response.body;
let obj = JSON.parse(body);
//我的页按钮展示
if (url.includes("/UCenterConf")){
  const showPattern = [
    "活动中心",
    "个性装扮",
    "我的已购",
    "超漫俱乐部",
  ];
  if(obj.data.confs?.length > 0) {
    let newConfs = [];
    for (let conf of obj.data.confs) {
      if (showPattern.includes(conf?.title)) {
        newConfs.push(conf);
      }
    }
    obj.data.confs = newConfs;
  }
  obj.data.show_welfare = false;
  obj.data.show_all_welfare = false;
//我的页底部关注官方号提示去除
}else if(url.includes("/GetInitInfo")){
  if(obj?.data){
    obj.data.had_follow_offcial=true;
  }
//首页去除商品推荐和视频内容
}else if(url.includes("/HomeFeed")){
  if(obj?.data?.feeds?.length > 0){
    //去除商品推荐
    obj.data.feeds = obj.data.feeds.filter(feed => !feed.image.includes("/mall/"));
    //去除视频内容
    obj.data.feeds = obj.data.feeds.filter(feed => feed.inline_pv_card.bvid === "");
  }
}
body = JSON.stringify(obj);
$done({ body });
