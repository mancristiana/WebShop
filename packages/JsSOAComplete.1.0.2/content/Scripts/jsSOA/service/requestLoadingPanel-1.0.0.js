var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that checks if the browser supports the minimum requirements of the application
(function (namespace) {
    var _key = 'requestLoadingPanel';
    var _pubsub;
    var _subIds;
    
    //Handles all server requests going out, displays a loading panel for it
    var handleServerRequestMessage = function (msg) {
        var request = msg.data.request;
        
        if (request.displayProgress) {
            var containerId = request.progressContainerId;

            if (containerId) {
                var msg = _pubsub.createMessage('loadingPanel').withCommand('show').withData('containerId', containerId);
                _pubsub.publish(msg);
                request.loadingPanelId = msg.data.loadingPanelId;
            }
            else {
                _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('warning').withData('text', 'The progress container has not been properly assigned.').withData('source', 'engine'));
                _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Missing Progress Container').withData('text', 'The progress container has not been properly assigned.'));
            }
        }
    };

    //Handles all server responses, hiding the loading panel
    var handleServerCompleteMessage = function (msg) {
        var request = msg.data.request;

        if (request && request.loadingPanelId !== undefined && request.loadingPanelId !== null) {
            _pubsub.publish(_pubsub.createMessage('loadingPanel').withCommand('hide').withData('loadingPanelId', request.loadingPanelId));
        }
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleServerRequestMessage, _pubsub.createMessage('server').withCommand('request')));
        _subIds.enqueue(_pubsub.subscribe(handleServerCompleteMessage, _pubsub.createMessage('server').withCommand('complete')));
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
