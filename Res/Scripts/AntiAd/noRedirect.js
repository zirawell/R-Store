/********************************
Skip Redirect Pages - Version 1.0
Checkout Source - https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/noRedirect.js
Please note that you may need to reinstall app for script to work.


********************************/

const jianshur = /https:\/\/links\.jianshu\.com\/go\?to=(.*)/;
const jianshur2 = /https:\/\/www\.jianshu\.com\/go-wild\?ac=\d&url=(.*)/;
const zhihur = /https:\/\/link\.zhihu\.com\/\?target=(.*)/;
const weibor = /https?:\/\/weibo\.cn\/sinaurl\?(.*&)?(u|toasturl|goto)=(.*?)(&.*)?$/;
const weibor2 = /https:\/\/shop\.sc\.weibo\.com\/h5\/jump\/error\?(.*&)?url=(.*)/;

const oldurl = $request.url;
let newurl = "";
if (oldurl.indexOf("links.jianshu.com/go") !== -1) {
  newurl = decodeURIComponent(jianshur.exec(oldurl)[1]);
} else if (oldurl.indexOf("www.jianshu.com/go") !== -1) {
  newurl = decodeURIComponent(jianshur2.exec(oldurl)[1]);
} else if (oldurl.indexOf("link.zhihu.com/?target") !== -1) {
  newurl = decodeURIComponent(zhihur.exec(oldurl)[1].replace(/&source=.*/, ""));
} else if (oldurl.indexOf("weibo.cn/sinaurl") !== -1) {
  newurl = decodeURIComponent(weibor.exec(oldurl)[3]);
} else if (oldurl.indexOf("shop.sc.weibo.com/h5/jump/error") !== -1) {
  newurl = decodeURIComponent(weibor2.exec(oldurl)[2]);
} else if (oldurl.indexOf("sinaurl.cn") !== -1 || oldurl.indexOf("t.cn") !== -1) {
  let headers = $response.headers;
  newurl = headers.Location || headers.location;
}

newurl = newurl.indexOf("http") == 0 ? newurl : "http://" + newurl;
const isQuanX = typeof $notify != "undefined";
const isLoon = typeof $loon != "undefined";
const newstatus = isQuanX ? "HTTP/1.1 302 Temporary Redirect" : 302;
const noredirect = isLoon
    ? {status: newstatus, body: "loon", headers: {Location: newurl}}
    : {status: newstatus, headers: {Location: newurl}};

let resp = isQuanX ? noredirect : {response: noredirect};
resp = typeof $response != "undefined" ? noredirect : resp;
$done(resp);
