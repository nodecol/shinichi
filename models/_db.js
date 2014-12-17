var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//user
var UserSchema = new Schema({
  nick_name: { type: String},
  login_name: { type: String},
  email: { type: String},
  password: { type: String },
  access_token: {type: String},
  create_time: { type: Date, default: Date.now }
});
UserSchema.index({login_name: 1}, {unique: true});
mongoose.model('User', UserSchema);

//topic
var TopicSchema = new Schema({
  title: { type: String },
  desc: { type: String },
  content: { type: String },
  tags: {type: [{}]},
  author_id: { type: ObjectId },
  is_html: { type: Boolean },
  quote_url: { type: String}, // 引用地址
  update_time: { type: Date, default: Date.now },
  create_time: { type: Date, default: Date.now }
});
TopicSchema.index({create_time: -1});
TopicSchema.index({author_id: 1, create_time: -1});
mongoose.model('Topic', TopicSchema);

//reply
var ReplySchema = new Schema({
  content: { type: String },
  topic_id: { type: ObjectId},
  author_id: { type: ObjectId },
  reply_id: { type: ObjectId }, // 回复的回复id
  is_html: { type: Boolean },
  update_time: { type: Date, default: Date.now },
  create_time: { type: Date, default: Date.now }
});
ReplySchema.index({topic_id: 1});
ReplySchema.index({author_id: 1, create_time: -1});
mongoose.model('Reply', ReplySchema);

//exports
exports.User = mongoose.model('User');
exports.Topic = mongoose.model('Topic');
exports.Reply = mongoose.model('Reply');

if (require.main === module) {
  exports.User.findOne({ login_name: 'sk' }, function (err, user) {
    if (err) {
      return console.log(err);
    }
    //若没有USER
    if (!user) {
      var temp = new exports.User();
      temp.nick_name = 'sk';
      temp.login_name = 'sk';
      temp.password = 'password';
      temp.email = 'email';
      temp.access_token = require('node-uuid').v4();
      temp.save(function (err, user) {
        if (err) {
          return console.log(err);
        }
        sendTopicToDb(user._id);
      });
    } else {
      sendTopicToDb(user._id);
    }
  });

  var sendTopicToDb = function (authorId) {
    var list = [
      '930_619_http://img.itc.cn/photo/jldClOfOUVz',
      '930_620_http://img.itc.cn/photo/jlJgTBc3cqp',
      '510_766_http://img.itc.cn/photo/o3SdUj4vxfD',
      '800_588_http://img.itc.cn/photo/jtEfeLgW6mt',
      '510_510_http://img.itc.cn/photo/od0fLYfxHDE',
      '930_620_http://img.itc.cn/photo/jMYDt1pmv31',
      '450_678_http://img.itc.cn/photo/jCCbUO3gAPH',
      '425_620_http://img.itc.cn/photo/jdD06LhezMD',
      '830_566_http://img.itc.cn/photo/jAmoDIzv6uf',
      '434_650_http://img.itc.cn/photo/jA6bxN8u1Vk',
      '483_645_http://img.itc.cn/photo/jdDh3t5J4Lz',
      '500_313_http://img.itc.cn/photo/oA6roagCsoA',
      '500_750_http://img.itc.cn/photo/j50mVoxMj9j',
      '641_978_http://img.itc.cn/photo/jk7KIFb8mgN',
      '930_697_http://img.itc.cn/photo/jrHSHZrlYd8'
    ];
    list = list.concat(list.slice());
    var listdata = [];
    for (var i = 0; i < list.length; i++) {
      var temp = {};
      temp.title = "【晒】不 准 笑";
      temp.desc = list[i];
      temp.content = "";
      temp.author_id = authorId;
      if (i % 2 ===0) {
        temp.tags = [{ "tag": "mei", "name": "美图" }];
      } else {
        temp.tags = [{ "tag": "xiao", "name": "搞笑" }];
      }
      listdata.push(temp);
    }
    exports.Topic.create(listdata, function (err) {
      if (err) {
        console.log(err);
      }
    });
  };
}