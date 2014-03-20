# node-adm

node-adm is a Node.JS library for [**Amazon Device Messaging for Kindle**](https://developer.amazon.com/appsandservices/apis/engage/device-messaging).

## Notes

 * Automatically performs the OAuth2 access token fetch on `send`
 * Will re-authenticate itself once the token expires
 * Loosely based on [node-gcm](https://github.com/ToothlessGear/node-gcm)
 
## Usage

```js
var adm = require('node-adm');

var registration_id = YOUR_REGISTRATION_ID;

var options = {
  client_id: YOUR_ADM_CLIENT_ID,
  client_secret: YOUR_ADM_CLIENT_SECRET
};

var admSender = new adm.Sender();

var messsage = {
  data: {
    message: "Hello"
  },
  consolidationKey: "Some Key",
  expiresAfter: 86400      
}
admSender.send(messsage, registration_id, function(err, result) {
  if (err) {
    // No recoverable error
    console.log(err);
    process.exit(1);
    return;
  }
  if (result.error) {      
    // ADM Server error such as InvalidRegistrationId
    console.log("Error: " + result.error);
  } else if (result.registrationID) {
    console.log("Success, current registration ID: " + result.registrationID);
  }
  process.exit(0);
})

```

## Contribute!

Send us a pull request if you see bugs or have suggestions!

## Licence

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Changelog

**0.9.1:** 03/20/2014
 * initial release
