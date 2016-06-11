//Name: JsSequence
//Description: A simple, dependency free JavaScript module for generating sequential numbers.  
//Notes: This can be used standalone or as a component of the JsSOA framework.
//Author: Keith A. Knight 
//http://keithaknight.com
//https://www.linkedin.com/in/keithaknight
//https://github.com/keithaknight

var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Initializes a sequence factory, which will provide an object that generates a unique sequence of numbers
//without concern of duplication or other sources altering the internal values used to generate the sequence.
(function (namespace) {
    var key = 'sequence';

    //Creates a new sequence object
    var createSequence = function () {
        var id = 0;

        //Returns the next sequential number
        var next = function () {
            return id++; //since this uses ++, it will return 0 before incrementing
        };

        //use the revealing pattern to retain the actual number hidden
        return {
            next: next
        };
    };

    //Assign the create method to the assigned namespace
    namespace[key] = {
        create: createSequence
    };
})(jsSOA.factory);
