/********************************
Dianping Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.
Works for version 11.28.3 and below. Version ID: 870198258

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/D/大众点评/rewrite/dianPing.conf

********************************/

const url = $request.url;
if(url.includes("/dpmobile")){
  const header = $request.headers;
  const resp = {};
  const traceKey = Object.keys(header).find(key => /^m-(shark-)?traceid$/i.test(key));
  const headopt = traceKey ? header[traceKey] : null;
  
  if (headopt) {
    $done({ body:"", headers:"", status: "HTTP/1.1 204 No Content" });
  } else{
    $done({});
  }
}else if(url.includes("/picassovc")){
  if (!$response.body) $done({});
  let body = $response.body;
  body = body.replace(/function WedgetCard/g,'function WedgetCard0');
  $done({ body });
}