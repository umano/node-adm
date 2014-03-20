/*!
 * node-adm
 & Author: Anton Lopyrev (http://twitter.com/tokudu)
 * Copyright(c) 2014 SoThree,Inc <support@umanoapp.com>
 * Apache Licensed
 */
var Constants = require('./constants');

var https = require('https');

function Sender(options) {
  this.options = options || {};
  this.authenticationRetries = 0;
}

var authenticateMethod = Sender.prototype.authenticate = function (callback) {
  var self = this;
  
  if (!self.options.client_id) {
    return callback(new Error("Invalid client ID."));
  }
  if (!self.options.client_secret) {
    return callback(new Error("Invalid client secret."));
  }        

  var requestBody,
    post_options,
    post_req;

  requestBody = 
    Constants.JSON_GRANT_TYPE + "=" + Constants.ADM_GRANT_TYPE + "&" +
    Constants.JSON_SCOPE + "=" + Constants.ADM_SCOPE + "&" +
    Constants.JSON_CLIENT_ID + "=" + self.options.client_id + "&" +
    Constants.JSON_CLIENT_SECRET + "=" + self.options.client_secret;

  post_options = {
    host: Constants.ADM_OAUTH_ENDPOINT,
    port: '443',
    path: Constants.ADM_OAUTH_ENDPATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-length': Buffer.byteLength(requestBody, 'utf8')
    }
  };

  post_req = https.request(post_options, function (res) {
    var statusCode = res.statusCode,
      buf = '';
    res.setEncoding('utf-8');
    res.on('data', function (data) {
      buf += data;
    });

    res.on('end', function () {
      var data;
      // Make sure that we don't crash in case something goes wrong while
      // handling the response.
      try {
        data = JSON.parse(buf);
      } catch (e) {}

      if (statusCode === 503) {
        return callback(new Error('ADM service is unavailable.'));
      } else if (statusCode !== 200) {
        console.log(statusCode);
        console.log(data);
        return callback(new Error('ADM authentication failed' + (data && data.error ? ": " + data.error + "." : " due to unknown reason.")));
      }

      if (!data || !data.access_token || !data.expires_in) {
        return callback(new Error('Failed to parse the response from the ADM server.'));                
      } else {
        self.access_token = data.access_token;
        self.access_token_expiration_date = new Date(Date.now() + data.expires_in * 1000);
        // success
        callback(null, self.access_token);
      }
      
    });
  });

  post_req.on('error', function (e) {
    return callback(new Error('ADM authentication failed' + (e && e.message ? ": " + e.message + "." : " due to unknown reason.")));         
  });

  post_req.write(requestBody);
  post_req.end();
}

var sendMethod = Sender.prototype.send = function (message, registrationId, callback) {
  var self = this;  
  var tryToReauthenticate = function() {
    self.authenticationRetries++;
    if (self.authenticationRetries < Constants.MAX_AUTHENTICATION_RETRIES) {
      // need to authenticate if there is no access token or it has expired
      self.authenticate(function(err) {
        if (err) return callback(err);
        // try to send again
        self.send(message, registrationId, callback);
      });
    } else {
      return callback(new Error("Sender authentication failed after max retries."));
    }    
  }

  if (!this.access_token || (this.access_token_expiration_date < new Date())) {
    return tryToReauthenticate();
  }    
  self.authenticationRetries = 0;

  if (!message || !message.data) {
    return callback(new Error("Invalid message."));
  }

  if (!registrationId) {
    return callback(new Error("Invalid registration ID."));
  }   

  var requestBody,
    post_request_path,
    post_options,
    post_req;


  post_request_path = Constants.ADM_SEND_ENDPATH.replace(Constants.PARAM_REGISTRATION_ID, registrationId);

  requestBody = JSON.stringify(message);

  post_options = {
    host: Constants.ADM_SEND_ENDPOINT,
    port: '443',
    path: post_request_path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-length': Buffer.byteLength(requestBody, 'utf8'),
      'X-Amzn-Type-Version': 'com.amazon.device.messaging.ADMMessage@1.0',
      'Accept': 'application/json',
      'X-Amzn-Accept-Type': 'com.amazon.device.messaging.ADMSendResult@1.0',
      'Authorization': 'Bearer ' + this.access_token
    }
  };

  post_req = https.request(post_options, function (res) {
    var statusCode = res.statusCode,
      buf = '';
    res.setEncoding('utf-8');
    res.on('data', function (data) {
      buf += data;
    });

    res.on('end', function () {
      var data;
      // Make sure that we don't crash in case something goes wrong while
      // handling the response.
      try {
        data = JSON.parse(buf);
      } catch (e) {}

      if (statusCode === 503) {
        // Non recoverable error
        return callback(new Error('ADM service is unavailable.'));
      } if (statusCode === 401) {
        // Try to reauth
        return tryToReauthenticate();
      } else if (statusCode !== 200) {
        if (data && data.reason) {
          return callback(null, {
            error: data.reason
          });
        } else {
          // Non recoverable error
          return callback(new Error("Failed to send ADM message due to unknown reason."));
        }                
        return callback(new Error('ADM authentication failed' + (data && data.error ? ": " + data.error + "." : " due to unknown reason.")));
      }

      if (!data || !data.registrationID) {
        return callback(new Error('Failed to parse the response from the ADM server.'));                
      } else {            
        callback(null, data);
      }            
    });
  });

  post_req.on('error', function (e) {
    return callback(new Error('Failed to send ADM message' + (e && e.message ? ": " + e.message + "." : " due to unknown reason.")));         
  });

  post_req.write(requestBody);
  post_req.end();
};

module.exports = Sender;
