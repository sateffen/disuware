const debug = require('debug')('disuware:modules:environment');
const EventEmitter = require('events');

/**
 * Pointer to the internal eventemitter, that is used to provide the environment with all events needed
 */
const eventEmitter = new EventEmitter();

/**
 * The object representing the environment to the application itself
 */
const applicationEnvironment = {
    addListener: eventEmitter.addListener.bind(eventEmitter),
    removeListener: eventEmitter.removeListener.bind(eventEmitter),
    on: eventEmitter.on.bind(eventEmitter),
    once: eventEmitter.once.bind(eventEmitter),
    prependListener: eventEmitter.prependListener.bind(eventEmitter),
    prependOnceListener: eventEmitter.prependOnceListener.bind(eventEmitter),
};

/**
 * Emits the `applicationStartUpComplete` event for the environment
 */
function emitApplicationStartUpCompleteEvent() {
    eventEmitter.emit('applicationInitComplete');
}

eventEmitter.on('newListener', (aEvent) => debug(`Added eventlistener for event ${aEvent}`));
eventEmitter.on('removeListener', (aEvent) => debug(`Removed eventlistener for event ${aEvent}`));

module.exports = {
    applicationEnvironment,
    emitApplicationStartUpCompleteEvent,
};
