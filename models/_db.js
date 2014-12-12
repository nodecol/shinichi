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
  tag: {type: String},
  author_id: { type: ObjectId },
  is_html: { type: Boolean },
  quo_url: { type: String}, // 引用地址
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
  reply_id: { type: ObjectId },
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
    var topic = new exports.Topic();
    topic.title = "【晒】不 准 笑";
    topic.desc = "http://img5.douban.com/view/group_topic/large/public/p23211067.jpg";
    topic.content = "";
    topic.author_id = authorId;
    topic.tag = "meiguo1";
    topic.save(function (err, topic) {
      if (err) {
        console.log(err);
      }
    });
  };
}