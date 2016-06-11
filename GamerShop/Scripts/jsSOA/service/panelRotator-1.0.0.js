var jsSOA = jsSOA || {};
jsSOA.service = jsSOA.service || {};

//Service that passes the logging url to the jsSOA framework to handle log requests
(function (namespace) {
    var _key = 'panelRotator';
    var _locked = false;
    var _msgQueue;

    var _panelIds = [];
    var _activePanelIndex;
    var _timerId;
    var _paused = false;
    var _rotateSpeed = 5900;

    var _pubsub;
    var _subIds;

    //Handles the system initialized message and starts the rotation process (after a delay so everything else can initialize)
    var handleSystemInitialized = function (msg) {        
        setTimeout(initializePanelRotator, 50);
    };

    //Initializes the rotation process
    var initializePanelRotator = function () {
        var panels = $('.rotatorPanel');

        for (var idx = 0, count = panels.length; idx < count; idx++) {
            var panel = panels[idx];
            var panelId = panel.id;

            _panelIds.push(panelId);
        }
        _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('initialized').withData('count', _panelIds.length));
        _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('resumed'));

        setActivePanel(0);
    };

    //Handles the timer ticked event, signaling that the next rotation needs to occur
    var handleTimerTicked = function () {
        clearTimer();
        advanceRotation();
    };

    //If a rotation has been queued, this handles the queue timer tick event and dequeues and
    //executes the rotation request.
    var handleQueueTimerTicked = function () {
        if (!_locked) {
            var msg = _msgQueue.dequeue();
            if (msg) {
                handleRotateRequest(msg);
            }            
        }

        if (_msgQueue.getCount() > 0) {
            setTimeout(handleQueueTimerTicked, 100);
        }
    };

    //Handles any requests to rotate the panels
    var handleRotateRequest = function (msg) {
        if (_locked && (msg.command !== 'hidden' && msg.command !== 'displayed')) {
            _msgQueue.enqueue(msg);
            setTimeout(handleQueueTimerTicked, 100);
            return;
        }

        switch (msg.command) {
            case 'pause':
                pauseRotation();
                break;
            case 'toggle':
                if (_paused) {
                    resumeRotation();
                    advanceRotation();
                }
                else {
                    pauseRotation();
                }
                break;
            case 'resume':
                resumeRotation();
                startTimer();
                break;
            case 'setSpeed':
                _rotateSpeed = msg.data.speed || _rotateSpeed;
            case 'display':
                clearTimer();

                var foundIdx;
                if (msg.data.panelIndex !== undefined && msg.data.panelIndex !== null) {
                    foundIdx = Number(msg.data.panelIndex);
                }
                else {
                    foundIdx = findPanelIndexById(msg.data.panelId);
                }
            
                if (foundIdx >= 0) {                   
                    setActivePanel(foundIdx);
                }
                else {
                    _pubsub.publish(_pubsub.createMessage('notification').withCommand('show').withData('title', 'Invalid Panel Selected').withData('text', 'The specified panel has not been initialized with the panelRotator service.'));
                }
                break;
        }
    };

    //Finds the index of the specified panel id
    var findPanelIndexById = function (panelId) {
        var foundIdx = -1;

        if (panelId) {
            for (var idx = 0, count = _panelIds.length; idx < count; idx++) {
                if (panelId === _panelIds[idx]) {
                    foundIdx = idx;
                    break;
                }
            }
        }

        return foundIdx;
    };

    //Sets the active panel to the specified index
    var setActivePanel = function (idx) {        
        if (idx >= _panelIds.length) idx = _panelIds.length - 1;
        if (idx < 0) idx = 0;
        if (_locked) return;
        
        var prevPanelIndex = _activePanelIndex;
        
        _locked = true;

        if (prevPanelIndex !== undefined) {
            var prevActivePanel = $('#' + _panelIds[prevPanelIndex]);
            prevActivePanel.fadeOut(300, function () {
                var prevPanelId = prevActivePanel.attr('id');
                _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('hidden').withData('panelIndex', prevPanelIndex).withData('panelId', prevPanelId));
                fadeInPanel(idx);
            });
        }
        else {
            fadeInPanel(idx);
        }
    };
    
    //Fades in the panel with the specified index
    var fadeInPanel = function (idx) {
        $('.rotatorPanel').css('display', 'none');
        var panelId = _panelIds[idx];
        var newPanel = $('#' + panelId);        
        newPanel.fadeIn(450);

        _activePanelIndex = idx;
        _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('displayed').withData('panelIndex', idx).withData('panelId', panelId));
        
        clearTimer();

        if (idx < _panelIds.length - 1) {
            startTimer();
        }
        else {
            pauseRotation();
        }
        _locked = false;
    };

    //Clears the current timer (if any)
    var clearTimer = function () {
        if (_timerId) {
            clearTimeout(_timerId);
            _timerId = undefined;
        }
    };

    //Starts a new timer if the rotator is not currently paused
    var startTimer = function () {
        if (!_paused) {
            _timerId = setTimeout(handleTimerTicked, _rotateSpeed);
        }
    };
  
    //Pauses the rotator
    var pauseRotation = function () {
        clearTimer();
        _paused = true;
        _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('paused'));
    };

    //Resumes the rotator
    var resumeRotation = function () {        
        _paused = false;
        _pubsub.publish(_pubsub.createMessage('panelRotator').withCommand('resumed'));                         
    };

    //Advances the rotation to the next panel
    var advanceRotation = function () {
        var nextIdx = (_activePanelIndex === _panelIds.length - 1) ? 0 : nextIdx = _activePanelIndex + 1;
        setActivePanel(nextIdx);
    };

    //Initialization method that registers appropriate pubsub subscriptions
    var initialize = function (pubsub) {
        _pubsub = pubsub;

        _msgQueue = jsSOA.factory.queue.create();

        _subIds = jsSOA.factory.queue.create();
        _subIds.enqueue(_pubsub.subscribe(handleSystemInitialized, _pubsub.createMessage('system').withType('engine').withCommand('initialized')));
        _subIds.enqueue(_pubsub.subscribe(handleRotateRequest, _pubsub.createMessage('panelRotator')));
    };

    //Disposes of this service by removing pubsub handlers
    var dispose = function () {
        _pubsub.unsubscribe(_subIds);
    };

    //Extend the specified namespace with this service
    namespace[_key] = {
        key: _key,
        initialize: initialize,
        dispose: dispose
    };
})(jsSOA.service);