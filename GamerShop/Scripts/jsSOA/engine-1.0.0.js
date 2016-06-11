var jsSOA = jsSOA || {};

//The application engine controller
(function (namespace) {
    var _pubsub;
    var _svcMgr;
    var _appName;
    var _initializationMethods;
    var _servicesInitializedSubscriptionId;

    //Initialize the application, including the pubsub provider and all services
    var initialize = function (serviceNamespaces, appName, sslRequired) {
        //Ensure a secure connection
        if (window) {
            if (sslRequired && window.location.href.indexOf('http://') >= 0) {
                window.location = window.location.href.replace('http://', 'https://');
                return;
            }
                        
            $(window).bind('beforeunload', dispose);
        }
        _appName = appName;

        if (_initializationMethods) {
            var initMethod;
            while (initMethod = _initializationMethods.dequeue()) {
                initMethod();
            }
            _initializationMethods = undefined;
        }

        _pubsub = jsSOA.factory.pubsub.create();
        _servicesInitializedSubscriptionId = _pubsub.subscribe(handleServiceMgrInitialized, (_pubsub.createMessage('system').withType('services').withCommand('initialized')));

        _svcMgr = jsSOA.factory.servicemgr.create(_pubsub, serviceNamespaces);
        _svcMgr.beginInitialize();        
    };

    //Handles the initialized event, raised after all services have completed initialization
    var handleServiceMgrInitialized = function (msg) {
        _pubsub.unsubscribe(_servicesInitializedSubscriptionId);
        _servicesInitializedSubscriptionId = undefined;

        _pubsub.publish(_pubsub.createMessage('system').withType('engine').withCommand('initialized').withData('appName', _appName));
    };

    //Adds the specified method to the initialization process of the framework
    var addInitializationMethod = function (method) {
        if (!_initializationMethods) {
            _initializationMethods = jsSOA.factory.queue.create();
        }
        _initializationMethods.enqueue(method);
    };

    //Stop the application, disposing all dependant objects
    var dispose = function () {
        _pubsub.publish(_pubsub.createMessage('system').withType('engine').withCommand('dispose'));

        _svcMgr.dispose();        
    };

    namespace['engine'] = {
        initialize: initialize,
        addInitializationMethod: addInitializationMethod,
        dispose: dispose
    };
})(jsSOA);