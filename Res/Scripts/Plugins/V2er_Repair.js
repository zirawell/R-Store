/********************************
V2er Repair Plugin - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/refs/heads/main/Rule/QuanX/Plugin/v2er.conf

********************************/

const resp = {};
const url = $request.url;
if (!$response.body) $done({});
var parser = new DOMParser();
var doc = parser.parseFromString($response.body, "text/html");

if (url.includes("/member")) {
  const flexDiv = doc.querySelector('div.flex-one-row.gap10');
  if (flexDiv) {
      const h1Element = flexDiv.querySelector('h1');
      const parentTd = flexDiv.closest('td');
      if (h1Element && parentTd) {
          parentTd.insertBefore(h1Element, flexDiv);
          if (flexDiv.children.length === 0 && flexDiv.textContent.trim() === '') {
              flexDiv.remove();
          }
      }
  }
} else if (url.includes("/mission/daily")) {
  const cellWithLoginInfo = Array.from(doc.querySelectorAll('.cell'))
  .find(cell => cell.textContent.includes('已连续登录'));
  if (cellWithLoginInfo) {
      const frDiv = cellWithLoginInfo.querySelector('.fr');
      if (frDiv) {
          frDiv.remove();
      }
  }
  const spanElement = cellWithLoginInfo.querySelector('span');
   if (spanElement) {
      const textNode = doc.createTextNode(spanElement.textContent);
      spanElement.parentNode.replaceChild(textNode, spanElement);
   }
}
resp.body = doc.documentElement.outerHTML;
$done(resp);
