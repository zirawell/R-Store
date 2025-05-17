/********************************
TencentVideo CheckIn

脚本名称：腾讯视频签到
脚本兼容：Surge, QuantumultX
脚本作者：@ClydeTime
更新日期：2024/07/04
脚本来源：https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Script/Task/videoqq.js
脚本说明：
- 进入腾讯视频app，点击右下角我的，点击头像下的视频VIP进入会员中心看到系统消息提示获取txspCookie成功即可
- 浏览器进入腾讯视频网页版，登录后切换成桌面版，刷新网页看到系统消息提示获取txspRefreshCookie、txspRefreshBody成功即可
- 获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM

------------------ Surge 配置 -----------------

[MITM]
hostname = vip.video.qq.com, pbaccess.video.qq.com

[Script]
腾讯视频-Cookie-1 = type=http-request,pattern=^https?:\/\/vip\.video\.qq\.com\/rpc\/trpc\.new_task_system\.task_system\.TaskSystem\/ReadTaskList\?,requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js
腾讯视频-Cookie-2 = type=http-request,pattern=^https?:\/\/pbaccess\.video\.qq\.com\/trpc\.videosearch\.hot_rank\.HotRankServantHttp\/HotRankHttp,requires-body=0,max-size=0,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js
腾讯视频-Cookie-3 = type=http-request,pattern=^https?:\/\/pbaccess\.video\.qq.\com\/trpc\.video_account_login\.web_login_trpc\.WebLoginTrpc\/NewRefresh,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js

腾讯视频-签到 = type=cron,cronexp=0 5 * * *,script-path=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js,timeout=15,wake-system=1

-------------- Quantumult X 配置 --------------

[mitm]
hostname = vip.video.qq.com, pbaccess.video.qq.com

[rewrite_local]
# 腾讯视频-Cookie-1
^https?:\/\/vip\.video\.qq\.com\/rpc\/trpc\.new_task_system\.task_system\.TaskSystem\/ReadTaskList\? url script-request-header https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js
# 腾讯视频-Cookie-2
^https?:\/\/pbaccess\.video\.qq\.com\/trpc\.videosearch\.hot_rank\.HotRankServantHttp\/HotRankHttp url script-request-header https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js
# 腾讯视频-Cookie-3
^https?:\/\/pbaccess\.video\.qq.\com\/trpc\.video_account_login\.web_login_trpc\.WebLoginTrpc\/NewRefresh url script-request-body https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js

[task_local]
# 腾讯视频-签到
0 5 * * * https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Scripts/CheckIn/txtv.js, tag=腾讯视频-签到, img-url=https://raw.githubusercontent.com/zirawell/R-Store/main/Res/Icon/App/txtv.png, enabled=true

********************************/

const $ = new Env("腾讯视频");

let txspCookie = $.getItem('txspCookie') || "";
let txspRefreshCookie = $.getItem('txspRefreshCookie') || "";
let txspRefreshBody = $.getItem('txspRefreshBody') || "";
let dayOfGetMonthTicket = $.getItem('dayOfGetMonthTicket') || 1;
let isSkipTxspCheckIn = ($.getItem('isSkipTxspCheckIn') !== undefined && $.getItem('isSkipTxspCheckIn') !== '') ? JSON.parse($.getItem('isSkipTxspCheckIn')) : false;

let currentVersion = "v1.0.3", latestVersion = "";
let nickname = "";
let isTxspVip = false, isTxspSvip = false, isTxSportsVip = false, isTxSportsSvip = false;
let endTime = "", svipEndTime = "", txSportsEndTime = "", txSportsSvipEndTime = "";
let level = "", txSportsLevel = "";
let score = "", txSportsScore = "";
let month_received_score = "", month_limit = "";
let isTxspCheckIn = "", isTxSportsCheckIn = "";
let message = "";
$.taskInfo = "";

if ((isGetCookie = typeof $request !== `undefined`)) {
	getCookie();
	$.done();
} else if (!txspCookie){
	$.msg($.name, "您未获取腾讯视频Cookie", "点击此条跳转到腾讯视频获取Cookie", { 'open-url': 'tenvideo://', 'media-url': 'https://raw.githubusercontent.com/WowYiJiu/Personal/main/icon/videoqq.png' });
	$.done();
} else {
	!(async () => {
		await getVersion();
		$.log(`\n当前版本：${currentVersion}  最新版本：${latestVersion}\n`);
		$.version = `\n当前版本：${currentVersion}  最新版本：${latestVersion}\n`;
		if(!txspCookie){
			$.log(`未填写txspCookie环境变量`);
			return;
		}

		$.log("---- 开始 刷新vusession ----");
		await refresh_vusession();
		$.log(`--------- 结束 ---------\n`);
		$.log(`用户昵称：${nickname}`);
		await getVipInfo();
		if (isTxspVip){
			$.log(`---- 腾讯视频VIP信息 ----`);
			if (isTxspSvip){
				$.log(`当前是腾讯视频SVIP`);
			} else {
				$.log(`当前是腾讯视频VIP`);
			}
			$.log(`当前等级：${level}`);
			$.log(`当前成长：${score}`);
			if (isTxspSvip){
				$.log(`SVIP到期时间：${svipEndTime}`);
			}
			$.log(`VIP到期时间：${endTime}`);
			$.log(`--------- 结束 ---------\n`);
		}
		if (isTxSportsVip){
			$.log(`--- 腾讯体育VIP信息 ---`);
			if (isTxSportsSvip){
				$.log(`当前是腾讯体育超级VIP`);
			} else {
				$.log(`当前是腾讯体育VIP`);
			}
			$.log(`当前等级：${txSportsLevel}`);
			$.log(`当前成长：${txSportsScore}`);
			if (isTxSportsSvip){
				$.log(`SVIP到期时间：${txSportsSvipEndTime}`);
			}
			$.log(`VIP到期时间：${txSportsEndTime}`);
			$.log(`--------- 结束 ---------\n`);
		}
		if (isTxspVip){
			$.log(`---- 开始 腾讯视频签到 ----`);
			if (isSkipTxspCheckIn){
				$.log(`当前设置为不进行腾讯视频签到，跳过`);
			} else {
				await readTxspTaskList();
				await waitRandom(1000, 2000);
				if (month_received_score === month_limit){
					$.log(`本月活跃任务已满${month_limit}V力值，下个月再来哦`);
				} else if (isTxspCheckIn){
					$.log(`今天已签到, 明日再来吧`);
				} else {
					await txspCheckIn();
					await waitRandom(1000, 2000);
					await txVideoDownTasks();
					await waitRandom(1000, 2000);
				}
			}
			$.log(`--------- 结束 ---------\n`);
		}
		if (isTxSportsVip){
			$.log(`---- 开始 腾讯体育签到 ----`);
			await readTxSportsTaskList();
			await waitRandom(1000, 2000);
			if (isTxSportsCheckIn){
				$.log(`今天已签到, 明日再来吧`);
			} else {
				await txSportsCheckIn();
				await waitRandom(1000, 2000);
			}
			$.log(`--------- 结束 ---------\n`);
			$.log(`---- 开始 领取每日球票 ----`);
			await getDayTicket();
			await waitRandom(1000, 2000);
			$.log(`--------- 结束 ---------\n`);
			$.log(`---- 开始 领取每月球票 ----`);
			var today = new Date();
			var date = today.getDate();
			if (date !== dayOfGetMonthTicket){
				$.log(`目标日期：${dayOfGetMonthTicket}号`);
				$.log(`今天是${date}号`);
				$.log(`跳过`);
			} else {
				$.log(`目标日期：${dayOfGetMonthTicket}号`);
				$.log(`今天是${date}号`);
				await getMonthTicket();
			}
			$.log(`--------- 结束 ---------\n`);
		}
	 await SendMsg();
	})()
		.catch((e) => $.logErr(e))
		.finally(() => $.done());
}

async function refresh_vusession() {
		let opt = {
			url: `https://pbaccess.video.qq.com/trpc.video_account_login.web_login_trpc.WebLoginTrpc/NewRefresh`,
			headers: {
				cookie: txspRefreshCookie,
				origin: 'https://v.qq.com',
				referer: 'https://v.qq.com/',
				'Content-Type': 'application/json'
			},
			body: txspRefreshBody
		};
		return await $.fetch(opt).then(response => {
			try {
				const obj = $.toObj(response.body)
				if (obj.data.errcode === 0) {
					let vqq_vusession = obj.data.vusession;
					nickname = decodeURIComponent(obj.data.nick);
						if (txspCookie.match(/main_login=([^;]*)/)[1] === "qq"){
							txspCookie = txspCookie.replace(/(vqq_vusession=)[^;]*/, `$1${vqq_vusession}`);
						} else if(txspCookie.match(/main_login=([^;]*)/)[1] === "wx"){
							txspCookie = txspCookie.replace(/(vusession=)[^;]*/, `$1${vusession}`);
						}
					$.log("vusession成功")
				} else {
					$.log("vusession失败");
				}
			} catch (e) {
				$.logErr(e, response)
			}
		})
}

async function getVipInfo() {
		let opt = {
			url: `https://vip.video.qq.com/rpc/trpc.query_vipinfo.vipinfo.QueryVipInfo/GetVipUserInfoH5`,
			headers: {
				cookie: txspCookie,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({"geticon":1,"viptype":"svip|sports|nfl","platform":5})
		};
		return await $.fetch(opt).then(response => {
			try {
				const obj = $.toObj(response.body)
				if (!obj.servicetype) {
					throw new Error(`Cookie已失效`);
				} else {
					if (obj.vip === 1){
						isTxspVip = true;
						endTime = obj.endTime;
						level = obj.level;
						score = obj.score;
					}
					if (obj.svip_info.vip === 1){
						isTxspSvip = true;
						svipEndTime = obj.svip_info.endTime;
					}
					if (obj.sports.vip.vip === 1){
						isTxSportsVip = true;
						txSportsEndTime = obj.sports.vip.endTime;
						txSportsLevel = obj.sports.vip.level;
						txSportsScore = obj.sports.vip.score;
					}
					if (obj.sports.svip.vip === 1){
						isTxSportsSvip = true;
						txSportsSvipEndTime = obj.sports.svip.endTime;
					}
				}
			} catch (e) {
				$.logErr(e, response)
			}
		})
}

/**
 * 获取腾讯视频任务列表
 * @async
 * @function readTxspTaskList
 * @returns
 */
async function readTxspTaskList() {
		let opt = {
			url: `https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/ReadTaskList?rpc_data=%7B%22business_id%22:%221%22,%22platform%22:5%7D`,
			headers: {
				referer: "https://film.video.qq.com/x/grade/?ptag=user.apho&ovscroll=0&hidetitlebar=1&aid=V0$$1:0$2:7$3:8.11.01.25068$4:0$8:4&isDarkMode=1&uiType=REGULAR",
				cookie: txspCookie
			}
		};
		return await $.fetch(opt).then(response => {
			try {
				const obj = $.toObj(response.body)
				var code = obj.ret;
				let task_maintitle = "";
				if (code === 0) {
					month_received_score = obj.limit_info.month_received_score;
					month_limit = obj.limit_info.month_limit;
					let taskList = obj.task_list;
					let txspCheckInTask = taskList && taskList.find(task => task.task_maintitle === "VIP会员每日签到");
					isTxspCheckIn = txspCheckInTask.task_status;
				}  else {
					$.log(`获取腾讯视频任务列表失败，异常详细信息如下\n${data}`);
				}
			} catch (e) {
				$.logErr(e, response)
			}
		})
}


/**
 * 腾讯视频签到领取V力值
 * @async
 * @function txspCheckIn
 * @returns
 */
async function txspCheckIn() {
		let opt = {
			url: `https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/CheckIn?rpc_data==%7B%7D`,
			headers: {
				Referer: "https://film.video.qq.com/x/grade/?ptag=user.apho&ovscroll=0&hidetitlebar=1&aid=V0$$1:0$2:7$3:8.11.01.25068$4:0$8:4&isDarkMode=1&uiType=REGULAR",
				Cookie: txspCookie
			}
		};
		return await $.fetch(opt).then(response => {
			try {
				const obj = $.toObj(response.body);
				var code = obj.ret;
				let message;
				if (code === 0 && obj.check_in_score != undefined) {
					message = `签到成功：获得${obj.check_in_score}V力值`
					$.log(message);
				} else if (code === -2002) {
					message = `今天已签到, 明日再来吧`
					$.log(message);
				} else {
					message = `签到失败, 异常详细信息请查看日志\n`;
					$.log(`签到失败，异常详细信息如下\n${obj.msg}`);
				}
				$.taskInfo += message + `\n`;
			} catch (e) {
				$.logErr(e, response)
			}
		})
}

/**
 * 观看60分钟任务签到请求
 * @async
 * @function txVideoDownTasks
 * @returns
 */
async function txVideoDownTasks() {
	let opt = {
		url: `https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/ProvideAward?rpc_data=%7B%22task_id%22:1%7D`,
		headers: {
			referer: "https://film.video.qq.com/x/grade/?ptag=user.apho&ovscroll=0&hidetitlebar=1&aid=V0$$1:0$2:7$3:8.11.01.25068$4:0$8:4&isDarkMode=1&uiType=REGULAR",
			cookie: txspCookie
		}
	};
	return await $.fetch(opt).then(response => {
		try {
			const obj = $.toObj(response.body)
			var code = obj.ret;
			let check_in_score = obj.check_in_score;
			let message;
			if (code === 0 && check_in_score != undefined) {
				message = "观看任务签到成功：签到分数：" + check_in_score + "分 🎉" + "\n";
				$.log(message);
			} else if (code === -2002) {
				message = "观看任务签到成功：您已签到 ‼️‼️" + "\n";
				$.log(message);
			} else if (code === -2003) {
				message = "观看任务签到失败：任务未完成 ‼️‼️" + "\n";
				$.log(message);
			} else if (code === -2007) {
				message = "观看任务签到失败：非会员无法签到";
				$.log(message);
			} else {
				message = "观看任务签到失败：请查看控制台输出";
				$.log(`观看任务签到失败：异常详细信息如下\n${obj.msg}`);
			}
			$.taskInfo += message + `\n`;
		} catch (e) {
			$.logErr(e, response)
		}
	})
}


/**
 * 获取腾讯体育任务列表
 * @async
 * @function readTxSportsTaskList
 * @returns
 */
async function readTxSportsTaskList() {
	let opt = {
		url: `https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/ReadTaskList?rpc_data={"business_id":3,"channel_id":4,"platform":5}`,
		headers: {
			Referer: "https://film.video.qq.com/x/sports-grade/?ovscroll=0&hidetitlebar=1&immersive=1",
			Cookie: txspCookie,
		},
	};
	return await $.fetch(opt).then(response => {
		try {
			const obj = $.toObj(response.body)
			var code = obj.ret;
			let task_maintitle = "";
			if (code === 0) {
				let taskList = obj.task_list;
				let txSportsCheckInTasks = taskList && taskList.find(task => task.task_maintitle === "每日签到");
				isTxSportsCheckIn = txSportsCheckInTasks.task_status;
			}  else {
				$.log(`获取腾讯视频任务列表失败，异常详细信息如下\n${data}`);
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

/**
 * 腾讯体育签到领取热爱值
 * @async
 * @function txSportsCheckIn
 * @returns
 */
async function txSportsCheckIn() {
	let opt = {
		url: `https://vip.video.qq.com/rpc/trpc.new_task_system.task_system.TaskSystem/CheckIn?rpc_data={"task_id":8006}`,
		headers: {
			Referer:
				"https://film.video.qq.com/x/sports-grade/?ovscroll=0&hidetitlebar=1&immersive=1",
			Cookie: txspCookie,
		},
	};
	return await $.fetch(opt).then(response => {
		try {
			var code = obj.ret;
			let message;
			if (code === 0 && obj.check_in_score != undefined) {
				message = `签到成功：获得${obj.check_in_score}热爱值`;
				$.log(message);
			} else if (code === -2002) {
				message = `今天已签到, 明日再来吧`
				$.log(message);
			} else {
				message = `签到失败, 异常详细信息请查看日志\n`
				$.log(`签到失败，异常详细信息如下\n${opt.msg}`);
			}
			$.taskInfo += message + `\n`;
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

/**
 * 领取每日球票
 * @async
 * @function getDayTicket
 * @returns
 */
async function getDayTicket() {
	let opt = {
		url: "https://activity.video.qq.com/fcgi-bin/asyn_activity?otype=xjson&act_id=118561&module_id=158089&type=90&option=5",
		headers: {
			Origin: "https://film.video.qq.com",
			Referer: "https://film.video.qq.com/x/sports-vip-channel/?from=tab",
			Cookie: txspCookie,
		},
	};
	return await $.fetch(opt).then(response => {
		try {
			const obj = $.toObj(response.body)
			var code = obj.ret;
			let message;
			if (code === 0) {
				message = `领取每日球票成功`;
				$.log(message);
			} else if (code === -2021) {
				message = `每日球票已领取, 明日再来吧`;
				$.log(message);
			} else {
				message = `领取每日球票失败，异常详细信息请查看日志\n`;
				$.log(`领取每日球票失败，异常详细信息如下\n${obj.msg}`);
			}
			$.taskInfo += message + `\n`;
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

/**
 * 领取每月球票
 * @async
 * @function getMonthTicket
 * @returns
 */
async function getMonthTicket() {
	let opt = {
		url: "https://activity.video.qq.com/fcgi-bin/asyn_activity?otype=xjson&act_id=118561&module_id=165163&type=100160&option=100",
		headers: {
			Origin: "https://film.video.qq.com",
			Referer: "https://film.video.qq.com/x/sports-vip-channel/?from=tab",
			Cookie: txspCookie,
		},
	};
	return await $.fetch(opt).then(response => {
		try {
			const obj = $.toObj(response.body)
			var code = obj.ret;
			let message;
			if (code === 0) {
				message = `领取每月球票成功`
				$.log(message);
			} else if (code === -903) {
				message = `每月球票已领取，下个月再来哦`
				$.log(message);
			} else {
				message = `领取每月球票失败，异常详细信息请查看日志\n`
				$.log(`领取每月球票失败，异常详细信息如下\n${obj.msg}`);
			}
			$.taskInfo += message + `\n`;
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

function getCookie() {
	if($request && $request.method !=`OPTIONS` && $request.url.match(/\/rpc\/trpc\.new_task_system\.task_system\.TaskSystem\/ReadTaskList/)){
		let txsp = $request.headers["Cookie"] || $request.headers["cookie"];
		if (txsp) {
			if (typeof txspCookie === "undefined" || (txspCookie && txspCookie.length === 0)) {
				$.setdata(txsp, "txspCookie");
				$.log(`Cookie: ${txsp}`);
				$.msg($.name, "🎉 Cookie写入成功", "不用请自行关闭重写!");
			} else if (txsp !== txspCookie) {
				$.setdata(txsp, "txspCookie");
				$.log(`Cookie: ${txsp}`);
				$.msg($.name, "🎉 Cookie更新成功", "不用请自行关闭重写!");
			} else {
				$.msg($.name, "⚠️ Cookie未变动 跳过更新", "不用请自行关闭重写!");
			}
		} else {
			$.msg($.name, "⚠️ Cookie未找到", "不用请自行关闭重写!");
		}
	}
	if($request && $request.method !=`OPTIONS` && $request.url.match(/\/trpc\.videosearch\.hot_rank\.HotRankServantHttp\/HotRankHttp/)){
		let refreshCookie = $request.headers["Cookie"] || $request.headers["cookie"];
		if (refreshCookie) {
			if (typeof txspRefreshCookie === "undefined" || (txspRefreshCookie && txspRefreshCookie.length === 0)) {
				$.setdata(refreshCookie, "txspRefreshCookie");
				$.log(`Cookie: ${refreshCookie}`);
				$.msg($.name, "🎉 refreshCookie写入成功", "不用请自行关闭重写!");
			} else if (refreshCookie !== txspRefreshCookie) {
				$.setdata(refreshCookie, "txspRefreshCookie");
				$.log(`Cookie: ${refreshCookie}`);
				$.msg($.name, "🎉 refreshCookie更新成功", "不用请自行关闭重写!");
			} else {
				$.msg($.name, "⚠️ refreshCookie未变动 跳过更新", "不用请自行关闭重写!");
			}
		} else {
			$.msg($.name, "⚠️ refreshCookie未找到", "不用请自行关闭重写!");
		}
	}
	if($request && $request.method !=`OPTIONS` && $request.url.match(/\/trpc\.video_account_login\.web_login_trpc\.WebLoginTrpc\/NewRefresh/)){
		let refreshBody = $request.body;
		if (refreshBody){
			if (typeof txspRefreshBody === "undefined" || (txspRefreshBody && txspRefreshBody.length === 0)) {
				$.setdata(refreshBody, "txspRefreshBody");
				$.log(`refreshBody: ${refreshBody}`);
				$.msg($.name, "🎉 refreshBody写入成功", "不用请自行关闭重写!");
			} else if (refreshBody !== txspRefreshBody) {
				$.setdata(refreshBody, "txspRefreshBody");
				$.log(`refreshBody: ${refreshBody}`);
				$.msg($.name, "🎉 refreshBody更新成功", "不用请自行关闭重写!");
			} else {
				$.msg($.name, "⚠️ refreshBody未变动 跳过更新", "不用请自行关闭重写!");
			}
		}
	}
}

async function getVersion() {
    const timeoutMs = 10000;
    const opt = { 
        url: "https://github.wowyijiu.today/https://raw.githubusercontent.com/WowYiJiu/Personal/main/Script/tenvideo.js",
        timeout: timeoutMs 
    };
		let data =  await $.fetch(opt).then(response => {
			try {
				if (response) {
					return response
				}else {
					return "undefined"
				}
			} catch (e) {
				$.logErr(e, response)
			}
		})
		data = $.toStr(data)
    const versionInfo = data.match(/@version\s+(v\d+\.\d+\.\d+)/);
	if (versionInfo) {
		latestVersion = versionInfo[1];
	} else {
		latestVersion = "undefined";
	}
    return latestVersion;
}

async function SendMsg() {
	$.msg($.name, "", `${$.version}\n${$.taskInfo}`);
}

async function waitRandom(min, max) {
	var time = getRandomInt(min, max);
	await $.wait(time);
}

// 随机生成整数
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 提取Cookie的指定字段
function extractValues(str, keys) {
	let results = keys.map((key) =>
		str.split("; ").find((s) => s.startsWith(key + "="))
	);
	return results.join(";");
}



/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;"POST"===e&&(s=this.post);const i=new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}));return t.timeout?((t,e=1e3)=>Promise.race([t,new Promise(((t,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),e)}))]))(i,t.timeout):i}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}