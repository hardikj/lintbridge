var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('linterdb', server);

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'linterdb' database");
		db.collection('lints', {strict:true}, function(err, collection) {
			if (err) {
				console.log("The 'lints' collection doesn't exist. Creating it ...");
				db.collection('lints');
			}
		});
	}
});

exports.findAll = function(req, res) {

	res.setHeader("Content-Type", "application/json");
	db.collection('lints', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};

exports.filterById = function(req, res) {
	var id = req.params.id;
	res.setHeader("Content-Type", "application/json");
	db.collection('lints', function(err, collection){
		collection.findOne({'_id':id}, function(err, item) {
			res.send(item);
		});
	});
};

exports.filterByType = function(req, res) {
	var type = req.params.type;
	var lints = '';

	res.setHeader("Content-Type", "application/json");
	console.log('Retrieving broken wikitext of type: ' + type);

	db.collection('lints', function(err, collection) {

		var stream = collection.find({'type':type}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item, null, 4) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});
};

exports.filterByWiki = function(req, res) {
	var wiki = req.params.wiki;
	var lints = '';

	res.setHeader("Content-Type", "application/json");
	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item, null, 4) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});
};

exports.filterByPage = function(req, res) {
	var wiki = req.params.wiki,
		page = req.params.page;
	var lints = '';

	res.setHeader("Content-Type", "application/json");
	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item, null, 4) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});


};

exports.filterByWikiAndType = function(req, res) {
	var wiki = req.params.wiki,
		type = req.params.type;
	var lints = '';

	res.setHeader("Content-Type", "application/json");
	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'type':type}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item, null, 4) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});
};

exports.addLint = function(req, res){
	var issues = req.body,
		BreakException = {},
		resid;

	db.collection('lints', function(err, collection) {
		if (issues instanceof Array){
			try {
				issues.forEach(function(a){
					collection.insert(a, {safe: true}, function(err, result){
						if (err) {
							throw  BreakException;
						} else {
							resid = result[0];
							console.log('Success: ' + JSON.stringify(result[0].type));
						}
					});
				});
				res.send('Issues Logged Successfully');
			} catch(e) {
				if (e!==BreakException) {
					res.send({'error':'An error has occurred'});
					throw e;
				}
			}
		} else {
			collection.insert(issues, {safe: true}, function(err, result){
				if (err) {
					res.send({'error':'An error has occurred'});
				} else {
					console.log('Success: ' + JSON.stringify(result[0]._id));
					res.send("Issue Logged Successfully :" + result[0]._id);
				}
			});
		}
	});
};