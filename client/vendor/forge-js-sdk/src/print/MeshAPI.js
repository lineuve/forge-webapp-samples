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
        _meshCounter = 0,
        _apiEndpoint = '/ps/v1';


    var requestImport = function (fileId, name) {
        ++_meshCounter;
        name = name || ('Mesh_' + _meshCounter);
        var headers = {'Content-Type': 'application/json'};
        var payload = JSON.stringify({
            'file_id': fileId,
            'name': name
        });
        return Client.authorized3LeggedApiRequest(_apiEndpoint + '/geom/meshes/import').post(headers, payload);
    };

    /**
     * @class Autodesk.Forge.MeshAPI
     * @description - Autodesk.Forge.MeshAPI is a singleton object providing interface methods for invoking the Mesh related operations available
     * in the Forge REST API. There is no need to construct this object and its static methods can be invoked simply as: Autodesk.Forge.MeshAPI.methodName(...).
     */
    Autodesk.Forge.MeshAPI = {

        /**
         * @method importMesh
         * @memberOf Autodesk.Forge.MeshAPI
         * @description - Convert a previously uploaded file to a Spark Mesh Resource.
         * Input files must be converted to mesh objects in order to analyze
         * and prepare them for printing.
         * @param {number} fileId - The Spark Drive Id of the previously uploaded data file.
         * @param {string} name - A user defined name for this mesh resource.
         * @param {Array} [transform] - Optional transform to be applied to this mesh. This should be an array containing the three rows of an affine transformation. The default value is the identity transform: [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ] ].
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to a Mesh Resource Object.
         */
        importMesh: function (fileId, name, transform, progressCallback) {
            var waiter = new Autodesk.Forge.TaskWaiter(progressCallback);

            return requestImport(fileId, name, transform)
                .then(waiter.wait);
        },

        /**
         * @method transformMesh
         * @memberOf Autodesk.Forge.MeshAPI
         * @description - Modify the transform applied to a Spark Mesh Resource.
         * @param meshId
         * @param {Array} transform - Optional transform to be applied to this mesh. This should be an array containing the three rows of an affine transformation. The default value is the identity transform: [ [ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ] ].
         *
         * @returns {Object} - A new Spark Mesh Resource with the modified transform.
         */
        transformMesh: function (meshId, transform) {
            // TODO: This needs generateVisual option (even though transforms are not applied to visuals).
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                id: meshId,
                transform: transform
            });
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/geom/meshes/transform').post(headers, payload);
        },

        /**
         * @method analyzeMesh
         * @memberOf Autodesk.Forge.MeshAPI
         * @description - Perform a printable analysis on a given Spark Mesh Resource.
         * @param {String} meshId - The Id associated with an existing Spark Mesh Resource.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to the input Mesh Resource with analysis results available in the "problems" property. See https://spark.autodesk.com/developers/reference/print
         */
        analyzeMesh: function (meshId, progressCallback) {
            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                id: meshId
            });
            var waiter = new Autodesk.Forge.TaskWaiter(progressCallback);
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/geom/meshes/analyze').post(headers, payload)
                .then(waiter.wait);
        },

        /**
         * @method repairMesh
         * @memberOf Autodesk.Forge.MeshAPI
         * @description - Perform all possible mesh repair operations on a given Spark Mesh Resource.
         * @param {String} meshId - The Id associated with an existing Spark Mesh Resource.
         * @param {boolean} [isRepairAll] - Optional flag. If false - will repair only one problem at a time. default: true.
         * @param {boolean} [generateVisual] - Optional flag requesting that a Bolt file be generated for visualization purposes.
         * @param {Function} [progressCallback] - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - A Promise which resolves to a new Mesh Resource with possible repairs applied. See https://spark.autodesk.com/developers/reference/print
         */
        repairMesh: function (meshId, isRepairAll, generateVisual, progressCallback) {
            var headers = {'Content-Type': 'application/json'};

            if (isRepairAll === undefined) {
                isRepairAll = true;
            }

            var payload = JSON.stringify({
                id: meshId,
                all: isRepairAll,
                generate_visual: !!generateVisual
            });
            var waiter = new Autodesk.Forge.TaskWaiter(progressCallback);
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/geom/meshes/repair').post(headers, payload)
                .then(waiter.wait);
        },

        /**
         * @method exportMesh
         * @memberOf Autodesk.Forge.MeshAPI
         * @description exports Mesh and eventually returns a downloadable fileId
         * @param meshId - The Id associated with an existing Spark Mesh Resource.
         * @param fileType - The type of the export file: obj (Wavefront OBJ), stl_ascii (ASCII STL) or stl_binary (binary STL). default stl_ascii
         * @param progressCallback - Optional function to be invoked when import progress updates are available. The function is passed a numeric value in the range [0, 1].
         *
         * @returns {Promise} - Promise which resolves to a file_id for downloading.
         */
        exportMesh: function (meshId, fileType, progressCallback) {

            fileType = fileType || "stl_ascii";

            var headers = {'Content-Type': 'application/json'};
            var payload = JSON.stringify({
                id: meshId,
                file_type: fileType
            });
            var waiter = new Autodesk.Forge.TaskWaiter(progressCallback);
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/geom/meshes/export').post(headers, payload)
                .then(waiter.wait);
        }
    };

}());
