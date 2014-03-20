/*!
 * node-adm
 & Author: Anton Lopyrev (http://twitter.com/tokudu)
 * Copyright(c) 2014 SoThree,Inc <support@umanoapp.com>
 * Apache Licensed
 */

var Constants = {

    'ADM_OAUTH_ENDPOINT' : 'api.amazon.com',

    'ADM_OAUTH_ENDPATH' : '/auth/O2/token',

    'ADM_GRANT_TYPE' : 'client_credentials',

    'ADM_SCOPE' : 'messaging:push',

    'JSON_GRANT_TYPE' : 'grant_type',

    'JSON_SCOPE' : 'scope',

    'JSON_CLIENT_ID' : 'client_id',

    'JSON_CLIENT_SECRET' : 'client_secret',


    'ADM_SEND_ENDPOINT' : 'api.amazon.com',

    'ADM_SEND_ENDPATH' : '/messaging/registrations/registration_id/messages',

    'PARAM_REGISTRATION_ID' : 'registration_id',

    'MAX_AUTHENTICATION_RETRIES' : 3
};

module.exports = Constants;
