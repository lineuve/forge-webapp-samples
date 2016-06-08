Web App Samples
========================
### Introduction
These applications demonstrate Forge cloud based 3D model storage, mesh preparation and mesh healing and can also provide an example of the Forge OAuth 2.0 3-legged login procedure.

### Required setup before running the sample code
1. Clone the software repository to a folder on your web server. 
2. If you have not already done so, create an app on the [Autodesk Developers Portal](https://developer.autodesk.com/myapps).
3. In the app screen, for the Callback URL field enter the fully qualified URL of the sample's `plugins/login/login-callback.html` page (do not use a relative path).
4. Copy the client id and client secret for later use.
5. Setup your app with your app key - see info in the "Quick Start" section.

### Quick Start
#### Client setup
Copy the file `client/scripts/config.example.js` to `client/scripts/config.js` and supply these details:

* **CLIENT_ID** - paste the client id from step 4 in the previous section
* **REDIRECT_URI** - The redirect uri the Forge Auth flow will redirect your users after they will complete the login process. 
This repository is provided with a login callback html file that makes this task easy. 
The file is located in `plugins/login/login-callback.html` and you should set your REDIRECT_URI to `http://example.com/your-app/client/plugins/login/login-callback.html` (assumed the home page of your app is `http://example.com/your-app/client`)
* **ENV** - The environment of the API - `dev` / `stg` / `prd`. Default is `dev`.
* **AUTH_SERVER_URL** - The server path that implements the endpoints for the authorization flow. For more details see next section.

#### Authentication server setup
This repo ships with a nodejs authorization server. For more details see the `authentication_server/README.MD`

### The contents of this repository
This repository demonstrates the use of Forge APIs in a 3D Model Healing Utility For Printing (healing-utility.html) - 
Improve 3D printing success rates and minimize printing time with our extensive range of API print-preparation tools. 
Heal, fix and optimize your model for different materials, textures and file output types.
