//Name: JsLoader
//Description: A simple, dependency free dynamic JavaScript library loader, with optional callback
//Author: Keith A. Knight 
//http://keithaknight.com
//https://www.linkedin.com/in/keithaknight
//https://github.com/keithaknight

var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Initializes a library loader factory, that will provide an object that dynamically loads javascript libraries
(function (namespace) {
    var key = 'jsLoader';

    //Constructor for JsLoader objects
    var JsLoaderFactory = function (scriptUrl) {        
        this._scriptUrl = scriptUrl;
        this._isLoadedMethod;
        this._callback;
    };

    //Internal method that handles the timer tick event and checks to see if the library has completed loading
    JsLoaderFactory.prototype._handleTimerTick = function () {
        if (this._isLoadedMethod()) {
            this._callback();
        }
        else {
            this._startLoadingTimer();
        }
    };

    //Internal method that starts a timer to check if the library has completed loading
    JsLoaderFactory.prototype._startLoadingTimer = function () {
        var that = this;
        var instancedHandler = function () { that._handleTimerTick(); };
        setTimeout(instancedHandler, 100);
    };

    //Public method that starts loading the library.  Optionally, parameters may be specified 
    //to determine when it has been loaded and execute the specified callback.
    JsLoaderFactory.prototype.load = function (isLoadedMethod, callback) {
        this._isLoadedMethod = isLoadedMethod;
        this._callback = callback;

        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = true;
        scr.src = this._scriptUrl;
        var firstScr = document.getElementsByTagName('script')[0];
        firstScr.parentNode.insertBefore(scr, firstScr);

        if (callback && isLoadedMethod) {
            this._startLoadingTimer();
        }
    };
       
    //Creates a new JsLoader object
    var createJsLoader = function (scriptUrl) {
        return new JsLoaderFactory(scriptUrl);
    };

    //Assign the create method to the assigned namespace
    namespace[key] = {
        create: createJsLoader
    };
})(jsSOA.factory);