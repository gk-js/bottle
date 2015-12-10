var redis = require('redis'),
	client = redis.createClient(),
	client2 = redis.createClient(),
	client3 = redis.createClient();
exports.throw = function(bottle, callback){
	bottle.time = bottle.time || Date.now();
	//create id for evert bottle
	var bottleId = Math.random(16);
	var type = {male: 0, female: 1};
	client.select(type[bottle.type], function(){
		client2.SELECT(2, function(){
			client2.GET(bottle.owner, function(err, result){
				if(result >= 10){
					return callback({code: 0, msg: "今天的扔瓶子的机会已经用完了~!"});
				}
				client2.INCR(bottle.owner, function(){
					client2.TTL(bottle.owner, function(err, ttl){
						if(ttl === -1){
							client2.EXPIRE(bottle.owner, 86400);
						}
					})
				})
			})
		})
		client.HMSET(bottleId, bottle, function(err, result){
			if(err){
				return callback({code: 0, msg: "try again later!"});
			}
			//if success retun ok
			callback({code : 1, msg: result});
			//set bottle save dateTime 1 day
			client.EXPIRE(bottleId, 86400);
		})
	})
};
exports.pick = function(info , callback){
	client3.SELECT(3, function(){
		client3.GET(info.user, function(err, result){
			if(result >= 10){
				return callback({"code" : 0,  msg: "今天的jian瓶子的机会已经用完了~!"});
			}
			client3.INCR(info.user, function(){
				client3.TTL(info.user, function(err, ttl){
					if(ttl === -1){
						client3.EXPIRE(info.user, 86400);
					}
				})
			})
		})
	})
	if(Math.random() < 0.2){
		return callback({code: 0, msg: "startfish!"})
	}
	var type = {all:Math.round(Math.random), male: 0, female: 1};
	info.type = info.type || 'all';
	client.select(type[info.type], function(){
		client.RANDOMKEY(function(err, bottleId){
			if(!bottleId){
				return callback({code: 0, msg: "startfish!"});
			}
			//show all info by id
			client.HGETALL(bottleId, function(err, bottle){
				if(err){
					return callback({code: 0, msg: "the bottle is broken"});
				}
				//success
				callback({code: 1, msg: bottle});
				//remove this bottle from redis
				client.DEL(bottleId);
			})
		})
	})
}
exports.throwBack = function(bottle, callback){
	var type = {male: 0, female: 1};
	var bottleId = Math.random().toString(16);
	client.SELECT(type[bottle.type], function(){
		client.HMSET(bottleId, bottle, function(err, result){
			if(err){
				return callback({code: 1, msg: result});
			}
			callback({code: 1, msg: result});
			client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now());
		})
	})

}