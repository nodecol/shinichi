var router = require('express').Router();
var site = require('./site');
var topic = require('./topic');

router.get('/', site.index);
router.get('/sitemap.xml', site.sitemap);

router.get('/topics', topic.getTopics);
router.get('/topic/:tid', topic.getTopic);

module.exports = router;
