var jsSOA = jsSOA || {};
jsSOA.site = jsSOA.site || {};
jsSOA.site.service = jsSOA.site.service || {};

//Service that checks if the browser supports the minimum requirements of the site
(function (namespace) {
    var _key = 'cssCompatibilityBrowserCheck';
    var _pubsub;
    var _subIds;
    var _cssClasses = []; //TODO: specify the name (as a string) of each css class that you want to ensure the browser supports 

    //Checks to see if the browser is compatibile with this service
    var handleCompatibilityCheck = function (msg) {
        if (msg.data.isBrowserCompatible && !areCssClassesSupported()) {
            msg.data.isBrowserCompatible = false;
        }

        msg.data.incompatibleBrowserUrl = ''; //TODO: specify the url of a page to redirect to if the browser is not compatible (optional)

        if (!_cssClasses || _cssClasses.length === 0) {
            _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'No Css Compatibility checks have been defined').withData('text', 'No Css Compatibility checks have been defined in the cssCompatibilityBrowserCheck service'));
        }
    };

    //Determines if the required css classes are supported
    var areCssClassesSupported = function () {
        var supported = true;

        for (var idx = 0, count = _cssClasses; idx < count; idx++) {
            var cssClass = _cssClasses[idx];

            if (document.body.style[cssClass] === undefined) {
                supported = false;
                break;
            }
        }

        return supported;
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleCompatibilityCheck, _pubsub.createMessage('system').withType('browserCompatibility').withCommand('check')));
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