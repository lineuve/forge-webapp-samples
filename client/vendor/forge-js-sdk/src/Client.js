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


(function () {
    'use strict';

    var Constants = Autodesk.Forge.Constants,
        Helpers = Autodesk.Forge.Helpers,
        Request = Autodesk.Forge.Request;

    var ACCESS_TOKEN_KEY = 'forge-access-token';

    var _clientId = '',
        _apiBaseUrl = '',
        _2LeggedTokenUrl = '',
        _3LeggedTokenUrl = '',
        _refreshTokenUrl = '',
        _redirectUri = '',
        _scope;

    /**
     * Gets an access_token and stores it in localStorage, afterwards returns a promise that resolves to a 2-legged access token.
     *
     * @returns {Promise} - A promise that resolves to a 2-legged access token.
     */
    var get2LeggedToken = function () {
        if (_2LeggedTokenUrl) {
            return Request(_2LeggedTokenUrl).get().then(function (data) {
                var now = Date.now();
                data.expires_at = now + parseInt(data.expires_in) * 1000;
                localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));
                return data.access_token;
            });
        }
        return Promise.reject(new Error('No Server Implementation'));
    };

    /**
     * @description - Completes the login process, gets an access_token and stores it in localStorage.
     * @memberOf ADSKSpark.Client
     * @param {String} code - The code that was returned after the user signed in. {@see ADSKSpark.Client#login}
     * @returns {Promise} - A promise that resolves to the access token.
     */
    var complete3LeggedFlow = function (code) {
        var params = {code: code};

        if (_redirectUri) {
            params.redirect_uri = _redirectUri;
        } else {
            params.redirect_uri = Helpers.calculateRedirectUri();
        }
        if (_3LeggedTokenUrl) {
            return Request(_3LeggedTokenUrl, null, {withCredentials: true}).get(undefined, params).then(function (data) {
                if (data && data.httpStatus === 200 && data.expires_in && data.access_token) {
                    var now = Date.now();
                    data.expires_at = now + parseInt(data.expires_in) * 1000;

                    //we don't need httpStatusText and httpStatus in our object
                    delete(data.httpStatusText);
                    delete(data.httpStatus);
                    localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));

                    return data.access_token;
                }
                return Promise.reject(new Error(data.Error));
            });
        }
        return Promise.reject(new Error('No Server Implementation'));
    };

    /**
     * @class Represents a Client
     * @description - The Client API singleton that allows to call various api methods
     * See reference - https://spark.autodesk.com/developers/reference/authentication
     */
    Autodesk.Forge.Client = {

        /**
         * @description - Initializes the client.
         * @memberOf Autodesk.Forge.Client
         * @param {String} clientId - The client id provided when you registered your app.
         * @param {Object} [options]:
         *                    env - The Forge environment (dev, stg, prd)
         *                    redirectUri - The URI that the Spark OAuth service will return the browser to
         *                    _2LeggedTokenUrl - The URL of your authentication server used for 2-legged tokens. This server should
         *                                 handle exchanging the client secret for an access token.
         *                    _3LeggedTokenUrl - The URL of your authentication server used for 3-legged tokens. This server should
         *                                 handle exchanging a provided code for an access token.
         *                    refreshTokenUrl - The URL of your authentication server used to refresh access tokens. This server
         *                                  should call the refresh token api (extend the expiry time) and return a new valid
         *                                  access token.
         */
        initialize: function (clientId, options) {
            _clientId = clientId;
            switch(options.env) {
                case 'stg':
                    _apiBaseUrl = Constants.API_HOST_STG;
                    break;
                case 'prod':
                    _apiBaseUrl = Constants.API_HOST_PROD;
                    break;
                default:
                    _apiBaseUrl = Constants.API_HOST_DEV;
            }
            _redirectUri = options && options.redirectUri ? options.redirectUri : null;
            _2LeggedTokenUrl = options && options.twoLeggedTokenUrl ? options.twoLeggedTokenUrl : null;
            _3LeggedTokenUrl = options && options.threeLeggedTokenUrl ? options.threeLeggedTokenUrl : null;
            _refreshTokenUrl = options && options.refreshTokenUrl ? options.refreshTokenUrl : null;
            if (options && options.scope && Array.isArray(options.scope) && options.scope.length > 0) {
                _scope = options.scope.join('%20');
            }

        },

        /**
         * @description - Returns the URL to redirect to for logging in.
         * @memberOf Autodesk.Forge.Client
         * @returns {String} - The URL.
         */
        getLoginRedirectUrl: function () {

            var redirectUri = _redirectUri || Helpers.calculateRedirectUri();

            var redirectionUrl = _apiBaseUrl + '/authentication/v1/authorize?' +
                'response_type=code' +
                '&client_id=' + _clientId +
                '&redirect_uri=' + redirectUri;

            if (_scope) {
                redirectionUrl += '&scope=' + _scope;
            }

            return redirectionUrl;
        },

        /**
         * @description - Clears access token that had been stored in localStorage
         * @memberOf Autodesk.Forge.Client
         */
        logout: function () {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        },

        /**
         * @description - Checks whether the access token exists.
         * @memberOf Autodesk.Forge.Client
         * @returns {Boolean} - True if the access token exists. Otherwise, false.
         */
        isTokenExist: function () {
            return !!JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
        },
        /**
         * @description - Checks whether the access token exists and has not expired.
         * @memberOf Autodesk.Forge.Client
         * @returns {Boolean} - True if the access token exists and has not expired. Otherwise, false.
         */
        isAccessTokenValid: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            var now = Date.now();
            return !!(accessToken && accessToken.expires_at && accessToken.expires_at > now);
        },

        /**
         * @description - Returns the full access token object if one is currently in local storage. Null otherwise.
         * @memberOf Autodesk.Forge.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessTokenObject: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            return (accessToken && accessToken.access_token) ? accessToken : null;
        },

        /**
         * @description - Returns the access_token if one is currently in local storage. Null otherwise.
         * @memberOf Autodesk.Forge.Client
         * @returns {?String} - The access token or null if not found.
         */
        getAccessToken: function () {
            var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            return (accessToken && accessToken.access_token) ? accessToken.access_token : null;
        },

        /**
         * @description - Return a promise that resolves to a 2-legged access token.
         * This will attempt to retrieve the token from local storage. If it's missing, a call will be made to
         * the authentication server.
         * @memberOf Autodesk.Forge.Client
         * @returns {Promise} - A promise that resolves to the guest token.
         */
        get2LeggedToken: function () {
            var token = JSON.parse(localStorage.getItem(GUEST_TOKEN_KEY));
            var now = Date.now();

            //if guest token is not implemented try to use access token
            if (!token) {
                token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
            }

            if (token && token.expires_at && token.expires_at > now) {
                return Promise.resolve(token.access_token);
            }

            return get2LeggedToken();
        },

        /**
         * @description - Refreshes the access token to extend its expiry and returns a promise that resolves to the access token object
         * @memberOf Autodesk.Forge.Client
         * @returns {Promise} - A promise that resolves to the access token object.
         */
        refreshAccessToken: function () {
            if (_refreshTokenUrl) {

                return Request(_refreshTokenUrl, null, {withCredentials: true})
                    .get()
                    .then(function (data) {
                        if (!data.errorCode) {
                            var now = Date.now();
                            data.expires_at = now + parseInt(data.expires_in) * 1000;
                            localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(data));
                        }
                        return data;
                    });
            }
            return Promise.reject(new Error('No Server Implementation'));
        },

        /**
         * @description - Request the API with a 3-legged access token (if exists)
         * @memberOf Autodesk.Forge.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request
         * @returns {Object} - The request object that abstracts REST APIs
         */
        authorized3LeggedApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};

            function formatAuthHeader(token) {
                return token ? ('Bearer ' + token.access_token) : null;
            }

            return Request(_apiBaseUrl + endpoint, function () {
                return new Promise(function (resolve, reject) {
                    var token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
                    if (token) {
                        // If the token has an expires_at property and the token
                        // has expired, then refresh it.
                        var now = Date.now();

                        if (_refreshTokenUrl && token.expires_at && now > token.expires_at) {
                            _this.refreshAccessToken()
                                .then(function (refreshedToken) {
                                    if (refreshedToken.error) {
                                        reject(new Error('Refresh token failed, please login again'));
                                    } else {
                                        resolve(formatAuthHeader(refreshedToken));
                                    }

                                });
                        } else {
                            resolve(formatAuthHeader(token));
                        }

                    } else {
                        resolve(null);
                    }
                });
            }, options);
        },

        /**
         * @description - Request the API with a 2-legged token (if exists)
         * @memberOf Autodesk.Forge.Client
         * @param {String} endpoint - The API endpoint to query
         * @param {Object} [options] - Additional options that are supported by Request
         * @returns {Object} - The request object that abstracts REST APIs
         */
        authorizedAs2LeggedApiRequest: function (endpoint, options) {
            var _this = this;
            options = options || {};
            return Request(_apiBaseUrl + endpoint, function () {
                return new Promise(function (resolve) {
                    _this.get2LeggedToken().then(function (token) {
                        resolve(token ? ('Bearer ' + token) : null);
                    });
                });
            }, options);
        },

        /**
         * @description - Open an auth window
         * @memberOf Autodesk.Forge.Client
         */
        openLoginWindow: function () {
            Helpers.popupWindow(this.getLoginRedirectUrl(), 350, 700);
        },

        /**
         * @description - Completes the login process and stores it in localStorage.
         * @memberOf Autodesk.Forge.Client
         * @returns {Promise}
         */
        completeLogin: function () {
            var code = Helpers.extractRedirectionCode();
            if (code) {
                code = code.replace(/[\/\\]+$/, '');
                return complete3LeggedFlow(code);
            }
            return Promise.reject(new Error('No code supplied'));

        }
    };

}());
