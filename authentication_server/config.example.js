/*
 config.example.js / config.js
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 This file contains information specific for your application.
 It should include your client id and your client secret (in case of a 3-legged flow you'll also need the callback URL)
 which you should copy from your app's page in the Autodesk Developer Portal (https://developer.autodesk.com/myapps)

 In order for the system to work, you must copy this file from config.example.js
 to config.js - it will be automatically excluded from the version control thanks to git settings.
 */

module.exports = {
    FORGE_ENV: '<enter your environment>', // dev / stg / prod
    CLIENT_ID: '<enter your client id here>',
    CLIENT_SECRET: '<enter your client secret here>'
};
