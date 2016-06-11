//Name: JsPubSub
//Description: A simple, dependency free JavaScript Publication / Subscription (PubSub) framework
//Notes: This can be used standalone or as a component of the JsSOA framework.
//Author: Keith A. Knight 
//http://keithaknight.com
//https://www.linkedin.com/in/keithaknight
//https://github.com/keithaknight

var jsSOA = jsSOA || {};
jsSOA.factory = jsSOA.factory || {};

//Publish / Subscribe functionality provider
(function (namespace) {
    var key = 'pubsub';
    var nextMsgId = 0;

    //Factory that will create message objects
    var MessageFactory = function (channelName) {        
        this.id = nextMsgId++;
        this.channelName = channelName;
        this.command = null;
        this.type = null;
        this.data = {};
        this.handled = false;
        this.responseTo = null;
    };

    //Method on Messages that allows the consumer to set the command
    MessageFactory.prototype.withCommand = function (command) {
        this.command = command;
        return this;
    };

    //Method on Messages that allows the consumer to set the type
    MessageFactory.prototype.withType = function (type) {
        this.type = type;
        return this;
    };

    //Method on Messages that allows the consumer to set the data
    MessageFactory.prototype.withData = function (name, value) {
        this.data[name] = value;
        return this;
    };

    //Method on Messages that allows the consumer to set the message that this
    //message is responding to
    MessageFactory.prototype.inResponseTo = function (msg) {
        this.responseTo = msg;
        return this;
    };

    //Gets to initial method that led to the creation and execution of this method
    MessageFactory.prototype.getRootMessage = function () {
        var root = this;
        while (root.responseTo && root !== root.responseTo) {
            root = root.responseTo;                
        }
        return root;
    };

    //Determines if this message chain contains a message with the specified id
    MessageFactory.prototype.chainContainsMessageId = function (id) {
        var found = false;
        var loopMsg = this;        

        while (!found && loopMsg) {
            found = loopMsg.id === id;
            
            if (!found) {
                if (loopMsg !== loopMsg.responseTo) {
                    loopMsg = loopMsg.responseTo;
                }
                else {
                    loopMsg = null;
                }
            }
        }

        return found;
    };

    //Actual constructor for pubsub, extends the specified namespace
    var createPubSub = function () {
        var channels = {};
        var preProcessHandlers = [];
        var postProcessHandlers = [];

        //Compares the specified message to the filter message.  Returns true if the
        //message matches the filter criteria
        var comparer = function (msg, filterMsg) {
            var match = true;

            for (var loopFilterKey in filterMsg) {
                if (filterMsg.hasOwnProperty(loopFilterKey) && loopFilterKey !== 'id') { //do not filter based on ID since it typically will not be manually assigned, but will be different from the actual message
                    var filterVal = filterMsg[loopFilterKey];
                    var msgVal = msg[loopFilterKey];
                    if (filterVal) {
                        if (typeof (filterVal) === 'object' && msgVal) {
                            match = comparer(msgVal, filterVal);
                        }
                        else if (typeof (filterVal) === 'function') { //ignore functions
                            match = true;
                        }
                        else {                            
                            match = msgVal && msgVal === filterVal;
                        }
                        if (!match) {
                            break;
                        }
                    }
                }
            }

            return match;
        };

        //Gets the pubsub channels with the specified name.  Creates a new channel
        //if the channel does not already exist
        var getChannel = function (name) {
            var channel = channels[name];
            if (!channel) {
                channel = [];
                channels[name] = channel;
            }
            return channel;
        };

        //Creates a new subscription object give the specified subscriber
        //and filter
        var subscriptionFactory = function () {
            var _nextSubscriptionId = 0;

            var createSubscription = function (subscriber, filterMessage) {
                return {
                    id: _nextSubscriptionId++,
                    subscriber: subscriber,
                    filterMessage: filterMessage
                };
            };

            return {
                create: createSubscription
            };
        }();

        //Publishes a message to all currently subscribed handlers.
        //Takes a message as the only parameter.
        var publish = function (message) {
            message.handled = false;
            var channel = getChannel(message.channelName);
            var immutableChannel = channel.slice(0); //subscribers may alter the channel collection

            for (var preIdx = 0, preCount = preProcessHandlers.length; preIdx < preCount; preIdx++) {
                try {                
                    preProcessHandlers[preIdx](message);
                }
                catch (preEx) { }
            }

            for (var idx = 0, count = immutableChannel.length; idx < count; idx++) {
                var subscription = immutableChannel[idx];
                if (comparer(message, subscription.filterMessage)) {
                    subscription.subscriber(message);
                    message.handled = true;
                }
            }

            for (var postIdx = 0, postCount = postProcessHandlers.length; postIdx < postCount; postIdx++) {
                try {
                    postProcessHandlers[postIdx](message);
                }
                catch (postEx) { }
            }
        };

        //Subscribes the specified subscriber to any messages that match the specified filter criteria
        var subscribe = function (subscriber, filterMessage) {
            var channel = getChannel(filterMessage.channelName);
            var subscription = subscriptionFactory.create(subscriber, filterMessage);
            channel.push(subscription);

            return subscription.id;
        };

        //Subscribes the specified handler to be executed prior to publishing a message
        var subscribePreProcessHandler = function (handler) {
            preProcessHandlers.push(handler);
        };

        //Subscribes the specified handler to be executed after publishing a message
        var subscribePostProcessHandler = function (handler) {
            postProcessHandlers.push(handler);
        };
        
        //Unsubscribes all of the subscription ids in the specified queue
        var unsubscribeQueue = function (subscriptionIdQueue) {
            var subId;
            while (subId = subscriptionIdQueue.dequeue()) {
                unsubscribeById(subId);
            }
        };

        //Unsubscribes the specified subscription id
        var unsubscribeById = function (subscriptionId) {
            for (var loopChannelKey in channels) {
                if (channels.hasOwnProperty(loopChannelKey)) {
                    var channel = channels[loopChannelKey];

                    var immutableChannel = channel.slice(0); //subscribers may alter the channel collection
                    var foundIndex = -1;
                    for (var i = 0, count = immutableChannel.length; i < count; i++) {
                        var subscription = immutableChannel[i];
                        if (subscription.id === subscriptionId) {
                            foundIndex = i;
                            break;
                        }
                    }

                    if (foundIndex >= 0) {
                        channel.splice(foundIndex, 1);
                        break;
                    }
                }
            }
        };

        //Unsubscribes the specified subscriber by id or by (subscriber / filter) combination
        var unsubscribe = function () {           
            var param = arguments[0];

            if (param.dequeue) {
                unsubscribeQueue(param);
            }
            else {
                unsubscribeById(param);
            }
        };
        
        //Creates a new message to publish or a message that can be used as a filter for subscriptions
        var createMessage = function (channelName) {
            return new MessageFactory(channelName);
        };

        return {
            publish: publish,
            subscribe: subscribe,            
            subscribePreProcessHandler: subscribePreProcessHandler,
            subscribePostProcessHandler: subscribePostProcessHandler,
            unsubscribe: unsubscribe,
            createMessage: createMessage
        };
    };

    //Extend the specified namespace
    namespace[key] = {
        create: createPubSub //Creates a new pubsub provider
    };
})(jsSOA.factory);