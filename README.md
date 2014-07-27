Lintbridge
============

Web service for [parsoid](https://www.mediawiki.org/wiki/Parsoid/) based linter [linttrap](https://www.mediawiki.org/wiki/User:Hardik95/GSoC_2014_Application)

Installation:

```
	npm install
```

## Setting up Database

You will need to install [Mongodb](http://docs.mongodb.org/manual/administration/install-on-linux/)

In mongod:

	create keyspace linterdb

## Running the server 

Now start the server, it will be accessible at [http://localhost:3000/](http://localhost:3000/):

	node server
