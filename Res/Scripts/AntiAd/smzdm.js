/********************************
 SMZDM Remove Ads - Version 1.0
 Please note that you may need to reinstall app for script to work.

 QuantumultX rewrite link:
 https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/S/什么值得买/rewrite/smzdm.conf

 ********************************/

const url = $request.url;
if (!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);

const fixPos = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        arr[i].pos = i + 1;
    }
};

if (url.includes("/home") && url.includes("homepage-api")) {
    const recursivelyFilterByCellType = (data) => {
        if (Array.isArray(data)) {
            return data.map(item => recursivelyFilterByCellType(item)).filter(Boolean);
        } else if (typeof data === 'object') {
            if (data['cell_type'] === '23008' || data['cell_type'] === '23005' || data['cell_type'] === '23024') {
                return null;
            } else {
                for (const key in data) {
                    data[key] = recursivelyFilterByCellType(data[key]);
                }
                return data;
            }
        }
        return data;
    };

    obj.data = recursivelyFilterByCellType(obj.data);
}

if (url.includes("/vip")) {
    if (obj?.data?.big_banner) {
        delete obj.data.big_banner;
    }
    if (url.includes("/vip/creator_user_center")) {
        obj.data = {};
    }else if (url.includes("/vip/bottom_card_list")) {
        if(obj?.data?.rows) {
            delete obj.data.rows;
        }
    }
}else if (url.includes("/util/update") && obj.data) {
    obj.data.operation_float = [];
    if (obj.data.ad_black_list) {
        delete obj.data.ad_black_list;
    }

    if (obj && obj.data && obj.data.operation_float) {
        delete obj.data.operation_float;
    }

    if (obj.data.haojia_widget) {
        delete obj.data.haojia_widget;
    }
}else if (url.includes("/util/loading") && obj && obj.data) {
    delete obj.data;
}else if (url.includes("/home/list") && obj.data.banner_v2) {
    delete obj.data.banner_v2;
}else if (url.includes("/home") && url.includes("homepage-api")) {
    obj.data.component = obj.data.component.filter((item) =>
        item.zz_type === "circular_banner" || item.zz_type === "fixed_banner" || item.zz_type === "filter" || item.zz_type === "list"
    );
    fixPos(obj.data.component);
    if(obj.data && obj.data.functions){
        obj.data.functions = obj.data.functions.filter((item) => item.type === "message");
    fixPos(obj.data.functions);
    }
}else if (url.includes("/publish/get_bubble") && obj.data) {
    delete obj.data;
}else if (url.includes("/app/home") && obj.data) {
    if (obj.data) {
        obj.data = obj.data.filter((item) => item.id === "40" || item.id === "20");
        fixPos(obj.data);
    }
}
if (obj && obj.data && obj.data.services) {
    obj.data.services = obj.data.services.filter((item) => item.type === "articel_manage" || item.type === "199794" || item.type === "199796");
    fixPos(obj.data.services);
}
if (obj && obj.data && obj.data.widget) {
    delete obj.data.widget;
}
if (obj && obj.data && obj.data.operation_float_screen) {
    delete obj.data.operation_float_screen;
}
if (obj?.data?.rows?.length > 0) {
    obj.data.rows = obj.data.rows.filter(
        (i) => !(i?.hasOwnProperty("ad_banner_id") || ["ad_campaign_id_", "ad_campaign_name", "abs_position"]?.includes(i?.ad))
    );
}

body = JSON.stringify(obj);
$done({body});