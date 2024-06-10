import { AckPolicy, JsMsg, NatsConnection } from "nats";
import { Subject } from "./subjects";

interface Event {
	subject: Subject;
	data: any;
}

export abstract class Listener<T extends Event> {
	private nc: NatsConnection;
	protected streamName = "EVENTS";
	abstract subject: T["subject"];
	abstract durableName: string;
	protected ackWait = 5 * 1000; // 5 seconds
	protected ackPolicy = AckPolicy.Explicit;

	constructor(nc: NatsConnection) {
		this.nc = nc;
	}

	abstract onMessage(data: T["data"], message: JsMsg): void;

	/**
	 * Listen for messages on the subject indefinitely
	 *
	 * @returns void
	 */
	async listen() {
		const jsm = await this.nc.jetstreamManager();
		const js = this.nc.jetstream();

		await jsm.consumers.add(this.streamName, {
			durable_name: this.durableName, // consumer name (name NATS uses to identify the consumer) (queue group)
			filter_subject: this.subject,
			ack_policy: this.ackPolicy,
		});
		const c = await js.consumers.get(this.streamName, this.durableName);

		while (true) {
			console.log(
				`CONSUMER ${this.streamName}.${this.durableName} is waiting for messages...`
			);
			const messages = await c.consume();
			try {
				for await (const m of messages) {
					console.log(
						`CONSUMER ${this.streamName}.${this.durableName} received a message: ${m.sid}`
					);

					this.onMessage(JSON.parse(m.data.toString()), m);
					m.ack();

					console.log(
						`CONSUMER ${this.streamName}.${this.durableName} acknowledged the message: ${m.sid}`
					);
				}
			} catch (err) {
				console.error(
					`CONSUMER ${this.streamName}.${this.durableName} error: ${err}`
				);
			}
		}
	}

	/**
	 * Parse the jetstream message data
	 */
	parseMessage(msg: JsMsg): string {
		const data = msg.data;
		return JSON.parse(typeof data === "string" ? data : data.toString());
	}
}
