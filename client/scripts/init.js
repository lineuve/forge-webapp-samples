///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Greg Rashkevitch 2016 - Forge/Developer Portal
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////////////

// Namespacing
var Autodesk = Autodesk || {};
Autodesk.Forge = Autodesk.Forge || {};



//Init the Forge Client - you should supply your personal config through the scripts/config.js file
var CLIENT_ID = CLIENT_ID || '',
	REDIRECT_URI = REDIRECT_URI || '',
	ENV = ENV || 'dev',
    API_BASE_URL,
    DEFAULT_BUCKET_PREFIX = 'mhu_' + CLIENT_ID.toLowerCase() + '_';


switch(ENV) {
    case 'stg':
        API_BASE_URL = Autodesk.Forge.Constants.API_PROTOCOL + '://' + Autodesk.Forge.Constants.API_HOST_STG;
        break;
    case 'prod':
        API_BASE_URL = Autodesk.Forge.Constants.API_PROTOCOL + '://' + Autodesk.Forge.Constants.API_HOST_PROD;
        break;
    default:
        API_BASE_URL = Autodesk.Forge.Constants.API_PROTOCOL + '://' + Autodesk.Forge.Constants.API_HOST_DEV;
}

var options = {
	env: ENV,
	redirectUri: REDIRECT_URI,
    twoLeggedTokenUrl: AUTH_SERVER_URL ? AUTH_SERVER_URL + '/get_credentials' : null,
    threeLeggedTokenUrl: AUTH_SERVER_URL ? AUTH_SERVER_URL + '/access_token' : null,
    refreshTokenUrl: AUTH_SERVER_URL ? AUTH_SERVER_URL + '/refresh_token' : null,
    scope: ['data:read', 'data:create', 'data:write', 'bucket:read', 'bucket:create']
};

Autodesk.Forge.Client.initialize(CLIENT_ID, options);