var express = require('express');
var redis = require('./models/redis.js');
var path = require('path');
var mongodb = require('./models/mongodb.js');

var app = express();
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
//POST owner=xxx&&type=xxx&&content=xxx[&time=xxx]
app.post('/', function(req, res){
	if(!(req.body.owner && req.body.type && req.body.content)){
		if(req.body.type && (["male", "female"].indexOf(req.body.type) === -1)){
			return res.json({code: 0, msg: "type error"});
		}
		return res.json({code: 0, msg: "infomation is not completed"});
	}
	redis.throw(req.body, function(result){
		res.json(result);
	})
});

app.get('/', function(req, res){
	if(!req.query.user){
		return res.json({code: 0, msg: "infomation is not completed"});
	}
	if(req.query.type && (["male", "female"].indexOf(req.body.type) === -1)){
		return res.json({code: 0, msg: "type error"});
	}
	redis.pick(req.query, function(result){
		if(result.code === 1){
			mongodb.save(req.query.user, result.msg, function(err){
				if(err){
					return res.json({code: 0, msg: "get bottle failed!"});
				}
				return res.json(result);
			})
		}
		res.json(result);
	});
});
//turn back a bottle in the sea
app.post('/back', function(req, res){
	redis.throwBack(req.body, function(result){
		res.json(result);
	})
})
app.get("/user/:user", function(req, res){
	mongodb.getAll(req.params.user, function(result){
		res.json(result)
	});
});
app.get('/bottle/:_id', function(req, res){
	mongodb.getOne(req.params._id, function(result){
		res.json(result);
	})
});
app.post('/replay/:_id', function(req, res){
	if(!(req.body.user && req.body.content)){
		return callback({code: 0, msg: "replay msg is not completed!!"});
	}
	mongodb.replay(req.params._id, req.body, function(result){
		res.json(result);
	})
})
app.get('/delete/:_id', function(req, res){
	mongodb.delete(req.params._id, function(){
		res.json(result);
	});
})
app.listen(3000);