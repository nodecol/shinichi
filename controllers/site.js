var Topic = require('../models/topic');
var xmlbuilder = require('xmlbuilder');

exports.index = function (req, res, next) {
  var tag = req.query.tag || '';
  var subTag = req.query.subTag || '';
  
  res.render('square/main', {
    square_tag: tag,
    sub_tag: subTag
  });
};

exports.sitemap = function (req, res, next) {
  Topic.getTopicsLimit5w(function (err, topic_ids) {
    if (err) {
      return next(err);
    }

    var urlset = xmlbuilder.create('urlset', { version: '1.0', encoding: 'UTF-8' });
    urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
    
    if (topic_ids) {
      topic_ids.forEach(function (id) {
        urlset.ele('url').ele('loc', '/topic/' + id);
      });
    }

    res.type('xml');
    res.send(urlset.end());
  });
};