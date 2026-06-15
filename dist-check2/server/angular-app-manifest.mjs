
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 483, hash: '3bb5776f5378e93ea934e5451692f8144f131945332663538996d48ecc0d5030', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1023, hash: '9b6b47fd6f7783571f1778242ad47de205839dd8d1ae39f72d1a8883d9f8fede', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)}
  },
};
