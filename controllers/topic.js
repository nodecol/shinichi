var Topic = require('../models/topic');

exports.getTopics = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var tag = req.query.tag || req.session.tag || '';

  req.session.tag = tag;

  Topic.getTopicsByPageAndTag(page, tag, function (err, items) {
    if (err) {
      return next(err);
    }
    res.type('json');
    res.send(items);
  });
};

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.getTopic = function (req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return next('no topic');
  }

  Topic.getTopicById(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    return res.send(topic);
  })
}