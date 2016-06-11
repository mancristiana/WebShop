var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that tracks the users device id and assigns it to server requests
(function (namespace) {
    var _key = 'serverDeviceId';
    var _pubsub;
    var _subIds;

    var _serverHeaderKey = 'Client-Device-Id';
    var _storageKey = 'serverDeviceId';
    var _storageType = 'persistent'; //(persistent or session)
    var _deviceId;
    var _attemptedToLoadDeviceId = false;
    
    //Validates the header request message
    var validateHeaderRequest = function (msg) {
        if (!msg.data.headers) {
            throw 'Service: ' + _key + ' \'message.data.headers\' is required';
        }
    };

    //Assigns the users authentication information to the outgoing request header object
    var handleRequestPrepareMessage = function (msg) {
        validateHeaderRequest(msg);

        if (!_attemptedToLoadDeviceId && (_deviceId === undefined || _deviceId === null)) {
            var storageRequestMsg = _pubsub.createMessage('storage').withType(_storageType).withCommand('get').withData('key', _storageKey);
            _pubsub.publish(storageRequestMsg);

            if (storageRequestMsg.handled) {
                var value = storageRequestMsg.data.value;

                if (value !== undefined && value !== null) {
                    _deviceId = value;
                }
            }
            else {
                _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('error').withData('text', 'No storage provider found to restore device id.').withData('source', _key));
            }
            _attemptedToLoadDeviceId = true;
        }

        if (_deviceId !== undefined && _deviceId !== null) {
            msg.data.headers[_serverHeaderKey] = _deviceId;
        }
    };

    //Handles all server responses, attempting to extract the device id sent from the server and store it
    var handleServerResponseMessage = function (msg) {
        var xhr = msg.data.xhr;

        if (xhr) {
            var deviceId = xhr.getResponseHeader(_serverHeaderKey);

            if (deviceId !== undefined && deviceId !== null && _deviceId !== deviceId) {
                _deviceId = deviceId;

                var storageRequestMsg = _pubsub.createMessage('storage').withType(_storageType).withCommand('set').withData('key', _storageKey).withData('value', _deviceId);
                _pubsub.publish(storageRequestMsg);

                if (!storageRequestMsg.handled) {
                    _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('error').withData('text', 'No storage provider found to store device id.').withData('source', _key));
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
