Spark NodeJS server
===================
This server implements required [Spark OAuth2.0](https://spark.autodesk.com/developers/reference/authentication) endpoints:

* `/access_token` - The callback endpoint for the above authorization flow, returns the access_token for the 3-legged flow
* `/get_credentials` - Returns the access_token for the 2-legged flow
* `/refresh_token` - Refreshes the access_token that you received from the 3-legged process


All endpoints are accessible through `http://your-server-url:3000/the_endpoint` where `the_endpoint` is one of the end points above.

###To run the server
* Copy config.example.js to config.js and enter your [client_id and client_secret](https://developer.autodesk.com/myapps). 
* [Install nodejs and npm](https://docs.npmjs.com/getting-started/installing-node)
* Run:
```sh
$ npm install
$ node server.js
```

You now have a server running on your machine with the access_token, get_credentials and refresh_token endpoints.
