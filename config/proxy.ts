/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  /**
   * 本地开发直连后端:把 target 改成真实后端地址,然后用 `npm run start:no-mock`
   * (MOCK=none)启动即直连后端;默认 `npm run dev` 走前端 mock 网关。
   * 所有业务请求都是相对路径 `/api/v1/ontology/*`,无写死域名,换 URL 只需改这里。
   */
  dev: {
    '/api/': {
      // TODO: 替换为真实后端地址(等后端提供)
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
