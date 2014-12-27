var Topic = require('./_db').Topic;

var config = require('../config');
var cache = require('./_cache');

var _ = require('lodash');

/**
 * 根据页数及标签查询topics
 * Callback:
 * - err, 数据库异常
 * @param {String} page 页数
 * @param {String} tag 标签 可选参数
 * @param {Function} callback 回调函数
 */
exports.getTopicsByPageAndTag = function (page, tag, callback) {
  if (typeof tag === 'function') {
    callback = tag;
    tag = '';
  }

  var query = {};
  if (tag && tag !== '') {
    query['tags.name'] = tag;
  }
  var limit = config.list_topic_count;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-create_time' };
  var optionsStr = JSON.stringify(query) + JSON.stringify(options);

  cache.get(optionsStr, function (err, topics) {
    // cache出错
    //if (err) {
    //  return callback(err);
    //}
    // cache数据
    if (topics) {
      return callback(null, topics);
    }
    // 从数据库中查数据
    //Topic.find(query, '_id title desc author_id', options, callback);
    Topic.find(query, '_id title imgs quote_author', options, function (err, topics) {
      //数据库出错
      if (err) {
        return callback(err);
      }
      // 数据库数据
      if (page === 1) { // 缓存首页60秒
        cache.set(optionsStr, topics, 1000 * 60);
      }
      return callback(null, topics);
    });
  });
};

/**
 * 根据ID得到主题
 * Callback:
 * - err, 数据库异常
 * - topic, 主题
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopicById = function (id, callback) {
  Topic.findOne({ '_id': id }, callback);
};

/**
 * 获取5万条主题ID，用于sitmap.xml
 * Callback:
 * - err, 数据库异常
 * - ids, 主题IDS
 * @param {Function} callback 回调函数
 */
exports.getTopicsLimit5w = function (callback) {
  cache.get('limit5w', function (err, tids) {
    //if (err) {
    //  return callback(err);
    //}
    if (tids) {
      return callback(null, tids);
    }

    Topic.find({ }, '_id tags', { limit: 50000, sort: '-create_time' }, function (err, tids) {
      if (err) {
        return callback(err);
      }

      // query tags all and top 5
      var temp = [];
      var tags = _.pluck(tids, 'tags');
      for (var i = 0; i < tags.length; i++) {
        temp = temp.concat(tags[i]);
      };
      var countObj = _.countBy(_.pluck(temp, 'name'));
      if (countObj.hasOwnProperty('')) {
        delete countObj[''];
      }
      config.tags = _.keys(countObj);
      config.tags_top = _.keys(countObj).slice(0, 5);

      tids = _.pluck(tids, '_id');
      cache.set('limit5w', tids, 1000 * 3600 * 24); // 缓存一天

      return callback(null, tids);
    });
  });
};

/**
 * 根据authorId删除所有的主题
 * Callback:
 * - err, 数据库异常
 * @param {String} authorId 创建者id
 * @param {Function} callback 回调函数
 */
exports.delTopicsByAuthorId = function (authorId, callback) {
  Topic.remove({ 'author_id': authorId }, callback);
};

/**
 * 根据主题ID列表，删除一组主题
 * Callback:
 * - err, 数据库异常
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
//exports.delTopicsByIds = function (ids, callback) {
//  Topic.remove({ '_id': { '$in': ids } }, callback);
//};

/**
 * 根据主题ID，删除该主题
 * Callback:
 * - err, 数据库异常
 * @param {String} authorId 创建者id
 * @param {Function} callback 回调函数
 */
//exports.delTopicById = function (id, callback) {
//  Topic.removeOne({ '_id': id }, callback);
//};

/**
 * 创建topic
 * Callback:
 * - err, 数据库异常
 * @param {String} title 标题
 * @param {Array} imgs 图片数据
 * @param {String} content 内容
 * @param {Array} tags 标签 exp: [{ "tag": "mei", "name": "美图" }]
 * @param {String} quoteUrl 引用地址
 * @param {String} authorId 创建者id
 * @param {Function} callback 回调函数
 */
exports.createTopic = function (title, imgs, content, tags, quoteUrl, authorId, callback) {
  var topic = new Topic();
  topic.title = title;
  topic.imgs = imgs;
  topic.content = content;
  topic.tags = tags;
  topic.quote_url = quoteUrl;
  topic.author_id = authorId;
  topic.save(callback);
};
