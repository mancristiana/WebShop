var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that checks if the browser supports the minimum requirements of the application
(function (namespace) {
    var _key = 'googleAnalytics';
    var _pubsub;
    var _subIds;

    //Handles the system engine initialized message and begins browser compatibility checks
    var handleSystemEngineInitializedMessage = function (msg) {
        var accountMsg = _pubsub.createMessage('system').withType('googleAnalytics').withCommand('accountRequest').withData('account', null);
        _pubsub.publish(accountMsg);

        if (!accountMsg.handled || !accountMsg.data.account) {
            _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('warning').withData('text', 'No Google Analytics account providers found.').withData('source', _key));
        }
        else {
            var _gaq = [];

            var global = Function('return this')(); //find the global root object
            global['_gaq'] = _gaq; //make global so ga.js can use it

            _gaq.push(['_setAccount', accountMsg.data.account]);
            _gaq.push(['_trackPageview']);

            var url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var loader = jsSOA.factory.jsLoader.create(url);
            loader.load();
        }
      
        _pubsub.unsubscribe(_subIds);
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