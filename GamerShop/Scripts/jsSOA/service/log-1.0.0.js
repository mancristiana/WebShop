var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that logs warnings or errors that have occurred client-side
(function (namespace) {
    var _key = 'log';
    var _pubsub;
    var _subIds;
    var _appName;
    var _defaultAppName = 'site';
    var _logSvcUrl = undefined;
    
    //Validates that the specified log message is valid; otherwise, throws an exception
    var validateLogMessage = function (msg) {
        if (msg.type === undefined || msg.type === null) {
            throw 'Service: ' + _key + ' \'message.data.type\' is required';
        }

        var validMsgType = false;
        switch(msg.type) {
            case 'information':
            case 'warning':            
            case 'error':
            case 'critical':
                validMsgType = true;
                break;
        }

        if (!validMsgType) {
            throw 'Service: ' + _key + ' \'message.data.type\' is not valid.  Valid values: critical, error, warning, information';
        }

        if (msg.data.text === undefined || msg.data.text === null) {
            throw 'Service: ' + _key + ' \'message.data.text\' is required';
        }
    };

    //Handles the system engine initialization method, grabbing the app name from it.
    var handleSystemInitMessage = function (msg) {
        var appName = msg.data.appName;
        _appName = appName ? appName : _defaultAppName;

        var logUrlMsg = _pubsub.createMessage('system').withType('log').withCommand('urlRequest').withData('logUrl', undefined);
        _pubsub.publish(logUrlMsg);

        if (logUrlMsg.handled && logUrlMsg.data.logUrl) {
            _logSvcUrl = logUrl;
        }        
    };

    //Logs the specified message to the server
    var handleLogMessage = function (msg) {                
        validateLogMessage(msg);

        if (!_logSvcUrl) {
            _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Logging Disabled').withData('text', 'We apologize.  The logging service is not fully implemented yet.'));
        }
        else {
            var request = jsSOA.factory.serverRequest.create();
            request.url = _logSvcUrl;
            request.displayProgress = false;
            request.data = {
                level: msg.type,
                source: 'client.' + _appName + (msg.data.source ? '.' + msg.data.source : ''),
                text: msg.data.text !== undefined ? msg.data.text : null,
                exceptionString: msg.data.error ? msg.data.error : null
            };

            _pubsub.publish(_pubsub.createMessage('server').withCommand('request').withData('request', request));
        }       
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _appName = _defaultAppName;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleLogMessage, _pubsub.createMessage('log').withCommand('write')));
        _subIds.enqueue(_pubsub.subscribe(handleSystemInitMessage, _pubsub.createMessage('system').withType('engine').withCommand('initialized')));
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