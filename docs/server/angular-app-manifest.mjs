
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/fleetpro/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 5792, hash: 'e799521ade1759f495fd5c4e7fbdb4acdf3d06e799568accc7098f45ee320b70', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1068, hash: 'fee696c9eba15b6cfaccb985f153a9a5189035464bf3ac35588e0b26344ad567', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-FEERN22D.css': {size: 392284, hash: '59SKzocrCq0', text: () => import('./assets-chunks/styles-FEERN22D_css.mjs').then(m => m.default)}
  },
};
