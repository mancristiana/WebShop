var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Creates the service manager factory
(function (namespace) {
	var key = 'servicemgr';
	
	//Creates a new service manager instance
    var create = function (pubsub, serviceNamespaces) {
        var _pendingNamespaces = jsSOA.factory.queue.create();
        var _servicesPendingInitialization = {};
        var _beganInitializationOfAllServices = false;
        var _subIds;
        
		//Sends the initialized message to the pubsub framework if all namespaces have been initialized
        var publishInitializedMessage = function () {
            //wait for each namespace to initialize completely before moving on to the next one
            //so that any dependencies between namespaces will be satisfied.
            if (_pendingNamespaces.getCount() > 0) {
                initializeNextPendingNamespace();
            }
            else {
                pubsub.publish(pubsub.createMessage('system').withType('services').withCommand('initialized'));
            }
        };

    	//Handles the completion of initialization of services that were
		//initialized asynchronously
        var initializationCompleteMessageHandler = function (msg) {
        	var svckey = msg.data.serviceKey;
        	if (svckey && _servicesPendingInitialization[svckey]) {
        		delete _servicesPendingInitialization[svckey];

        		if (!hasPendingServices() && _beganInitializationOfAllServices) {
        			publishInitializedMessage();
        		}
        	}
        };

        //Determines if there are any asynchronous services pending initialization
        var hasPendingServices = function () {
            var hasPendingServices = false;

            for (var loopKey in _servicesPendingInitialization) {
                if (_servicesPendingInitialization.hasOwnProperty(loopKey)) {
                    hasPendingServices = true;
                    break;
                }
            }

            return hasPendingServices;
        };
		
    	//Initializes the service manager.  Discovers all services in the specified namespace
		//and initializes them.
        var beginInitialize = function () {
            _subIds = jsSOA.factory.queue.create();
            _subIds.enqueue(pubsub.subscribe(initializationCompleteMessageHandler, pubsub.createMessage('system').withType('service').withCommand('initialized')));

            _pendingNamespaces.enqueueRange(serviceNamespaces);
            initializeNextPendingNamespace();
        };

        //Initializes the next namespace that is pending initialization
        var initializeNextPendingNamespace = function () {
            _servicesPendingInitialization = {};
            _beganInitializationOfAllServices = false;

            var serviceNamespace = _pendingNamespaces.dequeue();

            if (serviceNamespace) {
                for (var key in serviceNamespace) {
                    if (serviceNamespace.hasOwnProperty(key)) {
                        var svc = serviceNamespace[key];
                        initializeService(svc);
                    }
                }
            }

            _beganInitializationOfAllServices = true;

            if (!hasPendingServices()) {
                publishInitializedMessage();
            }
        };

        //Initializes the specified service
        var initializeService = function (svc) {
            if (!svc.key) return;

            if (svc.initialize) {
                svc.initialize(pubsub);

                pubsub.publish(pubsub.createMessage('system').withType('service').withCommand('initialized').withData('serviceKey', svc.key));
            }
            else if (svc.beginInitialize) {
                _servicesPendingInitialization[svc.key] = svc;
                svc.beginInitialize(pubsub);
            }
        };

		//Disposes of all of the services being managed by the service manager.
        var dispose = function () {
            pubsub.unsubscribe(_subIds);

            //dispose of service namespaces in the opposite order that we initialized them
            var reverseNamespaces = serviceNamespaces.slice(0).reverse();
            
            for (var key in reverseNamespaces) {
                if (reverseNamespaces.hasOwnProperty(key)) {
                    var svc = reverseNamespaces[key];
                    if (svc.dispose) {
                        svc.dispose();
                    }
                }
            }           
        };
        
        return {
        	beginInitialize: beginInitialize,
			dispose: dispose
        };
    }

	//assign the factory to the specified namespace
    namespace[key] = {
        create: create
    };
})(jsSOA.factory);
