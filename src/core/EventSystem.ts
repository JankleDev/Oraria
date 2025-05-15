interface HandlerRegistration {
	callEvent: (event: Event) => void;
	priority: number;
	ignoreCancelled: boolean;
}

class HandlerListManager {
	private static handlerLists: Map<string, HandlerRegistration[]> = new Map();

	static getListFor(eventName: string): HandlerRegistration[] {
		if (!this.handlerLists.has(eventName)) {
			this.handlerLists.set(eventName, []);
		}
		return this.handlerLists.get(eventName)!;
	}

	static clearHandlers(eventName: string): void {
		this.handlerLists.set(eventName, []);
	}

	static hasHandlers(eventName: string): boolean {
		const list = this.handlerLists.get(eventName);
		return list !== undefined && list.length > 0;
	}
}

export class Event {
	#eventName: string = "undefined";
	#callDepth: number = 0;
	#cancelled: boolean = false;
	maxCallDepth: number = 30;

	constructor(eventName: string = "") {
		if (eventName) {
			this.#eventName = eventName;
		}
	}

	get eventName(): string {
		return this.#eventName || this.constructor.name;
	}

	get cancelled(): boolean {
		return this.#cancelled;
	}

	setCancelled(cancel: boolean = true): void {
		if (this.isCancellable()) {
			this.#cancelled = cancel;
		}
	}

	isCancellable(): boolean {
		return true;
	}

	call(): void {
		if (this.#callDepth >= this.maxCallDepth) {
			console.error(`Event call depth exceeded for ${this.eventName}`);
			return;
		}

		this.#callDepth++;
		const handlers = HandlerListManager.getListFor(this.eventName).slice(); // Clone the handlers array

		try {
			for (const { callEvent, ignoreCancelled } of handlers) {
				if (this.#cancelled && ignoreCancelled) continue;
				callEvent(this);
				if (this.#cancelled && this.isCancellable()) break;
			}
		} catch (error) {
			console.error(`Error in event ${this.eventName}:`, error);
		} finally {
			this.#callDepth--;
		}
	}
}

export class Listener {
	/**
	 * Registers a callback for the specified event.
	 * @param eventName The name of the event.
	 * @param callback The callback function to handle the event.
	 * @param options Optional registration options.
	 */
	static register(
		eventName: Event | string,
		callback: (event: Event) => void,
		options: { priority?: number; ignoreCancelled?: boolean } = {}
	): void {
		if (eventName instanceof Event) eventName = eventName.eventName;
		const handlers = HandlerListManager.getListFor(eventName);
		const registration: HandlerRegistration = {
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
	static unregister(eventName: Event | string, callback: (event: Event) => void): void {
		if (eventName instanceof Event) eventName = eventName.eventName;
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
	static clear(eventName: Event | string): void {
		if (eventName instanceof Event) eventName = eventName.eventName;
		HandlerListManager.clearHandlers(eventName);
	}
}

export class CancellableEvent extends Event {
	isCancellable(): boolean {
		return true;
	}
}

export class NonCancellableEvent extends Event {
	isCancellable(): boolean {
		return false;
	}
}
