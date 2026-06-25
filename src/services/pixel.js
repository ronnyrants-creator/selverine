'use strict';

/**
 * Builds the Meta/Facebook Pixel bootstrap that is injected into each HTML page
 * at serve time. The Pixel ID comes from env (FACEBOOK_PIXEL_ID / META_PIXEL_ID);
 * if it is empty, nothing is injected.
 *
 * The snippet:
 *   1. loads fbevents.js and initializes the pixel,
 *   2. fires PageView,
 *   3. exposes window.SELVERINE_PIXEL so the page script can fire
 *      ViewContent / InitiateCheckout / Purchase with deduplicated event IDs.
 */

const { config } = require('../config');

const PLACEHOLDER = '<!--FB_PIXEL-->';

function buildSnippet() {
  const pixelId = config.facebookPixelId;
  if (!pixelId) return ''; // gracefully inject nothing when unconfigured

  const cfg = {
    id: pixelId,
    currency: config.product.currency,
    productName: config.product.name,
    productId: config.product.id,
  };

  return `
<!-- Meta Pixel Code (injected from env FACEBOOK_PIXEL_ID) -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
window.SELVERINE_PIXEL = ${JSON.stringify(cfg)};
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
}

/**
 * Inject the pixel into an HTML string. Prefers replacing the explicit
 * placeholder; otherwise injects right before </head> (or </body>).
 */
function injectInto(html) {
  const snippet = buildSnippet();
  if (!snippet) {
    // remove the placeholder if present so it never ships as a literal comment
    return html.includes(PLACEHOLDER) ? html.replace(PLACEHOLDER, '') : html;
  }
  if (html.includes(PLACEHOLDER)) return html.replace(PLACEHOLDER, snippet);
  if (html.includes('</head>')) return html.replace('</head>', `${snippet}\n</head>`);
  if (html.includes('</body>')) return html.replace('</body>', `${snippet}\n</body>`);
  return html + snippet;
}

module.exports = { buildSnippet, injectInto, PLACEHOLDER };
