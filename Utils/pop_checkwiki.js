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

  CREATE TABLE IF NOT EXISTS cw_overview_errors
  (Project VARCHAR(20) NOT NULL,
  ID SMALLINT NOT NULL,
  Errors MEDIUMINT,
  Done MEDIUMINT,
  Name VARCHAR(255),
  Name_Trans VARCHAR(400),
  Prio SMALLINT,
  Text VARCHAR(4000),
  Text_Trans VARCHAR(4000),
  PRIMARY KEY (Project, ID) )
*/

var request = require("request");
var mysql   = require('mysql');

// mysql connection info
connection = {
  host     : 'localhost',
  user     : 'root',
  database : 'checkwiki',
  password : ''
};

var pool  = mysql.createPool(connection);

pool.getConnection(function(err, connection) {
  if (err) throw err;

  var insert  = function( post, post2 ) {
    var query = connection.query('INSERT INTO cw_error SET ?', post, function(err, result) {
        //if (err) console.log("duplicate", post.project, post.title);
        if (result) {
          console.log('issue inserted', post.project, post.title);
        }
    });

    var url = "http://lintbridge.wmflabs.org/_api/"+post.project+"/page/"+post.title+"/count";
    request(url,  function(error, response, body) {

      if (!error && response.statusCode === 200) {
        post2.errors = body[0];
        connection.query('INSERT INTO cw_overview_errors SET ?', post2, function(err, result) {
          if (result) {
            console.log('issue inserted to  cw_overview_errors');
          }
        });
      } else {
        console.log("Error:", error);
        console.log(response.statusCode);
      }
    });
  };

  // function that process links and insert it into db.
  var process = function( body ) {
    body = JSON.parse(body);
    for (var i = 0; i < body.length; i++) {
      if ( errorMap[body[i].type] ) {
        // attributes for cw_error table
        var post = { project:body[i].wiki, title:body[i].page, error:errorMap[body[i].type], notice:"test",ok:0 } ;
        // attributes for cw_overview_errors table
        var post2 = { project:body[i].wiki, id:errorMap[body[i].type], done:0, name_trans:body[i].type, prio:0, text_trans:body[i].src};
        insert(post, post2);
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
      // process response
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

  request("http://lintbridge.wmflabs.org/_api/issues?limit=100",  requestCB);

  connection.release();

});

