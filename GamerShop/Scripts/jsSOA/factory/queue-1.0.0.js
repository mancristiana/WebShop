//Name: JsPubSub
//Description: A simple, dependency free JavaScript queue object
//Notes: This can be used standalone or as a component of the JsSOA framework.
//Author: Keith A. Knight 
//http://keithaknight.com
//https://www.linkedin.com/in/keithaknight
//https://github.com/keithaknight

var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Initializes a queue factory, that will provide an object that manages a queue
(function (namespace) {
	var key = 'queue';

    //Constructor for Queue objects
	var QueueFactory = function () {
	    this._values = [];
	    this._offset = 0;
	};

    //Enqueues the specified value
	QueueFactory.prototype.enqueue = function (value) {
	    this._values.push(value);
	};

    //Enqueues each value from an array of values
	QueueFactory.prototype.enqueueRange = function (values) {
	    for (var idx = 0, count = values.length; idx < count; idx++) {
	        this.enqueue(values[idx]);
	    }
	};

    //Dequeues the specified item from the queue
	QueueFactory.prototype.dequeue = function () {
	    var values = this._values;
	    var offset = this._offset;

	    var value = values[offset];
	    values[offset] = null; //clear pointer to value so that it can be collected

	    offset++; //advance the offset

	    //clean up the queue if the start to have a lot of unused elements
	    if (offset > 50) {
	        values = values.splice(offset);
	        offset = 0;
	    }

	    this._offset = offset;

	    return value;
	};

    //Gets the number of items currently enqueued
	QueueFactory.prototype.getCount = function () {
	    return this._values.length - this._offset;
	};

    //Clears the queue, removing all items
	QueueFactory.prototype.clear = function () {
	    this._values = [];
	    this._offset = 0;
	};

    //Creates a new queue object
	var createQueue = function () {
	    return new QueueFactory();
	};
	
    //Assign the create method to the assigned namespace
	namespace[key] = {
	    create: createQueue
	};
})(jsSOA.factory);