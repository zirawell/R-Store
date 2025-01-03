/********************************
NGA CheckIn

脚本名称：NGA签到
脚本兼容：Surge, QuantumultX
脚本作者：@ClydeTime
更新日期：2022-12-9
脚本来源：https://raw.githubusercontent.com/ClydeTime/Surge/main/Script/Task/nga.js
脚本说明：
打开NGA玩家社区app,点击任务按钮，自动获取cookie
如通知成功获取cookie, 则可以使用此签到脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名, 以免产生不必要的MITM.
脚本将在每天上午8点40执行, 您可以修改执行时间.

------------------ Surge 配置 -----------------

[MITM]
hostname = ngabbs.com

[Script]
NGA-Cookie = type=http-request,pattern=^https?:\/\/ngabbs.com\/nuke.php$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/nga.js

NGA-签到 = type=cron,cronexp=40 8 * * *,timeout=60,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/nga.js,script-update-interval=0

-------------- Quantumult X 配置 --------------

[mitm]
hostname = ngabbs.com

[rewrite_local]
# NGA-Cookie
^https?:\/\/ngabbs.com\/nuke.php$ url script-request-body https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/nga.js

[task_local]
# NGA-签到
40 8 * * * https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/nga.js, tag=NGA-签到, enabled=true

********************************/

const $ = new Env("NGA");
const name = "nga";
const config = {
  cookie: "",
  contentType: "",
  userAgent: "",
  body: ""
};

!(async () => {
  if (typeof $request != "undefined") {
    GetCookie();
    $.done();
  } else {
    console.log("- 任务正在进行，请耐心等待");
    signNGA();
  }
})()

function GetCookie() {
  if ($request.body.includes("------WebKitForm")) {
	const cookie = typeof $request.headers["Cookie"]=='undefined' ? $request.headers["cookie"] : $request.headers["Cookie"];
	const contentType = typeof $request.headers["Content-Type"]=='undefined' ? $request.headers["content-type"] : $request.headers["Content-Type"];
	const userAgent = typeof $request.headers["User-Agent"]=='undefined' ? $request.headers["user-agent"] : $request.headers["User-Agent"];
	const body = $request.body;
	var obj = FormDataToObject(body, contentType);
  	if (obj["__lib"] === "mission" && obj["__act"] === "get_default") {
      console.log("- 正在获取cookie，请稍后");
  	  $.setdata(cookie, name + "_cookie");
  	  $.setdata(contentType, name + "_contentType");
  	  $.setdata(userAgent, name + "_userAgent");
  	  var obj = FormDataToObject(body, contentType);
  	  $.setdata(JSON.stringify(obj), name + "_body");
  	  $.content = `获取cookie: 成功! `;
  	  $.msg(name, "", $.content);
  	}
  }
}

async function signNGA(){
  config.cookie = $.getdata(name + "_cookie");
  config.contentType = $.getdata(name + "_contentType");
  config.userAgent = $.getdata(name + "_userAgent");
  config.body = $.getdata(name + "_body");
  if (!config.cookie || !config.contentType || !config.userAgent || !config.body) {
    $.msg(name, "请更新脚本并重新获取Cookie", "");
  } else {
      await checkin();
      const mids = await missions();
      for (const mid of mids) {
        await checkInCountAdd(mid);
      }
  }
  $.done();
}


async function checkin() {
  const newBody = { ...JSON.parse(config.body) };
  newBody["__lib"] = "check_in";
  newBody["__act"] = "check_in";
  const options = {
    url: "https://ngabbs.com/nuke.php",
    headers: {
      "Content-Type": config.contentType,
      Cookie: config.cookie,
      "User-Agent": config.userAgent,
    },
    body: ObjectToFormData(newBody, config.contentType)
  };
  return await $.http.post(options).then(
    (response) => {
      if (response.status === 200) {
        const result = JSON.parse(response.body);
        if (result.error) {
          $.msg(name, "刮墙失败", result.error.join(";"));
        } else if (result.data) {
          const message = result.data[0];
          const continued = result.data[1].continued;
          const sum = result.data[1].sum;
          $.msg(name, message, `连续刮墙${continued}天，累计刮墙${sum}天`);
        }
      }
    },(reason) => {
      $.logErr(reason.err, reason);
      $.msg(name, "刮墙失败，详细参见日志", reason.err);
  });
}

async function missions() {
    const newBody = { ...JSON.parse(config.body) };
    newBody["__lib"] = "mission";
    newBody["__act"] = "get_default";
    newBody["get_success_repeat"] = "1";
    newBody["no_compatible_fix"] = "1";
    const options = {
      url: "https://ngabbs.com/nuke.php",
      headers: {
        "Content-Type": config.contentType,
        Cookie: config.cookie,
        "User-Agent": config.userAgent,
      },
      body: ObjectToFormData(newBody, config.contentType),
    };

    return await $.http.post(options).then(
      (response) => {
      const result = JSON.parse(response.body);
        const mids = result.data[0].map((d) => d.id);
        return mids;
      }, (reason) => {
        $.logErr(reason.err, reason);
        return [];
    });
}

async function checkInCountAdd(mid) {
    const newBody = { ...JSON.parse(config.body) };
    newBody["__lib"] = "mission";
    newBody["__act"] = "checkin_count_add";
    newBody["no_compatible_fix"] = "1";
    newBody["mid"] = mid;
    const options = {
      url: "https://ngabbs.com/nuke.php",
      headers: {
        "Content-Type": config.contentType,
        Cookie: config.cookie,
        "User-Agent": config.userAgent,
      },
      body: ObjectToFormData(newBody, config.contentType),
    };

    await $.http.post(options).then(
      (response) => {
        console.log(`mission:${mid}`);
    }, (reason) => {
      $.logErr(reason.err, reason);
    });
}

function FormDataToObject(form, contentType) {
  const boundary = contentType.split("; ")[1].split("=")[1];
  const splitBoundary = `--${boundary}`;
  const index = form.indexOf(splitBoundary);
  form = form.substr(index);
  const lastIndex = form.lastIndexOf(splitBoundary);
  form = form.substring(0, lastIndex);
  const array = compact(form.split(splitBoundary)).map((a) => {
    const entity = compact(a.split("\r\n"));
    const regex = /Content-Disposition: form-data; name="(.*)"/;
    var matchs = regex.exec(entity[0]);
    return {
      name: matchs[1],
      value: entity[1],
    };
  });

  function compact(array) {
    let resIndex = 0;
    const result = [];
    if (array == null) {
      return result;
    }
    for (const value of array) {
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  const result = {};
  array.forEach((a) => {
    result[a.name] = a.value;
  });
  return result;
}

function ObjectToFormData(object, contentType) {
  const boundary = contentType.split("; ")[1].split("=")[1];
  const splitBoundary = `--${boundary}`;
  var body = `${splitBoundary}\r\n`;
  const array = [];
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      array.push({
        name: key,
        value: object[key],
      });
    }
  }
  var data = array.map((element) => {
    var name = `Content-Disposition: form-data; name="${element.name}"`;
    var entityString = `${name}\r\n\r\n${element.value}`;
    return entityString;
  });
  body = `${body}${data.join(
    `\r\n${splitBoundary}\r\n`
  )}\r\n${splitBoundary}--\r\n`;
  return body;
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,n]=i.split("@"),a={url:`http://${n}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),n=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(n);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:n}=t,a=s.decode(n,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:n}=t,a=i.decode(n,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(!this.isMute){if(this.isSurge()||this.isLoon()){$notification.post(e,s,i,o(r))}else if(this.isQuanX()){$notify(e,s,i,o(r))}}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}