// Namespacing
var Autodesk = Autodesk || {};
Autodesk.Forge = Autodesk.Forge || {};

(function () {
    'use strict';

    var Client = Autodesk.Forge.Client,
        _apiEndpoint = '/ps/v1';

    // The printDB singleton.
    // TODO: Should we cache results?
    // TODO: There is a way to make this object's properties immutable. Is that something we would want to do?
    Autodesk.Forge.PrintDB = {
        /**
         * @param {String} [typeId] - The type ID. If not specified, return all printer types.
         * @returns {Promise} - A promise that will resolve with a list of printer types.
         */
        getPrinterType: function (typeId) {
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/printdb/printertypes/' + typeId)
                .get();
        },

        getPrinterTypes: function () {
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/printdb/printertypes')
                .get()
                .then(function (data) {
                    return data.printerTypes;
                });
        },

        /**
         * @param {String} [materialId] - The type ID. If not specified, return all materials.
         * @returns {Promise} - A promise that will resolve with a list of materials.
         */
        getMaterial: function (materialId) {
            materialId = materialId || '';
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/printdb/materials/' + materialId)
                .get();
        },

        /**
         * @param {String} [profileId] - The type ID. If not specified, return all profiles.
         * @param {Object} [params] - request parameters.
         * @returns {Promise} - A promise that will resolve with a list of profiles.
         */
        getProfile: function (profileId, params) {
            profileId = profileId || '';
            return Client.authorized3LeggedApiRequest(_apiEndpoint + '/printdb/profiles/' + profileId)
                .get(null, params);
        }
    };

}());
