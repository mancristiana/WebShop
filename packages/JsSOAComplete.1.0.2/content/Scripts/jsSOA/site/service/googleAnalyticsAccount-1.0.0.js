var jsSOA = jsSOA || {};
jsSOA.site = jsSOA.site || {};
jsSOA.site.service = jsSOA.site.service || {};

//Service that passes the Google Analytics account number to the jsSOA framework to track page usage
(function (namespace) {
    var _key = 'googleAnalyticsAccount';
    var _pubsub;
    var _subIds;

    //Handles any requests for the Google Analytics account number
    var handleAccountRequest = function (msg) {
        if (!msg.data.account) {
            msg.data.account = undefined; //TODO: specify your Google Analytics Account number here (as a string)

            if (!msg.data.account) {
                _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Google Analytics Account Not Specified').withData('text', 'Your Google Analytics account number has not been configured in the googleAnalyticsAccount service'));
            }
        }
    };
  
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleAccountRequest, _pubsub.createMessage('system').withType('googleAnalytics').withCommand('accountRequest')));
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