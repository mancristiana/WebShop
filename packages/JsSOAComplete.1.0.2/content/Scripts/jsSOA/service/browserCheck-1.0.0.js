var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that checks if the browser supports the minimum requirements of the application
(function (namespace) {
    var _key = 'browserCheck';
    var _pubsub;
    var _subIds;

    //Handles the system engine initialized message and begins browser compatibility checks
    var handleSystemEngineInitializedMessage = function (msg) {
        var compatibilityMsg = _pubsub.createMessage('system').withType('browserCompatibility').withCommand('check').withData('isBrowserCompatible', true);
        _pubsub.publish(compatibilityMsg);

        if (!compatibilityMsg.handled) {
            _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('warning').withData('text', 'No compatibility check providers found.').withData('source', _key));
        }
        
        if (!compatibilityMsg.data.isBrowserCompatible) {
            _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('information').withData('text', 'Incompatibile browser.  Redirecting to warning page.').withData('source', _key));
            _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Incompatible Browser').withData('text', 'This application is not compatible with your internet browser.'));
            
            var redirectUrl = compatibilityMsg.data.incompatibleBrowserUrl;
            if (!redirectUrl) {
                _pubsub.publish(_pubsub.createMessage('system').withCommand('redirect').withData('url', redirectUrl).withData('replace', true));
            }
        }

        delete namespace[_key]; //once we have checked, we no longer need to use this service
    };
    
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleSystemEngineInitializedMessage, _pubsub.createMessage('system').withType('engine').withCommand('initialized')));
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