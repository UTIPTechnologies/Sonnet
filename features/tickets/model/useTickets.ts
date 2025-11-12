import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth';
import { getAllTickets, getTicket, createTicket, sendMessageToTicket } from '../../../entities/ticket/api/ticketApi';
import { Ticket, TicketMessage, CreateTicketRequest, SendMessageRequest } from '../../../entities/ticket/model/ticket';

export function useTickets() {
  const { acsToken, acsUserId } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Получить user_id из контекста аутентификации
  const getUserId = useCallback(() => {
    if (acsUserId) {
      return acsUserId;
    }
    // Fallback на заглушку, если user_id не получен
    console.warn('acsUserId not available, using fallback');
    return '1';
  }, [acsUserId]);

  const fetchTickets = useCallback(async (resolved: number = 0) => {
    if (!acsToken) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      const ticketsList = await getAllTickets(acsToken, userId, resolved);
      
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
  }, [acsToken, getUserId]);

  const fetchOpenTickets = useCallback(() => {
    return fetchTickets(0);
  }, [fetchTickets]);

  const fetchArchivedTickets = useCallback(() => {
    return fetchTickets(1);
  }, [fetchTickets]);

  const createNewTicket = useCallback(async (data: CreateTicketRequest) => {
    if (!acsToken) {
      throw new Error('Not authenticated');
    }

    try {
      const userId = getUserId();
      const result = await createTicket(acsToken, userId, data);
      // Обновляем список после создания
      await fetchOpenTickets();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      throw new Error(errorMessage);
    }
  }, [acsToken, getUserId, fetchOpenTickets]);

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
  const { acsToken, acsUserId } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getUserId = useCallback(() => {
    if (acsUserId) {
      return acsUserId;
    }
    // Fallback на заглушку, если user_id не получен
    console.warn('acsUserId not available, using fallback');
    return '1';
  }, [acsUserId]);

  const fetchTicket = useCallback(async () => {
    if (!acsToken || !ticketId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      const result = await getTicket(acsToken, userId, ticketId);
      setTicket(result.ticket);
      setMessages(result.messages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ticket';
      setError(errorMessage);
      console.error('Error fetching ticket:', err);
    } finally {
      setIsLoading(false);
    }
  }, [acsToken, ticketId, getUserId]);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    if (!acsToken) {
      throw new Error('Not authenticated');
    }

    try {
      const userId = getUserId();
      await sendMessageToTicket(acsToken, userId, data);
      // Обновляем сообщения после отправки
      await fetchTicket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      throw new Error(errorMessage);
    }
  }, [acsToken, getUserId, fetchTicket]);

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

