var User = require('./_db').User;
var uuid = require('node-uuid');

/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({ 'email': email }, callback);
};

/**
 * 根据登录用户名列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} names 用户名列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByLoginNames = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.find({ 'login_name': { $in: names } }, callback);
};

/**
 * 根据登录用户名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
  User.findOne({ 'login_name': loginName }, callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({ '_id': { '$in': ids } }, callback);
};

/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  User.findOne({ '_id': id }, callback);
};

/**
 * 添加新用户
 * Callback:
 * - err, 数据库异常
 * @param {String} login_name 登录用户名
 * @param {String} password 登录密码
 * @param {String} email 邮箱
 * @param {Function} callback 回调函数
 */
exports.createUser = function (login_name, password, email, callback) {
  var user = new User();
  user.nick_name = login_name;
  user.login_name = login_name;
  user.password = password;
  user.email = email;
  user.access_token = uuid.v4();
  user.save(callback);
};