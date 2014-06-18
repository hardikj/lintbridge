var express = require('express'),
	bodyParser = require('body-parser'),
	hbs = require('hbs');

var	linterService = require('./LinterService'),
	controller = require('./controller');

var app = express();

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(bodyParser({limit:'50mb'}));
app.use('/static', express.static(__dirname + '/static'));
app.use(app.router);

// error handle
app.use(function(req, res, next){
	res.status(404);

	if (req.accepts('html')) {
		res.render('404', { url: req.url });
		return;
	}

	if (req.accepts('json')) {
		res.send({ error: 'Not found' });
		return;
	}

	res.type('txt').send('Not found');
});

app.use(function(err, req, res, next){
  
  res.status(err.status || 500);
  res.render('500', { error: err });
});

app.get('/404', function(req, res, next){
  next();
});

app.get('/403', function(req, res, next){
  // trigger a 403 error
  var err = new Error('not allowed!');
  err.status = 403;
  next(err);
});

app.get('/500', function(req, res, next){
  // trigger a generic (500) error
  next(new Error('keyboard cat!'));
});

app.get("/", function(req, res){
	res.render('main', {layout:false});
});

/*
*	html routes
*/

app.get('/_html/issues', controller.findAll);

// filter by ID
app.get('/_html/issues/:id', controller.filterById);

// filter by issue type
app.get('/_html/issues/type/:type', controller.filterByType);

// filter issues by wiki name
app.get('/_html/:wiki/issues', controller.filterByWiki);

// filter by wiki name and issue type
app.get('/_html/:wiki/issues/type/:type', controller.filterByWikiAndType);

// filter issues by page name
app.get('/_html/:wiki/issues/:page', controller.filterByPage);

// filter issues by page name and revision id
app.get('/_html/:wiki/issues/:page/:revision', controller.filterByPageRevision);

// filter issues with src by page name
app.get('/_html/:wiki/allissues/:page', controller.filterAllByPage);

// filter issues by page and revision
app.get('/_html/:wiki/allissues/:page/:revision', controller.filterAllByRevision);

// show All wiki names in database
app.get('/_html/wiki', controller.findWiki);


/*
*	Api routes 
*/

// find all issues
app.get('/_api/issues', linterService.findAll);

// filter by ID
app.get('/_api/issues/:id', linterService.filterById);

// filter issues by type on any wiki
app.get('/_api/issues/type/:type', linterService.filterByType);

// filter issues by wiki name
app.get('/_api/:wiki/issues', linterService.filterByWiki);

// filter by wiki name and issue type
app.get('/_api/:wiki/issues/type/:type', linterService.filterByWikiAndType);

// filter issues by page name
app.get('/_api/:wiki/issues/:page', linterService.filterByPage);

// fi;ter by current revision
app.get('/_api/:wiki/issues/:page/:revision', linterService.filterByRevision);

// Add a new lint
app.post('/_api/add', linterService.addLint);
 
app.listen(3000);

console.log('Listening on port 3000...');
