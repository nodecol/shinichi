var router = require('express').Router();
var site = require('./site');
var topic = require('./topic');

router.get('/', site.index);
router.get('/sitemap.xml', site.sitemap);

router.get('/topic/:tid', topic.index);

module.exports = router;
