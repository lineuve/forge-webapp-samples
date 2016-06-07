// Provide environment through console i.e. ENV=beta node server.js
var port = process.env.PORT || 3000,
    config = require('./config.js'),
    API_SERVER;

//Make sure port is a number
if (isNaN(port)) {
    port = 3000;
}

//set up the api server
switch(config.FORGE_ENV) {
    case 'stg':
        API_SERVER = 'https://developer-stg.api.autodesk.com';
        break;
    case 'prod':
        API_SERVER = 'https://developer.api.autodesk.com';
        break;
    default:
        API_SERVER = 'https://developer-dev.api.autodesk.com';
}

// Setup dependencies
var express = require('express'),
    app = express(),
    request = require('request'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
        cookie: {maxAge: 720000000},
        resave: false,
        saveUninitialized: false,
        secret: 'forge secret string'
    })
);

// Enable CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Authorization, Content-Type, Accept');
    next();
});


// Access token service
app.get('/access_token', function (req, res) {

    var code = req.query.code,
        url = API_SERVER + '/authentication/v1/gettoken',
        params = 'code=' + code +
            '&grant_type=authorization_code' +
            '&response_type=code' +
            '&client_id=' + config.CLIENT_ID +
            '&client_secret=' + config.CLIENT_SECRET +
            '&redirect_uri=' + req.query.redirect_uri;

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };


    if (req.query.error) {
        res.send(req.query.error_description);
    }

    if (!code) {
        res.send('code wasn\'t provided');
    }

    if (!req.query.error && code) {
        request({
            uri: url,
            headers: headers,
            body: params,
            method: 'POST'
        }, function (err, result, body) {
            //return the access token object (json)
            var resp = JSON.parse(body);


            req.session.access_token = JSON.parse(JSON.stringify(resp.access_token));
            if (resp.refresh_token) {
                req.session.refresh_token = JSON.parse(JSON.stringify(resp.refresh_token));
            }
            console.log(resp);

            //don't return the refresh token
            delete(resp.refresh_token);
            res.send(resp);
        });
    }


});

// 2-legged token service
app.get('/get_credentials', function (req, res) {
    var scope = encodeURIComponent(req.query.scope);

    var url = API_SERVER + '/authentication/v1/authenticate',
        params = 'grant_type=client_credentials' +
            '&client_id=' + config.CLIENT_ID +
            '&client_secret=' + config.CLIENT_SECRET +
            '&scope=' + scope;

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    request({
        uri: url,
        headers: headers,
        body: params,
        method: 'POST'
    }, function (err, result, body) {
        //return the access token object (json)
        var resp = JSON.parse(body);
        req.session.app_token = JSON.parse(JSON.stringify(resp.access_token));

        console.log(req.session);
        res.send(resp);
    });
});

// Refresh token service
app.get('/refresh_token', function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    var refresh_token = req.session.refresh_token;
    if (!refresh_token) {
        res.send(JSON.stringify({error: 'refresh_token wasn\'t provided'}));
    }
    else {
        var url = API_SERVER + '/authentication/v1/refreshtoken',
            params = 'grant_type=refresh_token' +
                '&refresh_token=' + refresh_token +
                '&client_id=' + config.CLIENT_ID +
                '&client_secret=' + config.CLIENT_SECRET;

        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        request({
            uri: url,
            headers: headers,
            body: params,
            method: 'POST'
        }, function (err, result, body) {
            //return the access token object (json)
            var resp = JSON.parse(body);

            req.session.access_token = JSON.parse(JSON.stringify(resp.access_token));
            if (resp.refresh_token) {
                req.session.refresh_token = JSON.parse(JSON.stringify(resp.refresh_token));
            }

            //don't return the refresh token
            delete(resp.refresh_token);

            res.send(resp);
        });
    }

});

/**
 * This endpoint has nothing to do with authentication, but due to some OSS + Client JS limitations
 * we need a way to upload a file from the local environment in order to use it later on
 */

var fs = require('fs');

app.put('/upload_file', function (req, res) {
    console.log('session is:', req.session);
    var fileName = req.query.fileName,
        bucketKey = req.query.bucketKey;

    var uploadUrl = API_SERVER + '/oss/v2/buckets/' + bucketKey + '/objects/' + fileName;

    fs.readFile('files/' + fileName, function (err, data) {
        request({
                uri: uploadUrl,
                headers: {
                    'Authorization': 'Bearer ' + req.session.app_token,
                    'Content-Type': 'application/octet-stream'
                },
                body: data,
                method: 'PUT'
            },
            function (error, response, body) {
                res.send(body);
            });
    });


});


/**
 * Download file endpoint
 */
app.get('/download_file', function (req, res) {

    var fileName = req.query.fileName,
        bucketKey = req.query.bucketKey;

    var downloadUrl = API_SERVER + '/oss/v2/buckets/' + bucketKey + '/objects/' + fileName;

    request({
            uri: downloadUrl,
            headers: {
                'Authorization': 'Bearer ' + req.session.access_token
            },
            method: 'GET'
        },
        function (error, response, body) {

            //response.on('end', function (chunk) {
            fs.writeFile('../client/downloads/' + fileName, body, function (err) {
                var successObj = {downloadUrl: '/downloads/' + req.query.fileName};
                if (!err) {
                    res.send(JSON.stringify(successObj));
                } else {
                    res.send(JSON.stringify({error: 'Error in returning file'}));
                }
            });
            //});
        });


});


app.listen(port);

console.log('Express server started on port ' + port);