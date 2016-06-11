var jsSOA = jsSOA || {};
jsSOA.site = jsSOA.site || {};
jsSOA.site.service = jsSOA.site.service || {};

//Service that passes the logging url to the jsSOA framework to handle log requests
(function (namespace) {
    var _key = 'logUrl';
    var _pubsub;
    var _subIds;

    //Handles any requests for the loggin url
    var handleUrlRequest = function (msg) {
        if (!msg.data.logUrl) {
            msg.data.logUrl = undefined; //TODO: specify your logging url (if applicable)

            if (!msg.data.logUrl) {
                _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Log Url Not Specified').withData('text', 'Your logging url has not been configured in the logUrl service'));
            }
        }
    };
  
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleUrlRequest, _pubsub.createMessage('system').withType('log').withCommand('urlRequest')));
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
})(jsSOA.site.service);