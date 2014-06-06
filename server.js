var express = require('express');
	linterService = require('./LinterService');
 
var app = express(),
	bodyParser = require('body-parser');

app.use(bodyParser());

// find all lints
app.get('/lint', linterService.findAll);

// filter lints by wiki name
app.get('/:wiki/lint', linterService.filterByWiki);

app.get('/:wiki/lint/:type', linterService.filterByWikiAndType);

// filter lint by type on any wiki
app.get('/lint/:type', linterService.filterByType);

// Add a new lint
app.post('/lint', linterService.addLint);
 
app.listen(3000);
console.log('Listening on port 3000...');




/*
TODO
Queries to support- 

/wiki/issues/lint-type - show issues of this lint type
/wiki/issue-id - show this isseue

*/


