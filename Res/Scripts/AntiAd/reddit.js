/********************************
Reddit Remove Ads - Version 1.0
Checkout Source - https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/reddit.js
Please note that you may need to reinstall app for script to work.

QuantumultX rewrite link:
https://raw.githubusercontent.com/zirawell/R-Store/main/Rule/QuanX/Adblock/App/R/reddit/rewrite/reddit.conf

********************************/

let body;
try {
  body = JSON.parse($response.body.replace(/"isNsfw":true/g, '"isNsfw":false'))
  if (body.data?.children?.commentsPageAds) {
    body.data.children.commentsPageAds = []
  }
  for (const [k, v] of Object.entries(body.data)) {
    if (v?.elements?.edges) {
      body.data[k].elements.edges = v.elements.edges.filter(
        i =>
          !['AdPost'].includes(i?.node?.__typename) &&
          !i?.node?.cells?.some(j => j?.__typename === 'AdMetadataCell') &&
          !i?.node?.adPayload
      );
    }
  }

} catch (e) {
  console.log(e);
} finally {
  $done(body ? {body: JSON.stringify(body)} : {});
}