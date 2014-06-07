var express = require('express');
	linterService = require('./LinterService');
 
var app = express(),
	bodyParser = require('body-parser');

app.use(bodyParser());

// find all lints
app.get('/issues', linterService.findAll);

// filter lints by wiki name
app.get('/:wiki/issues', linterService.filterByWiki);

app.get('/:wiki/issues/:type', linterService.filterByWikiAndType);
// filter lint by type on any wiki
app.get('/issues/:type', linterService.filterByType);

// Add a new lint
app.post('/add', linterService.addLint);
 
app.listen(3000);
console.log('Listening on port 3000...');




/*
TODO
Queries to support- 

/wiki/issues/Page-Name - show issues of this page name
/wiki/issue-id - show this isseue

* change /lint/ to /issue/
* add Json headers to the response

*/
