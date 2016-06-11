var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that loads and renders html
(function (namespace) {
    var _key = 'htmlContentLoader';
    var _pubsub;
    var _subIds;

    //Validates the container to create the html content in
    var validateContainerId = function (containerId) {
        if (containerId === undefined || containerId === null) {
            throw 'Service: ' + _key + ' \'message.data.containerId\' is required';
        }
    };
    
    //Handles the message to render a tile and does the actual rendering
    var handleLoadHtmlContentMessage = function (msg) {
        var url = msg.data.url;        
        var containerId = msg.data.containerId;
        
        validateContainerId(containerId);        
      
        var request = jsSOA.factory.serverRequest.create();
        request.displayProgress = false;
        request.url = url;
        request.verb = 'GET';
        request.contentType = '';
        request.dataType = 'html';
        request.callback = function (response, status, xhr) { handleContentLoaded(containerId, url, msg, response, status, xhr); };
        request.errorCallback = function (xhr, status, error) { handleContentLoadError(containerId, url, msg, xhr, status, error); };
        _pubsub.publish(_pubsub.createMessage('server').withType('request').withCommand('request').withData('request', request));                
    };

    //Handles an error that occurs when loading the html
    var handleContentLoadError = function (containerId, url, originalMsg, xhr, status, error) {
        _pubsub.publish(_pubsub.createMessage('log').withCommand('write').withType('warning').withData('source', _key).withData('text', 'Failed to load html content from source:' + url).inResponseTo(originalMsg));

        _pubsub.publish(_pubsub.createMessage('content').withType('html').withCommand('loaded').withData('success', false).withData('containerId', containerId).withData('url', url).inResponseTo(originalMsg));
    };

    //Handles the html content successfully loaded message
    var handleContentLoaded = function (containerId, url, originalMsg, response, status, xhr) {
        $('#' + containerId).append(response);
        _pubsub.publish(_pubsub.createMessage('content').withType('html').withCommand('loaded').withData('success', true).withData('containerId', containerId).withData('url', url).inResponseTo(originalMsg));
    };
  
    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleLoadHtmlContentMessage, _pubsub.createMessage('content').withCommand('load').withType('html')));
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
