var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that displays UI messages to the user
(function (namespace) {
    var _key = 'notification';
    var _pubsub;
    var _subIds;
    
    //Validates that the specified title and text each have a value; otherwise, throws an exception
    var validateTitleAndText = function (title, text) {
        if (title === undefined || title === null) {
            throw 'Service: ' + _key + ' \'message.data.title\' is required';
        }

        if (text === undefined || text === null) {
            throw 'Service: ' + _key + ' \'message.data.text\' is required';
        }
    };

    //Displays a notification for the specified message
    var handleShowMessage = function (msg) {        
        var title = msg.data.title;
        var text = msg.data.text;

        validateTitleAndText(title, text);

        $.sticky('<b>' + title + '</b><p>' + text + '</p>');
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        if ($.sticky) {
            _subIds = jsSOA.factory.queue.create();
            _subIds.enqueue(_pubsub.subscribe(handleShowMessage, _pubsub.createMessage('notification').withCommand('show')));
        }
        else {
            delete namespace[_key];
        }
    };

    //Disposes of this service by removing pubsub handlers
    var dispose = function () {
        if (_subIds) {
            _pubsub.unsubscribe(_subIds);
        }
    };

    //extend the specified namespace with this service
    namespace[_key] = {
        key: _key,
        initialize: initialize,
        dispose: dispose
    };
})(jsSOA.service);
