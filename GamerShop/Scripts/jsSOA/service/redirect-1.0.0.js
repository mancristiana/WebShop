var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that checks if the browser supports the minimum requirements of the application
(function (namespace) {
    var _key = 'redirect';
    var _pubsub;
    var _subIds;

    //Validates that the specified url is defined
    var validateUrl = function (url) {
        if (url === undefined || url === null) {
            throw 'Service: ' + _key + ' \'message.data.url\' is required';
        }
    };

    //Handles the system engine initialized message and begins browser compatibility checks
    var handleRedirectMessage = function (msg) {
        var url = msg.data.url;
        validateUrl(url);

        var replace = false;
        if (msg.data.replace) {
            replace = true;
        }

        setTimeout(function () { redirectBrowser(url, replace); }, 10);
    };

    //Redirects the browser to the incompatible browser page
    var redirectBrowser = function (url, replace) {
        if (replace) {
            window.location.replace(url);
        }
        else {
            window.location.href = url;
        }
    };
    
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleRedirectMessage, _pubsub.createMessage('system').withCommand('redirect')));
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
