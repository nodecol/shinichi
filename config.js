/**
 * config
 */

var path = require('path');

var config = {
  // debug 为 true 时，用于本地调试
  debug: true,
  express_logger_format: 'dev', // combined common default short tiny dev

  get mini_assets() { return !this.debug; }, // 是否启用静态文件的合并压缩，详见视图中的Loader

  name: 'Shinichi',
  description: 'women desc',
  keywords: 'xxxx,xxx',
  author: 'sk',

  // 社区的域名
  host: 'localhost',

  // mongodb 配置
  db: 'mongodb://127.0.0.1/testnode',
  db_name: 'testnode',


  session_secret: 'shinichi_secret', // 务必修改
  auth_cookie_name: 'shinichi',

  // 程序运行的端口
  port: 3000,
  https_port: 3111,

  // 单页话题数量
  list_topic_count: 10,

  // newrelic 是个用来监控网站性能的服务
  newrelic_key: 'yourkey',

  //文件上传配置
  //注：如果填写 qn_access，则会上传到 7牛，以下配置无效
  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  tags: [''],
  tags_top: ['']
};

module.exports = config;
