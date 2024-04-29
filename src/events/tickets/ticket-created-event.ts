import { Subject } from "../subjects";

export interface TicketCreatedEvent extends Event {
	subject: Subject.TicketCreated;
	data: {
		id: string;
		title: string;
		price: number;
		userId: string;
	};
}
