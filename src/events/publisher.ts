import { JetStreamClient, JetStreamManager, NatsConnection } from "nats";
import { Subject } from "./subjects";

interface Event {
	subject: Subject;
	data: any;
}

export abstract class Publisher<T extends Event> {
	private streamName = "EVENTS";
	abstract subject: T["subject"];
	private client: NatsConnection;

	private jsm: JetStreamManager;
	private js: JetStreamClient;

	constructor(client: NatsConnection) {
		this.client = client;
	}

	/**
	 * Registers the stream for the publisher if it does not exist
	 *
	 * @returns void
	 */
	async registerStream() {
		if (!this.jsm || !this.js) {
			this.jsm = await this.client.jetstreamManager();
			// await jsm.streams.delete(streamName); // delete previous stream
			await this.jsm.streams.add({
				name: this.streamName,
				subjects: [this.subject],
			});
			this.js = this.client.jetstream();
		}
	}

	/**
	 * Publishes the data to the subject
	 *
	 * @param data
	 * @returns void
	 */
	async publish(data: T["data"]) {
		await this.registerStream();

		const pa = await this.js.publish(this.subject, JSON.stringify(data));
		console.log(
			`PUBLISHED: [${this.streamName}.${this.subject}#${
				pa.seq
			}] ${JSON.stringify(data)}`
		);
	}
}
