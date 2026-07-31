const SCRIPT_ELEMENT_ID = 'cloudflare-web-analytics';
const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const BEACON_TOKEN = '8bd820928ece444fa93244e03e7ac4e6';

// Injected on demand (never present in the initial HTML) so the beacon is
// only ever requested once a visitor has consented to the performance
// category — the id guard keeps repeated consent updates from adding it twice.
export const loadCloudflareWebAnalytics = (): void => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SCRIPT_ELEMENT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ELEMENT_ID;
  script.type = 'module';
  script.src = BEACON_SRC;
  script.setAttribute(
    'data-cf-beacon',
    JSON.stringify({ token: BEACON_TOKEN }),
  );

  document.head.appendChild(script);
};
