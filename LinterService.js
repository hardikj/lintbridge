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
    db.collection('lints', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.filterByType = function(req, res) {
    var type = req.params.type;
    var lints = '';

    console.log('Retrieving broken wikitext of type: ' + type);
    db.collection('lints', function(err, collection) {

		var stream = collection.find({'type':type}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});
};

exports.filterByWiki = function(req, res) {
	var wiki = req.params.wiki;
	var lints = '';

	console.log('Retrieving broken wikitext of wiki:' + wiki);
	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item) + '\n';
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

	console.log('Retrieving broken wikitext of wiki:' + wiki);
	db.collection('lints', function(err, collection) {
		var stream = collection.find({'wiki':wiki, 'type':type}).stream();
		stream.on("data", function(item) {
			lints += JSON.stringify(item) + '\n';
		});
		stream.on("end", function() {
			res.send(lints);
		});
	});
};

exports.addLint = function(req, res){
	var lint = req.body;
	db.collection('lints', function(err, collection) {
		collection.insert(lint, {safe: true}, function(err, result){
			if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
		});
	});
};