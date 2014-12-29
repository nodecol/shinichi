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
 * @param {String} subTag 二级标签 可选参数
 * @param {Function} callback 回调函数
 */
exports.getTopicsByPageAndTag = function (page, tag, subTag, callback) {
  if (typeof tag === 'function') {
    callback = tag;
    tag = '';
    subTag = '';
  }
  if (typeof subTag === 'function') {
    callback = subTag;
    subTag = '';
  }

  var query = {};
  if (tag && tag !== '') {
    if (subTag && subTag !== '') {
      query['$and'] = [{'tags.name': tag}, {'tags.name': subTag}];
    } else {
      query['tags.name'] = tag;
    }
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

      // query tags all and subTag top 5
      var tagList = [];
      var tempTagName = []; // 临时记录当前已保存的主tag
      var tags = _.pluck(tids, 'tags'); // 取出所有的标签字段数据
      // 按主标签，二级标签整理出数据
      for (var i = 0; i < tags.length; i++) {
        // 若临时记录里没有保存该主tag，将创建一个
        var tagListIndex = tempTagName.indexOf(tags[i][0].name);
        if (tagListIndex < 0) {
          var tagObj = {};
          tagObj['tag'] = tags[i][0].name;
          tagObj['count'] = 1;
          tagObj['subTag'] = [];
          tagList.push(tagObj);
          tempTagName.push(tags[i][0].name);
          tagListIndex = tempTagName.indexOf(tags[i][0].name); // 修正当前index
        } else {
          tagList[tagListIndex]['count'] ++ ;
        }

        // 将二级标签保存到相应的subTag中
        if (tags[i].length > 1) {
          var index = 1;
          while (index < tags[i].length) {
            if (tags[i][index].name) {
              tagList[tagListIndex]['subTag'].push(tags[i][index].name);
            }
            index ++ ;
          }
        }
      }

      // tag排序
      tagList = _.sortBy(tagList, function (a) {
        return -a.count;
      });

      // subTag排序，tagList
      for (var m = 0; m < tagList.length; m++) {
        if (tagList[m].subTag.length > 0) {
          // 计数
          var countObj = _.countBy(tagList[m].subTag);
          var countArr = [];
          // 转数组
          _.each(countObj, function (value, key) {
            var obj = {};
            obj['name'] = key;
            obj['count'] = value;
            countArr.push(obj);
          });
          // 排序
          var sortArr = [];
          sortArr = _.sortBy(countArr, function (a) {
            return -a.count;
          });
          // 赋值
          tagList[m].subTag = _.pluck(sortArr, 'name');
        }
      }
      config.tags = tagList;
      // end query tags all and subTag top 5

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
