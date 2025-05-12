var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Event_eventName, _Event_callDepth, _Event_cancelled;
class HandlerListManager {
    static getListFor(eventName) {
        if (!this.handlerLists.has(eventName)) {
            this.handlerLists.set(eventName, []);
        }
        return this.handlerLists.get(eventName);
    }
    static clearHandlers(eventName) {
        this.handlerLists.set(eventName, []);
    }
    static hasHandlers(eventName) {
        const list = this.handlerLists.get(eventName);
        return list !== undefined && list.length > 0;
    }
}
HandlerListManager.handlerLists = new Map();
export class Event {
    constructor(eventName = "") {
        _Event_eventName.set(this, "undefined");
        _Event_callDepth.set(this, 0);
        _Event_cancelled.set(this, false);
        this.maxCallDepth = 30;
        if (eventName) {
            __classPrivateFieldSet(this, _Event_eventName, eventName, "f");
        }
    }
    get eventName() {
        return __classPrivateFieldGet(this, _Event_eventName, "f") || this.constructor.name;
    }
    get cancelled() {
        return __classPrivateFieldGet(this, _Event_cancelled, "f");
    }
    setCancelled(cancel = true) {
        if (this.isCancellable()) {
            __classPrivateFieldSet(this, _Event_cancelled, cancel, "f");
        }
    }
    isCancellable() {
        return true;
    }
    call() {
        var _a, _b;
        if (__classPrivateFieldGet(this, _Event_callDepth, "f") >= this.maxCallDepth) {
            console.error(`Event call depth exceeded for ${this.eventName}`);
            return;
        }
        __classPrivateFieldSet(this, _Event_callDepth, (_a = __classPrivateFieldGet(this, _Event_callDepth, "f"), _a++, _a), "f");
        const handlers = HandlerListManager.getListFor(this.eventName).slice(); // Clone the handlers array
        try {
            for (const { callEvent, ignoreCancelled } of handlers) {
                if (__classPrivateFieldGet(this, _Event_cancelled, "f") && ignoreCancelled)
                    continue;
                callEvent(this);
                if (__classPrivateFieldGet(this, _Event_cancelled, "f") && this.isCancellable())
                    break;
            }
        }
        catch (error) {
            console.error(`Error in event ${this.eventName}:`, error);
        }
        finally {
            __classPrivateFieldSet(this, _Event_callDepth, (_b = __classPrivateFieldGet(this, _Event_callDepth, "f"), _b--, _b), "f");
        }
    }
}
_Event_eventName = new WeakMap(), _Event_callDepth = new WeakMap(), _Event_cancelled = new WeakMap();
export class Listener {
    /**
     * Registers a callback for the specified event.
     * @param eventName The name of the event.
     * @param callback The callback function to handle the event.
     * @param options Optional registration options.
     */
    static register(eventName, callback, options = {}) {
        const handlers = HandlerListManager.getListFor(eventName);
        const registration = {
            callEvent: callback,
            priority: options.priority ?? 0,
            ignoreCancelled: options.ignoreCancelled ?? false
        };
        handlers.push(registration);
        handlers.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Unregisters a previously registered event callback.
     * @param eventName The event name.
     * @param callback The callback function to remove.
     */
    static unregister(eventName, callback) {
        const handlers = HandlerListManager.getListFor(eventName);
        const index = handlers.findIndex((h) => h.callEvent === callback);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }
    /**
     * Clears all event registrations for the specified event.
     * @param eventName The event name.
     */
    static clear(eventName) {
        HandlerListManager.clearHandlers(eventName);
    }
}
export class CancellableEvent extends Event {
    isCancellable() {
        return true;
    }
}
export class NonCancellableEvent extends Event {
    isCancellable() {
        return false;
    }
}
