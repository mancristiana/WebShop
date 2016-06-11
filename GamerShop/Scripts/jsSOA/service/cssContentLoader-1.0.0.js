var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that loads and renders html
(function (namespace) {
    var _key = 'cssContentLoader';
    var _pubsub;
    var _subIds;
    
    //Handles the message to render a tile and does the actual rendering
    var handleLoadCssContentMessage = function (msg) {
        var url = msg.data.url;         
      
        var request = jsSOA.factory.serverRequest.create();
        request.displayProgress = false;
        request.url = url;
        request.verb = 'GET';
        request.contentType = '';
        request.dataType = 'html';
        request.callback = function (response, status, xhr) { handleContentLoaded(url, msg, response, status, xhr); };
        request.errorCallback = function (xhr, status, error) { handleContentLoadError(url, msg, xhr, status, error); };
        _pubsub.publish(_pubsub.createMessage('server').withType('request').withCommand('request').withData('request', request));                
    };

    //Handles an error that occurs when loading the html
    var handleContentLoadError = function (url, originalMsg, xhr, status, error) {
        _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('warning').withData('source', _key).withData('text', 'Failed to load css content from source:' + url).inResponseTo(originalMsg));

        _pubsub.publish(_pubsub.createMessage('content').withType('css').withCommand('loaded').withData('success', false).withData('url', url).inResponseTo(originalMsg));
    };

    //Handles the html content successfully loaded message
    var handleContentLoaded = function (url, originalMsg, response, status, xhr) {
        if (response) {
            var style = $('<style></style>');
            style.html(response);
            $('head').append(style);
        }

        _pubsub.publish(_pubsub.createMessage('content').withType('css').withCommand('loaded').withData('success', true).withData('url', url).inResponseTo(originalMsg));
    };
  
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleLoadCssContentMessage, _pubsub.createMessage('content').withCommand('load').withType('css')));
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
