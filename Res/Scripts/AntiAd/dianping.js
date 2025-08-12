/********************************
Dianping Remove Ads - Version 1.0
Please note that you may need to reinstall app for script to work.
Works for version 11.28.3 and below. Version ID: 870198258

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/D/大众点评/rewrite/dianping.conf

********************************/

const url = $request.url;
if (url.includes("/dpmobile")) {
  const header = $request.headers;
  const resp = {};
  const traceKey1 = Object.keys(header).find(key => /^m-(shark-)?traceid$/i.test(key));
  const traceKey2 = Object.keys(header).find(key => /^ai|dt|al|u/i.test(key));
  const headopt1 = traceKey1 ? header[traceKey1] : null;
  const headopt2 = traceKey2 ? header[traceKey2] : null;

  if (headopt1 && !headopt2) {
    $done({body: "", headers: "", status: "HTTP/1.1 204 No Content"});
  } else {
    $done({});
  }
} else if (url.includes("/picassovc")) {
  if (!$response.body) $done({});
  let body = $response.body;
  body = body.replace(/function WedgetCard/g, 'function WedgetCard0');
  $done({body});
}