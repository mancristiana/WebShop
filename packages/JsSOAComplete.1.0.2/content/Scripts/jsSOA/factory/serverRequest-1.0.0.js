var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Initializes a server request factory, which creates objects that can be used for communicating with the server
(function (namespace) {
	var key = 'serverRequest';
	var nextId = 0;
    
	var RequestFactory = function () {
	    this.id = nextId++;
	    this.progressContainerId = undefined;
	    this.displayProgress = true;
	    this.url = undefined;
	    this.verb = 'POST';
	    this.data = undefined;
	    this.contentType = 'application/json; charset=utf-8';
	    this.dataType = 'json';
	    this.callback = undefined;
	    this.errorCallback = undefined;
	    this.context = undefined;	    
	};

    //Null cancellation method to be replaced with actual method by class that processes requests
	RequestFactory.prototype.cancel = function () { };
	
    //Creates a new server request object
	var createRequest = function () {        
	    return new RequestFactory();
	};
	
    //Assign the create method to the assigned namespace
	namespace[key] = {
	    create: createRequest
	};
})(jsSOA.factory);