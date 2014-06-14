var express = require('express');
	linterService = require('./LinterService');
	controller = require('./controller');

var app = express(),
	bodyParser = require('body-parser');

var hbs = require('hbs');

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(bodyParser({limit:'50mb'}));
app.use('/static', express.static(__dirname + '/static'));

/*
*	html routes
*/

app.get('/_html/issues', controller.findAll);

// filter by ID
app.get('/_html/issues/:id', controller.filterById);

app.get('/_html/issues/type/:type', controller.filterByType);

// filter issues by wiki name
app.get('/_html/:wiki/issues', controller.filterByWiki);

// filter issues by page name
app.get('/_html/:wiki/issues/:page', controller.filterByPage);

// filter issues with src by page name
app.get('/_html/:wiki/allissues/:page', controller.filterAllByPage);

// show All wiki names in database
app.get('/_html/wiki', controller.findWiki);


/*
*	Api routes 
*/

app.get("/", function(req, res){
	res.render('main');
});

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

// Add a new lint
app.post('/_api/add', linterService.addLint);
 
app.listen(3000);

console.log('Listening on port 3000...');
