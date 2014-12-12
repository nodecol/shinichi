
var mcache = require('memory-cache');

exports.get = function (key, callback) {
  setImmediate(function () {
    callback(null, mcache.get(key));
  });
};

// time 参数可选，毫秒为单位
exports.set = function (key, value, time, callback) {
  if (typeof time === 'function') {
    callback = time;
    time = null;
  }
  mcache.put(key, value, time);
  setImmediate(function () {
    callback && callback(null);
  });
};