/********************************
DDXQ Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/D/叮咚买菜/rewrite/ddxq.conf

********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);
// 底部状态栏去除AI及右下侧边广告
if (url.includes("/homeApi/bottomNavi")) {
	if (obj.data?.adId) {
		delete obj.data.adId;
	}
	if (obj.data?.bottom_list?.length > 0) {
		obj.data.bottom_list = obj.data.bottom_list.filter(item => item.type !== 'eatwhat');
	}
// 首页推荐流优化
}else if (url.includes("homeApi/homeFlowDetail")) {
	if (obj.data?.list?.length > 0) {
		obj.data.list = obj.data.list.map(item => {
            if (item.multi_advertise_data_list?.length > 0) {
                return null;
            } else if (item.small_image?.includes("ddfs-public.ddimg.mobi")) {
                return null;
            }
            return item;
        }).filter(Boolean);
	}
}
body = JSON.stringify(obj);
$done({body});