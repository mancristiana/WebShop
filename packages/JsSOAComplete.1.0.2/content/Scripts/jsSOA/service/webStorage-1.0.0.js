var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that stores and retrieves session level data
(function (namespace) {    
    //Creates a new storage service for the specified type of storage
    var createStorageService = function (serviceKey, webStorageType, pubsubMessageType) {
        var _pubsub;
        var _subIds;

        //Checks to see if the browser is compatibile with this service
        var handleCompatibilityCheck = function (msg) {
            if (msg.data.isBrowserCompatible && !isWebStorageSupported()) {
                msg.data.isBrowserCompatible = false;
            }
        };

        //Determines if the browser supports web storage.  Returns true or false.
        var isWebStorageSupported = function () {
            var supported = false;

            try {
                supported = (webStorageType in window) && (window[webStorageType] !== null);
            }
            catch (ex) { }

            return supported;
        };

        //Validates that they specified key is not null and not undefined
        var validateKey = function (key) {
            if (key === undefined || key === null) {
                throw 'Service: ' + serviceKey + ' Argument: \'key\' is required';
            }
        };

        //Handles any requests to set a value in storage.
        var handleSet = function (msg) {
            var key = msg.data.key;
            var value = msg.data.value;

            if (value === undefined) {
                handleRemove(msg);
            }
            else {
                validateKey(key);
                window[webStorageType][key] = value;
            }
        };

        //Handles any requests to get values from storage 
        var handleGet = function (msg) {
            var key = msg.data.key;

            validateKey(key);
            msg.data.value = window[webStorageType][key];
        };

        //Handles any requests to remove values from storage
        var handleRemove = function (msg) {
            var key = msg.data.key;

            validateKey(key);
            window[webStorageType].removeItem(key);
        };

        //Handles any requests to clear the storage
        var handleClear = function (msg) {
            if (!msg.type || msg.type === pubsubMessageType) {
                window[webStorageType].clear();
            }
        };

        //Initialization method configures the web storage service.
        var initialize = function (pubsub) {
            _pubsub = pubsub;

            _subIds = jsSOA.factory.queue.create();
            _subIds.enqueue(_pubsub.subscribe(handleSet, _pubsub.createMessage('storage').withType(pubsubMessageType).withCommand('set')));
            _subIds.enqueue(_pubsub.subscribe(handleGet, _pubsub.createMessage('storage').withType(pubsubMessageType).withCommand('get')));
            _subIds.enqueue(_pubsub.subscribe(handleRemove, _pubsub.createMessage('storage').withType(pubsubMessageType).withCommand('remove')));
            _subIds.enqueue(_pubsub.subscribe(handleClear, _pubsub.createMessage('storage').withCommand('clear'))); //don't filter by type, leave this to the method so we can have a clear all (regardless of type)                              

            _subIds.enqueue(_pubsub.subscribe(handleCompatibilityCheck, _pubsub.createMessage('system').withType('browserCompatibility').withCommand('check')));
        };

        //Disposes of this service by removing pubsub handlers
        var dispose = function () {
            _pubsub.unsubscribe(_subIds);
        };

        //only register the service if it is currently supported
        if (isWebStorageSupported()) {
            namespace[serviceKey] = {
                key: serviceKey,
                initialize: initialize,
                dispose: dispose
            };
        }
    };

    createStorageService('persistentStorage', 'localStorage', 'persistent');
    createStorageService('sessionStorage', 'sessionStorage', 'session');

})(jsSOA.service);
