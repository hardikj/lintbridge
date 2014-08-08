/*
  Utility script to fill checkwiki database.
  To test locally create a database checkwiki with following schema.

  CREATE TABLE IF NOT EXISTS cw_error
  (Project VARCHAR(20) NOT NULL,
  Title VARCHAR(100) NOT NULL,
  Error SMALLINT NOT NULL,
  Notice VARCHAR(400),
  Ok INT,
  Found DATETIME,
  PRIMARY KEY (Project, Title, Error) )

  CREATE TABLE IF NOT EXISTS cw_overview
  (ID SMALLINT,
  Project VARCHAR(20) NOT NULL,
  Lang VARCHAR(100),
  Errors MEDIUMINT,
  Done MEDIUMINT,
  Last_Dump VARCHAR(100),
  Last_Update VARCHAR(100),
  Project_Page VARCHAR(400),
  Translation_Page VARCHAR(400)
  PRIMARY KEY (Project) )
*/
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
  };

  var requestCB = function(error, response, body) {
    if (!error && response.statusCode === 200) {
      process(body);
    }
    else {
      console.log(error);
      console.log(response.statusCode);
      console.log("some error has occured");
    }
  };

  var errorMap = { 'missing-end-tag' : 102, 'missing-start-tag' : 103, 'stripped-tag' : 104, 'obsolete-tag':105, 'fostered':106,
                   'ignored-table-attr':107, 'bogus-image-options' : 108 };

  request("http://lintbridge.wmflabs.org/_api/issues?limit=1000",  requestCB);

  connection.release();

});

