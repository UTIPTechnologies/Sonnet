import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth';
import { getAllTickets, getTicket, createTicket, sendMessageToTicket } from '../../../entities/ticket/api/ticketApi';
import { Ticket, TicketMessage, CreateTicketRequest, SendMessageRequest } from '../../../entities/ticket/model/ticket';

export function useTickets() {
  const { woToken, userEmail } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Получить email из контекста аутентификации
  const getUserEmail = useCallback(() => {
    if (userEmail) {
      return userEmail;
    }
    // Fallback на заглушку, если email не получен
    console.warn('userEmail not available, using fallback');
    return 'test@test.ru';
  }, [userEmail]);

  const fetchTickets = useCallback(async (resolved: number = 0) => {
    if (!woToken) {
      setError('Not authenticated (woToken not available)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = getUserEmail();
      const ticketsList = await getAllTickets(woToken, email, resolved);
      
      if (resolved === 0) {
        setTickets(ticketsList);
      } else {
        setArchivedTickets(ticketsList);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [woToken, getUserEmail]);

  const fetchOpenTickets = useCallback(() => {
    return fetchTickets(0);
  }, [fetchTickets]);

  const fetchArchivedTickets = useCallback(() => {
    return fetchTickets(1);
  }, [fetchTickets]);

  const createNewTicket = useCallback(async (data: CreateTicketRequest) => {
    if (!woToken) {
      throw new Error('Not authenticated (woToken not available)');
    }

    try {
      const email = getUserEmail();
      const result = await createTicket(woToken, email, data);
      // Обновляем список после создания
      await fetchOpenTickets();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      throw new Error(errorMessage);
    }
  }, [woToken, getUserEmail, fetchOpenTickets]);

  return {
    tickets,
    archivedTickets,
    isLoading,
    error,
    fetchOpenTickets,
    fetchArchivedTickets,
    createNewTicket,
    refresh: fetchOpenTickets,
  };
}

export function useTicket(ticketId: number | null) {
  const { woToken, userEmail } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getUserEmail = useCallback(() => {
    if (userEmail) {
      return userEmail;
    }
    // Fallback на заглушку, если email не получен
    console.warn('userEmail not available, using fallback');
    return 'test@test.ru';
  }, [userEmail]);

  const fetchTicket = useCallback(async () => {
    if (!woToken || !ticketId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = getUserEmail();
      const result = await getTicket(woToken, email, ticketId);
      setTicket(result.ticket);
      setMessages(result.messages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket';
      setError(errorMessage);
      console.error('Error fetching ticket:', err);
    } finally {
      setIsLoading(false);
    }
  }, [woToken, ticketId, getUserEmail]);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    if (!woToken) {
      throw new Error('Not authenticated (woToken not available)');
    }

    try {
      const email = getUserEmail();
      await sendMessageToTicket(woToken, email, data);
      // Обновляем сообщения после отправки
      await fetchTicket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [woToken, getUserEmail, fetchTicket]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, fetchTicket]);

  return {
    ticket,
    messages,
    isLoading,
    error,
    refresh: fetchTicket,
    sendMessage,
  };
}

