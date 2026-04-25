/********************************
V2er Repair Plugin - Version 1.0
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/refs/heads/main/Rule/QuanX/Plugin/v2er.conf

Surge module link:
https://raw.githubusercontent.com/zirawell/R-Store/refs/heads/main/Rule/Surge/Plugin/v2er.sgmodule
********************************/

const resp = {};
const url = $request.url;
if (!$response.body) $done({});
var parser = new DOMParser();
var doc = parser.parseFromString($response.body, "text/html");
// 我的页解析异常修复
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
// 每日签到提示语修复
} else if (url.includes("/mission/daily")) {
  const cellWithLoginInfo = Array.from(doc.querySelectorAll('.cell'))
  .find(cell => cell.textContent.includes('已连续登录'));
  if (cellWithLoginInfo) {
      const frDiv = cellWithLoginInfo.querySelector('.fr');
      if (frDiv) {
          frDiv.remove();
      }
  }
// 帖子解析修复
} else if (url.includes("/t/")) {
  const header = doc.querySelector('#Wrapper .content .header');
  if (header) {
    const fr = header.querySelector('.fr');
    const flexRow = header.querySelector('.flex-one-row.gap10');
    if (fr && flexRow) {
      const breadcrumbDiv = flexRow.querySelector('div');
      if (breadcrumbDiv) {
        header.insertBefore(breadcrumbDiv, fr.nextSibling);
        while (breadcrumbDiv.firstChild) {
          header.insertBefore(breadcrumbDiv.firstChild, breadcrumbDiv);
        }
        breadcrumbDiv.remove();
      }
    }
  }
  // 评论解析修复
  doc.querySelectorAll('#Rightbar .box').forEach(box => box.remove());
  const proContainer = doc.querySelector('#pro-campaign-container');
  if (proContainer) proContainer.remove();
  const tbodies = doc.querySelectorAll('tbody');
  tbodies.forEach((tbody) => {
    const parent = tbody.parentNode;
    if (!parent) return;
    while (tbody.firstChild) {
      parent.insertBefore(tbody.firstChild, tbody);
    }
    parent.removeChild(tbody);
  });
}
resp.body = doc.documentElement.outerHTML;
$done(resp);
