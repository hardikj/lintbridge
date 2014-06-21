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

var pageflag = 100;

var pagingLogic = function(item, paging){

	item.no = paging.no;
	paging.no += 1;
	item.links = [];
	if (paging.count > 0) {
		if (paging.lints.length>0){
			paging.lints[paging.lints.length-1].links.push({ref:"next", href:paging.href+item._id});
			item.links.push({ref:"prev", href:paging.href+paging.lints[paging.lints.length-1]._id});
		}
		if (paging.first) {
			paging.count -= 1;
			paging.lints.push(item);
		} else if ( JSON.stringify(item._id) === JSON.stringify(paging.query) )
			paging.push = true;

		if (!paging.first && paging.count === pageflag && paging.push) {
			item.links.push({ref:"prev", href:paging.href+paging.prev._id});
		}

		if ( paging.push ) {
			paging.lints.push(item);
			paging.count -= 1;
		}
	} else if (paging.count === 0) {
		if (paging.lints.length>0){
			paging.lints[paging.lints.length-1].links.push({ref:"next", href:paging.href+item._id});
		}
		paging.count -= 1;
	}
	paging.prev = item;
	return;
};

exports.findAll = function(req, res) {
	var lints = [],
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				no : 0,
				first:null,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/issues/?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}

	db.collection('lints', function(err, collection) {
		var stream = collection.find().stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
		});
	});
};

exports.filterById = function(req, res) {
	var id = req.params.id;
	res.setHeader("Content-Type", "application/json");
	db.collection('lints', function(err, collection){
		collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			res.send(item);
		});
	});
};

exports.filterByType = function(req, res) {
	var lints = [],
		type = req.params.type,
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				first:null,
				no : 0,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/issues/type/"+type+"?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}
	console.log('Retrieving broken wikitext of type: ' + type);

	db.collection('lints', function(err, collection) {

		var stream = collection.find({'type':type}).stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
		});
	});
};

exports.filterByWiki = function(req, res) {
	var wiki = req.params.wiki;
	var lints = [],
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				first:null,
				no : 0,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/"+wiki+"/issues/?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}
	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki}).stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
		});
	});
};

exports.filterByWikiAndType = function(req, res) {
	var wiki = req.params.wiki,
		type = req.params.type;
	var lints = [],
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				first:null,
				no : 0,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/"+wiki+"/issues/type/"+type+"?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}
	console.log('Retrieving broken wikitext of wiki:' + wiki);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'type':type}).stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
		});
	});
};

exports.filterByPage = function(req, res) {
	var wiki = req.params.wiki,
		page = req.params.page;
	var lints = [],
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				first:null,
				no : 0,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/"+wiki+"/issues/"+page+"?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}
	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page}).stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
		});
	});
};

exports.filterByRevision = function(req, res) {
	var wiki = req.params.wiki,
		page = req.params.page,
		revision = parseInt(req.params.revision, 10);
	var lints = [],
		url = require('url');
	var url_parts = url.parse(req.url, true);
	var paging ={count:pageflag,
				first:null,
				no : 0,
				push:false,
				query:url_parts.query.from,
				lints: lints,
				href: "/"+wiki+"/issues/"+page+"/"+revision+"?from="};

	res.setHeader("Content-Type", "application/json");
	if (paging.query) {
		paging.query = new BSON.ObjectID(paging.query);
		paging.first = false;
	} else {
		paging.first = true;
	}
	console.log('Retrieving broken wikitext of page:' + page);

	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'page':page, 'revision':revision}).stream();
		stream.on("data", function(item) {
			pagingLogic(item, paging);
		});
		stream.on("end", function() {
			res.json(lints);
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