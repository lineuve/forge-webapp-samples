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

    /**
     * @constant
     * @description - Various constants
     */
    Autodesk.Forge.Constants = {
        //api endpoints
        API_HOST_PROD: 'developer.api.autodesk.com',
        API_HOST_STG: 'developer-stg.api.autodesk.com',
        API_HOST_DEV: 'developer-dev.api.autodesk.com',
        //api protocol
        API_PROTOCOL: 'https'
    };

}());
