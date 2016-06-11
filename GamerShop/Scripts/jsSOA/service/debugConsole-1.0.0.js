var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that displays each unhandled request through the pubsub provider to the console
(function (namespace) {
    var _key = 'debugConsole';
    var _pubsub;
    var _subIds;
    var _logMethod;
    
    //Displays a notification for the specified message
    var handlePreProcessMessage = function (msg) {
        _logMethod('Message: Channel: ' + msg.channelName + ' Command: ' + msg.command + ' Type: ' + msg.type);
    };

    //Displays a notification for the specified message
    var handlePostProcessMessage = function (msg) {        
        if (!msg.handled) {
            _logMethod('Unhandled Message: Channel: ' + msg.channelName + ' Command: ' + msg.command + ' Type: ' + msg.type);
        }
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        var global = Function('return this')(); //find the global root object
        var console = global.console;

        _logMethod = (console && console.log) || function () { };
            
        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribePreProcessHandler(handlePreProcessMessage));
        _subIds.enqueue(_pubsub.subscribePostProcessHandler(handlePostProcessMessage));
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
