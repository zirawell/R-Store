/********************************
V2er Repair Plugin - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/refs/heads/main/Rule/QuanX/Plugin/v2er.conf

********************************/

const resp = {};
if (!$response.body) $done({});
var parser = new DOMParser();
var doc = parser.parseFromString($response.body, "text/html");
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
resp.body = doc.documentElement.outerHTML;
$done(resp);
