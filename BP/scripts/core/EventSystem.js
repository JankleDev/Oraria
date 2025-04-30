class HandlerListManager {
	static handlerLists = new Map();

	static getListFor(eventName) {
		if (!this.handlerLists.has(eventName)) {
			this.handlerLists.set(eventName, []);
		}
		return this.handlerLists.get(eventName);
	}
}

export class Event {
	#eventName = "undefined";
	#callDepth = 0;
	#cancelled = false;
	maxCallDepth = 30;

	constructor(eventName = "") {
		if (eventName) {
			this.#eventName = eventName;
		}
	}

	get eventName() {
		return this.#eventName || this.constructor.name;
	}

	get cancelled() {
		return this.#cancelled;
	}

	setCancelled(cancel = true) {
		this.#cancelled = cancel;
	}

	isCancellable() {
		return true; // Override in child classes for non-cancellable events
	}

	call() {
		if (this.#callDepth >= this.maxCallDepth) {
			console.error(`Event call depth exceeded for ${this.eventName}`);
			return;
		}

		this.#callDepth++;
		const handlers = HandlerListManager.getListFor(this.eventName);

		try {
			for (const registration of handlers) {
				if (this.#cancelled && registration.ignoreCancelled) {
					continue;
				}

				registration.callEvent(this);

				// Stop propagation if event was cancelled
				if (this.#cancelled && this.isCancellable()) {
					break;
				}
			}
		} catch (error) {
			console.error(`Error in event ${this.eventName}:`, error);
		} finally {
			this.#callDepth--;
		}
	}
}

export class Listener {
	static register(eventName, callback, options = {}) {
		const handlers = HandlerListManager.getListFor(eventName);
		const registration = {
			callEvent: callback,
			priority: options.priority || 0,
			ignoreCancelled: options.ignoreCancelled || false
		};

		handlers.push(registration);
		// Sort by priority (higher numbers execute first)
		handlers.sort((a, b) => b.priority - a.priority);
	}

	static unregister(eventName, callback) {
		const handlers = HandlerListManager.getListFor(eventName);
		const index = handlers.findIndex((h) => h.callEvent === callback);
		if (index !== -1) {
			handlers.splice(index, 1);
		}
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
