export interface Ticket {
  id: number;
  parentId?: number;
  subject: string;
  text: string;
  message: string;
  ticketMessage?: string;
  message_date: number;
  message_date_conv?: number;
  closing_date?: number;
  close_date_conv?: number;
  resolved: number;
  in_archive?: number;
  new_message?: number;
  user_id: number;
  last_message_user_name?: string;
  closed_by?: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  user_first_name?: string;
  user_second_name?: string;
  author?: string;
  text: string;
  date: number;
  is_read?: number;
  files?: TicketFile[];
  images?: TicketFile[];
  docs?: TicketFile[];
}

export interface TicketFile {
  file_id: number;
  file_link: string;
  link?: string;
}

export interface CreateTicketRequest {
  subject: string;
  text: string;
  department: number;
  files?: string; // JSON string of file IDs array
}

export interface SendMessageRequest {
  ticket_id: number;
  text: string;
  files?: string; // JSON string of file IDs array
}

export interface ApiResponse<T> {
  result: 'success' | 'failed';
  error_number?: number;
  errors?: any;
  values: T;
}

