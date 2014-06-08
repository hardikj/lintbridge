var express = require('express');
	linterService = require('./LinterService');
 
var app = express(),
	bodyParser = require('body-parser');

app.use(bodyParser({limit:'50mb'}));


// find all issues
app.get('/issues', linterService.findAll);

// filter by ID
app.get('/issues/:id', linterService.filterById);

// filter issues by type on any wiki
app.get('/issues/type/:type', linterService.filterByType);

// filter issues by wiki name
app.get('/:wiki/issues', linterService.filterByWiki);

// filter by wiki name and issue type
app.get('/:wiki/issues/type/:type', linterService.filterByWikiAndType);

// filter issues by page name
app.get('/:wiki/issues/:page', linterService.filterByPage);

// Add a new lint
app.post('/add', linterService.addLint);
 
app.listen(3000);
console.log('Listening on port 3000...');
