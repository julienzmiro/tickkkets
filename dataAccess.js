var mongoConf = require('./conf/conf').mongoConf;

var mongostr = process.env.MONGOLAB_URI || "mongodb://localhost:27017/tickkkets",
		mongo = require('mongodb'),
		database = null;

var MongoAccess = function() {};

MongoAccess.prototype.init = function (callback) {
	console.log("MongoAccess starting");

	mongo.connect(mongostr, {}, function (err, db) {
		console.log("connected, db: " + db);
		database = db;
		database.addListener("error", function (err) {
			console.log("Error db");
		});
		callback();
	});
};

MongoAccess.prototype.getCollection = function (collection_name, callback) {
	database.collection(collection_name, function(err, result_collection) {
    if (err) { callback (err); }
		else {
			callback(null, result_collection);
		}
  });
};

MongoAccess.prototype.upsert = function (elementToAdd, callback) {
	this.getCollection("tweets", function (err, resultCollection) {
		if (err) {
			callback(err);
		} else {
			resultCollection.update({id: elementToAdd.id}, elementToAdd, {safe: true, upsert: true}, function (err) {
				if (err) {
					callback(err);
				} else {
					callback(null, elementToAdd);
				}
			});
		}
	});
};

MongoAccess.prototype.getList = function (listToGet, callback) {
	this.getCollection("tweets", function (err, resultCollection) {
		if (err) {
			callback(err);
		} else {
			resultCollection.find({list: listToGet}, {id: true}).toArray(function (err, docs) {
				if (err) {
					callback(err);
				} else {
					callback(null, docs);
				}
			});
		}
	});
};

MongoAccess.prototype.getTweetById = function (idToGet, callback) {
	this.getCollection("tweets", function (err, resultCollection) {
		if (err) {
			callback(err);
		} else {
			resultCollection.findOne({id: idToGet}, function (err, doc) {
				if (err) {
					callback(err);
				} else {
					callback(null, doc);
				}
			});
		}
	});
};

MongoAccess.prototype.getLists = function (callback) {
	this.getCollection("tweets", function (err, resultCollection) {
		if (err) {
			callback(err);
		} else {
			resultCollection.find().toArray(function (err, docs) {
				if (err) {
					callback(err);
				} else {
					callback(null, docs);
				}
			});
		}
	});
};

var mongoAccess = new MongoAccess();

exports.mongoAccess = mongoAccess;
