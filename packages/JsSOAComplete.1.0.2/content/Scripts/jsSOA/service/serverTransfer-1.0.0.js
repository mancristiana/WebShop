var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that manages communications with the server
(function (namespace) {
    var _key = 'serverTransfer';
    var _pubsub;
    var _subIds;
    
    //Validates the specified server request
    var validateRequest = function (request) {
        if (request === undefined || request === null) {
            throw 'Service: ' + _key + ' \'message.data.request\' is required';
        }

        if (!request.url) {
            throw 'Service: ' + _key + ' \'message.data.request.url\' is required';
        }

        if (!request.verb) {
            throw 'Service: ' + _key + ' \'message.data.request.verb\' is required';
        }
    };

    //Handles the server successfully completing a request
    var doneCallback = function (request, originalMsg, data, textStatus, xhr) {
        if (!request._cancelled) {
            var callback = request.callback;
            if (callback) {
                callback(data, textStatus, xhr);
            }
        
            _pubsub.publish(_pubsub.createMessage('server').withCommand('response').withType(originalMsg.type).withData('request', request).withData('response', data).withData('xhr', xhr).inResponseTo(originalMsg));
        }
    };

    //Handles a failed server request
    var failCallback = function (request, originalMsg, xhr, textStatus, errorThrown) {        
        if (!request._cancelled) {
            var errorCallback = request.errorCallback;
            if (errorCallback) {
                errorCallback(xhr, textStatus, errorThrown);
            }
      
            _pubsub.publish(_pubsub.createMessage('server').withCommand('error').withType(originalMsg.type).withData('request', request).withData('xhr', xhr).inResponseTo(originalMsg));
            _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Server Request Error').withData('text', 'We apologize.  An error occurred while attempting to communicate with the server.').inResponseTo(originalMsg));
        }
    };

    //Handles the completion of any server request (whether it failed or succeeded)
    var alwaysCallback = function (request, originalMsg, xhr) {
        if (!request._cancelled) {
            _pubsub.publish(_pubsub.createMessage('server').withCommand('complete').withType(originalMsg.type).withData('request', request).withData('xhr', xhr).inResponseTo(originalMsg));
        }
    };

    //Handles the message to request data or submit data to the server and initiates communications to the server
    var handleServerMessage = function (msg) {
        var request = msg.data.request;
        validateRequest(request);
        
        var headers = {};
        
        var prepareMsg = _pubsub.createMessage('server').withType('request').withCommand('prepare')
            .withData('url', request.url)            
            .withData('verb', request.verb)
            .withData('headers', headers)
            .withData('contentType', request.contentType)
            .withData('dataType', request.dataType)
            .withData('data', request.data)
            .withData('request', request);
        _pubsub.publish(prepareMsg);

        var url = prepareMsg.data.url;
        var data = prepareMsg.data.data;
        var verb = prepareMsg.data.verb;
        var contentType = prepareMsg.data.contentType;
        var dataType = prepareMsg.data.dataType;

        if (data === undefined && verb.toLowerCase() !== 'get') {
            data = null; //don't allow undefined since jquery chokes on non-gets
        }

        var dataText = JSON.stringify(data);
                
        var requestXhr = $.ajax({
            type: verb,
            url: url,
            headers: headers,
            data: dataText,
            processData: false,
            contentType: contentType,
            dataType: dataType
        }).done(function (data, textStatus, xhr) {
            doneCallback(request, msg, data, textStatus, xhr);
        }).fail(function (xhr, textStatus, errorThrown) {
            failCallback(request, msg, xhr, textStatus, errorThrown);
        }).always(function (xhr, textStatus, errorThrown) {
            alwaysCallback(request, msg, xhr, textStatus, errorThrown);
        });

        request.cancel = function () { cancelRequest(requestXhr, request); };
    };

    //Attempts to cancel the request associated with the specified xhr
    var cancelRequest = function (xhr, request) {
        request._cancelled = true;

        if (xhr && xhr.abort) {
            xhr.abort();
        }        
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        $.support.cors = true;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleServerMessage, _pubsub.createMessage('server').withCommand('request')));
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
