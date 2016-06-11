var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that checks if the browser supports the minimum requirements of the application
(function (namespace) {
    var _key = 'loadingPanel';
    var _pubsub;
    var _subIds;
    
    var _loadingImageSize = { width: 50, height: 50 };
    var _loadingImageUrl = '/Content/Images/LoadingPanel/loader.gif';
    var _fadeColor = 'black';
    var _fadeOpacity = 0.15;
    var _imageFadeOpacity = 0.6;
    var _delay = 400;
    var _minTimeInMsFaded = 50;
    var _fadeInMs = 350;
    var _fadeOutMs = 400;
    var _delayedIds = {};
    var _nextPanelId = 0;

    //Displays a loading panel for the specified container
    var show = function (progressContainerId, loadingPanelId, fadeDelay) {
        createLoadingPanel(progressContainerId, loadingPanelId);

        if (fadeDelay > 0) {
            var timeoutId = setTimeout(function () { fadeLoadingPanel(progressContainerId, loadingPanelId); }, _delay);
            _delayedIds[loadingPanelId] = timeoutId;
        }
        else {
            fadeLoadingPanel(progressContainerId, loadingPanelId);
        }
    };

    //Handles the click event of the loading panel
    var handleLoadingPanelClick = function (e) {
        e.stopPropagation();
    };

    //Creates a blank div that blocks interactive with the underlying content
    var createLoadingPanel = function (progressContainerId, loadingPanelId) {
        var progressContainer = $('#' + progressContainerId);
        if (progressContainer.length === 1) {
            var divId = 'loadingPnl' + loadingPanelId;
            var loadingDiv = $('<div id="' + divId + '"/>');
            loadingDiv.css({
                display: 'inline',
                position: 'absolute',
                top: '0px',
                left: '0px',
                right: '0px',
                bottom: '0px',
                'z-index': '13000',
                height: '100%',
                width: '100%'
            });

            progressContainer.append(loadingDiv);
            loadingDiv.click(handleLoadingPanelClick);
        }
    };

    //Fades the loading panel and displays the progress image
    var fadeLoadingPanel = function (progressContainerId, loadingPanelId) {
        var progressContainer = $('#' + progressContainerId);
        if (progressContainer.length == 1) {
            var loadingDiv = $('#loadingPnl' + loadingPanelId);
            loadingDiv.css({
                'background-color': _fadeColor,
                'opacity': 0.0
            });

            loadingDiv.attr('data-fadeTime', (new Date()).getTime());
            loadingDiv.fadeTo(_fadeInMs, _fadeOpacity);

            if (_loadingImageUrl) {
                var imgSize = _loadingImageSize;

                if (progressContainer.width() > imgSize.width && progressContainer.height() > imgSize.height) {
                    var negHalfHeight = '-' + parseInt(imgSize.height / 2, 10) + 'px';
                    var negHalfWidth = '-' + parseInt(imgSize.width / 2, 10) + 'px';

                    var imgId = 'loadingPnlImg' + loadingPanelId;
                    var loadingDivImg = $('<img id="' + imgId + '" alt="Loading" src="' + _loadingImageUrl + '" />');

                    loadingDivImg.css({
                        'position': 'absolute',
                        'top': '50%',
                        'margin-top': negHalfHeight,
                        'left': '50%',
                        'margin-left': negHalfWidth,
                        'height': imgSize.height + 'px',
                        'width': imgSize.width + 'px',
                        'opacity': 0.0,
                        'z-index': '13000'
                    });

                    progressContainer.append(loadingDivImg); //Add to parent container instead of loading panel so the image doesnt fade
                    loadingDivImg.click(handleLoadingPanelClick);
                    loadingDivImg.fadeTo(_fadeInMs, _imageFadeOpacity);
                }
            }
        }
    };

    //Hides the loading panel for the specified id
    var hide = function (loadingPanelId) {
        var timeoutId = _delayedIds[loadingPanelId];
        if (timeoutId) {
            clearTimeout(timeoutId);
            delete _delayedIds[loadingPanelId];
        }
        
        var actuallyHide = true;

        var loadingDiv = $('#loadingPnl' + loadingPanelId);
        if (loadingDiv.length > 0) {
            var timeAttr = loadingDiv.attr('data-fadeTime');

            var msElapsed = (new Date()).getTime() - timeAttr;
            var msRemaining = _minTimeInMsFaded - msElapsed;

            if (msRemaining > 0) {
                setTimeout(function () { hide(loadingPanelId); }, msRemaining);
                actuallyHide = false;
            }
        }

        if (actuallyHide) {
            if (loadingDiv.length > 0) {
                loadingDiv.fadeOut(_fadeOutMs, function () { removeLoadingDiv(loadingDiv); });
            }

            var loadingDivImg = $('#loadingPnlImg' + loadingPanelId);
            if (loadingDivImg.length > 0) {
                loadingDivImg.fadeOut(_fadeOutMs, function () { removeLoadingDivImg(loadingDivImg); });
            }
        }
    };

    //Removes the loading div and unbinds any event handlers
    var removeLoadingDiv = function (loadingDiv) {
        loadingDiv.unbind('click', handleLoadingPanelClick);
        loadingDiv.remove();
    };

    //Removes the loading image and unbinds any event handlers
    var removeLoadingDivImg = function (loadingDivImg) {
        loadingDivImg.unbind('click', handleLoadingPanelClick);
        loadingDivImg.remove();
    };

    //Handles the requests to show loading panels
    var handleShowMessage = function (msg) {
        var containerId = msg.data.containerId;

        if (containerId === undefined || containerId === null) {
            throw 'Service: ' + _key + ' \'message.data.containerId\' is required';
        }

        var specifiedDelay = msg.data.fadeDelay;
        var fadeDelay = (specifiedDelay !== undefined && specifiedDelay !== null) ? specifiedDelay : _delay;

        var id = _nextPanelId++;
        show(containerId, id, fadeDelay);

        msg.data.loadingPanelId = id;
    };

    //Handles the requests to hide loading panels
    var handleHideMessage = function (msg) {
        var id = msg.data.loadingPanelId;

        if (id === undefined || id === null) {
            throw 'Service: ' + _key + ' \'message.data.loadingPanelId\' is required';
        }

        setTimeout(function() { hide(id)}, 10);
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleShowMessage, _pubsub.createMessage('loadingPanel').withCommand('show')));
        _subIds.enqueue(_pubsub.subscribe(handleHideMessage, _pubsub.createMessage('loadingPanel').withCommand('hide')));
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
