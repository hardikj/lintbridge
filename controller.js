var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('linterdb', server, {safe:true});

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

var linterService = require('./LinterService');

exports.findAll = function(req, res){

	db.collection('lints', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.render('index', {title:"Lint Bridge", entries:items});
		});
	});
};

exports.filterById = function (req, res){

	var id = req.params.id,
		arr = false;

	db.collection('lints', function(err, collection){
		collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			item.wikiurl = item.wikiurl+"/w/index.php?title="+item.page+"&action=edit";
			if (item.src instanceof Array) {
				arr = true;
			}
			res.render('issue', {entries:item, arr:arr});
		});
	});
};

exports.filterByType = function(req, res, next) {
	var type = req.params.type;
	var lints = [];

	console.log('Retrieving broken wikitext of type: ' + type);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'type':type}).stream();
		stream.on("data", function(item) {
			lints.push(item);
		});

		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('index', {entries:lints});
			} else {
				next();
			}
		});
	});
};

exports.filterByWiki = function(req, res, next) {
	var wiki = req.params.wiki;
	var lints = [];

	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki}).stream();
		stream.on("data", function(item) {
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('index', {entries:lints, bywiki:true});
			} else {
				next();
			}
		});
	});
};

exports.filterByWikiAndType = function(req, res, next){
	var wiki = req.params.wiki,
		type = req.params.type;

	var lints = [];

	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'type':type}).stream();
		stream.on("data", function(item) {
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('index', {entries:lints});
			} else {
				next();
			}
		});
	});
};

exports.filterByPage = function(req, res, next) {
	var wiki = req.params.wiki,
		page = req.params.page;
	var lints = [];

	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page}).stream();
		stream.on("data", function(item) {
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('index', {entries:lints});
			} else {
				next();
			}
		});
	});
};

exports.filterByPageRevision = function(req, res, next){
	var wiki = req.params.wiki,
		page = req.params.page,
		revision = parseInt(req.params.revision, 10);
	var lints = [];

	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page, 'revision':revision}).stream();
		stream.on("data", function(item) {
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('index', {entries:lints});
			} else {
				next();
			}
		});
	});

};

exports.filterAllByPage = function(req, res, next) {
	var wiki = req.params.wiki,
		page = req.params.page;
	var lints = [];

	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page}).stream();

		stream.on("data", function(item) {
			item.s = item.src;
			item.wikiurl = item.wikiurl+"/w/index.php?title="+item.page+"&action=edit";
			if (item.src instanceof Array) {
				item.arr = true;
				if (item.src.length>16) {
					item.src = item.src.slice(0, 17);
					item.strip = true;
				}
			} else if (item.src.length>827) {
				item.src = item.src.substring(0, 827);
				item.strip = true;
			}
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('issues', {entries:lints});
			} else {
				next();
			}
		});
	});
};

exports.filterAllByRevision = function(req, res, next) {

	var wiki = req.params.wiki,
		page = req.params.page,
		revision = parseInt(req.params.revision, 10);

	var lints = [];

	console.log('Retrieving broken wikitext of page :' + page + ' and rev:' + revision);

	db.collection('lints', function(err, collection) {
		
		var stream = collection.find({'wiki':wiki, 'page':page, 'revision':revision}).stream();

		stream.on("data", function(item) {
			item.s = item.src;
			item.wikiurl = item.wikiurl+"/w/index.php?title="+item.page+"&action=edit";
			if (item.src instanceof Array) {
				item.arr = true;
				if (item.src.length>16) {
					item.src = item.src.slice(0, 17);
					item.strip = true;
				}
			} else if (item.src.length>827) {
				item.src = item.src.substring(0, 827);
				item.strip = true;
			}
			lints.push(item);
		});
		stream.on("end", function() {
			if (lints.length > 0) {
				res.render('issues', {entries:lints});
			} else {
				next();
			}
		});
	});
};

exports.findWiki = function(req,res){

	console.log('Retrieving list of all wikis availabe');

	db.collection('lints', function(err, collection) {
		collection.distinct('wiki', function(err, item) {
			res.render('index', {entries:item, list:true}); });
	});
};

exports.findTypes = function(req,res){

	console.log('Retrieving list of all Types availabe');

	db.collection('lints', function(err, collection) {
		collection.distinct('type', function(err, item) {
			res.render('index', {entries:item, list:true, ltype:true}); });
	});
};