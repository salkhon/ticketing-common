import { Subject } from "../subjects";

export interface TicketUpdatedEvent extends Event {
	subject: Subject.TicketUpdated;
	data: {
		id: string;
		title: string;
		price: number;
    userId: string;
	};
}
