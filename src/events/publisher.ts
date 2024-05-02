import { JetStreamClient, JetStreamManager, NatsConnection } from "nats";
import { Subject } from "./subjects";

interface Event {
	subject: Subject;
	data: any;
}

export abstract class Publisher<T extends Event> {
	private streamName = "EVENTS";
	abstract subject: T["subject"];
	private nc: NatsConnection;

  /**
   * Creates an instance of the Publisher
   *
   * @param nc - NATS connection with JetStreamManager pre-configured
   */
	constructor(nc: NatsConnection) {
		this.nc = nc;
	}

	/**
	 * Publishes the data to the subject
	 *
	 * @param data
	 * @returns void
	 */
	async publish(data: T["data"]) {
    const js = this.nc.jetstream();
		const pa = await js.publish(this.subject, JSON.stringify(data));
		console.log(
			`PUBLISHED: [${this.streamName}.${this.subject}#${
				pa.seq
			}] ${JSON.stringify(data)}`
		);
	}
}
