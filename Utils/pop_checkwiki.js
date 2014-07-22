var request = require("request");
var mysql   = require('mysql');

connection = {
  host     : 'localhost',
  user     : 'root',
  database : 'checkwiki',
  password : ''
};

var pool  = mysql.createPool(connection);

pool.getConnection(function(err, connection) {
  if (err) throw err;

  var insert  = function( post ) {
    var query = connection.query('INSERT INTO cw_error SET ?', post, function(err, result) {
        //if (err) console.log("duplicate", post.project, post.title);
        if (result) {
          console.log('issue inserted', post.project, post.title);
        }
    });
  };

  var process = function( body ) {
    
    body = JSON.parse(body);
    for (var i = 0; i < body.length; i++) {
      if ( errorMap[body[i].type] ) {
        var post = { project:body[i].wiki, title:body[i].page, error:errorMap[body[i].type], notice:"test",ok:0 } ;
        insert(post);
      }
    }
    if (body[i-1].links[1] && body[i-1].links[1].ref === "next") {
      next  = body[i-1].links[1].href;
      request("http://lintbridge.wmflabs.org/_api"+next,  requestCB);
    } else {
      next = false;
    }
    console.log(next);
    return next;
  };

  var requestCB = function(error, response, body) {
    if (!error && response.statusCode === 200) {
      next = process(body);
    }
    else {
      console.log(error);
      console.log(response.statusCode);
      console.log("some error has occured");
    }
  };

  var errorMap = { 'missing-end-tag' : 102, 'missing-start-tag' : 103, 'strippedTag' : 104, 'ObsoleteTag':105, 'fostered':106,
                   'ignored-table-attr':107, 'BogusImageOptions' : 108 };

  request("http://lintbridge.wmflabs.org/_api/issues?limit=1000",  requestCB);

  connection.release();

});

