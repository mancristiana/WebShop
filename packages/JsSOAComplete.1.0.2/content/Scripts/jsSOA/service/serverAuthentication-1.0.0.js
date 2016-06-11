var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that tracks the users server authentication information and assigns it to server requests
(function (namespace) {
    var _key = 'serverAuthentication';
    var _pubsub;
    var _subIds;

    var _serverHeaderKey = 'Authentication-Token';
    var _storageKey = 'serverAuthenticationToken';
    var _storageType = 'persistent'; //(persistent or session)
    var _authToken;
    var _attemptedToLoadAuthToken = false;
    
    //Validates the header request message
    var validateHeaderRequest = function (msg) {
        if (!msg.data.headers) {
            throw 'Service: ' + _key + ' \'message.data.headers\' is required';
        }
    };

    //Assigns the users authentication information to the outgoing request header object
    var handleRequestPrepareMessage = function (msg) {
        validateHeaderRequest(msg);

        if (!_attemptedToLoadAuthToken && (_authToken === undefined || _authToken === null)) {
            var storageRequestMsg = _pubsub.createMessage('storage').withType(_storageType).withCommand('get').withData('key', _storageKey);
            _pubsub.publish(storageRequestMsg);

            if (storageRequestMsg.handled) {
                var value = storageRequestMsg.data.value;

                if (value !== undefined && value !== null) {
                    _authToken = value;
                }
            }
            else {
                _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('error').withData('text', 'No storage provider found to restore authentication token.').withData('source', _key));
            }
            _attemptedToLoadAuthToken = true;
        }

        if (_authToken !== undefined && _authToken !== null) {
            msg.data.headers[_serverHeaderKey] = _authToken;
        }
    };

    //Handles all server responses, attempting to extract the authentication token sent from the server and store it
    var handleServerResponseMessage = function (msg) {
        var xhr = msg.data.xhr;

        if (xhr) {
            var authToken = xhr.getResponseHeader(_serverHeaderKey);

            if (authToken !== undefined && authToken !== null && _authToken !== authToken) {
                _authToken = authToken;

                var storageRequestMsg = _pubsub.createMessage('storage').withType(_storageType).withCommand('set').withData('key', _storageKey).withData('value', _authToken);
                _pubsub.publish(storageRequestMsg);

                if (!storageRequestMsg.handled) {
                    _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('error').withData('text', 'No storage provider found to store authentication token.').withData('source', _key));
                }
            }
        }
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleRequestPrepareMessage, _pubsub.createMessage('server').withType('request').withCommand('prepare')));
        _subIds.enqueue(_pubsub.subscribe(handleServerResponseMessage, _pubsub.createMessage('server').withCommand('response')));
    };

    //Disposes of this service by removing pubsub handlers
    var dispose = function () {
        _pubsub.unsubscribe(_subIds);
    };

    //extend the specified namespace with this service
    namespace[_key] = {
        key: _key,
        initialize: initialize,
        dispose: dispose
    };
})(jsSOA.service);
