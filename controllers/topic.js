var Topic = require('../models/topic');

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
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