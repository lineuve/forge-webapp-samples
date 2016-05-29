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

    var Client = Autodesk.Forge.Client,
        _apiEndpoint = '/oss/v2';

    /**
     * @class
     * @description - The OSS API singleton.
     */
    Autodesk.Forge.OSS = {

        /**
         * @description - Create a new bucket
         * @memberOf Autodesk.Forge.OSS
         * @param {Object} bucketParams - The bucket object - has the form of:
         *                          bucketKey: The name of the bucket
         *                          policyKey: Storing policy of the bucket (transient / temporary / persistent)
         * @returns {Promise} - A promise that will resolve to a bucket
         */
        createBucket: function(bucketParams){

            if (bucketParams.bucketKey) {
                var headers = {'Content-Type': 'application/json'};
                return Client.authorized3LeggedApiRequest(_apiEndpoint + '/buckets').post(headers, JSON.stringify(bucketParams));
            }

            return Promise.reject(new Error('You need to supply bucketKey'));
        },

        /**
         * @description - Get the details for a specific bucket
         * @memberOf Autodesk.Forge.OSS
         * @param {String} bucketKey - The name of the bucket where the file will be uploaded
         * @returns {Promise} - A promise that will resolve to a bucket
         */
        getBucketDetails: function (bucketKey) {

            //Make sure fileId is defined and that it is valid
            if (bucketKey) {
                return Client.authorized3LeggedApiRequest(_apiEndpoint + '/buckets/' + bucketKey + '/details').get();
            }

            return Promise.reject(new Error('You need to supply bucketKey'));
        },

        /**
         * @description - Get a bucket, if it doesn't exist - create it
         * @memberOf Autodesk.Forge.OSS
         * @param {String} bucketKey - The name of the bucket where the file will be uploaded
         * @param {Object} bucket - The bucket object - has the form of:
         *                          bucketKey: The name of the bucket
         *                          policyKey: Storing policy of the bucket (transient / temporary / persistent)
         * @returns {Promise} - A promise that will resolve to a bucket
         */
        getOrCreateBucket: function(bucketKey, bucket){
            var _this = this;
            return this.getBucketDetails(bucketKey).then(function(bucketResp){
                return bucketResp;
            }, function(){
               return _this.createBucket(bucket);
            });
        },

        /**
         * @description - Upload a file to OSS
         * @memberOf Autodesk.Forge.OSS
         * @param {String} bucketKey - The name of the bucket where the file will be uploaded
         * @param {Object} fileData - The file object to upload - has the form of:
         *                          requestBody: The actual file data that is passed in the body
         *                          fileName: If we use fileUrl attribute
         * @returns {Promise} - A promise that will resolve to a file object response
         */
        uploadFile: function (bucketKey, fileData) {

            if (bucketKey && fileData.requestBody && fileData.fileName) {
                return Client.authorized3LeggedApiRequest(_apiEndpoint + '/buckets/' + bucketKey + '/objects/' + fileData.fileName).put(null, fileData.requestBody);
            }

            return Promise.reject(new Error('You need to supply bucketKey, requestBody and fileName'));
        },

        /**
         * @description - Download a user's file
         * @memberOf Autodesk.Forge.OSS
         * @param {String} bucketKey - The name of the bucket where the file resides
         * @param {String} objectName - the file to download
         * @returns {Promise} - A promise that will resolve to a JSON object with .download_url
         */
        downloadFile: function (bucketKey, objectName) {

            //Make sure fileId is defined and that it is valid
            if (bucketKey && fileId) {
                return Client.authorized3LeggedApiRequest(_apiEndpoint + '/buckets/' + bucketKey + '/objects/' + objectName,{notJsonResponse:true}).get();
            }

            return Promise.reject(new Error('You need to supply bucketKey and objectName'));
        }
    };

}());
