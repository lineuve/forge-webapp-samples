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
        _apiEndpoint = '/ps/v1';

    Autodesk.Forge.TaskWaiter = function (progressCallback) {
        var _this = this;
        var _taskId, _interval;

        this._checkTaskResponse = function (taskResponse) {
            console.log('Task status: ', taskResponse.status, 'progress:', taskResponse.progress);

            if (taskResponse.status === 'done') {
                return taskResponse.result;
            }
            if (taskResponse.status === 'error') {
                return Promise.reject(taskResponse.error);
            }
            if (progressCallback) {
                progressCallback(taskResponse.progress);
            }

            // console.log('Delay task');

            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, _interval);
            }).then(_this._pollTask);
        };

        this._pollTask = function () {
            // console.log('Poll task');
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/print/tasks/' + _taskId)
                .get().then(_this._checkTaskResponse);
        };

        this.wait = function (opResult, interval) {
            if (opResult.httpStatus === 200) {
                return Promise.resolve(opResult);
            }

            interval = interval || 100;
            if (interval < 10) {
                interval = 10;
            }

            _taskId = opResult.id; // or is it body.id ?
            _interval = interval;

            return _this._pollTask();
        };
    };

}());
