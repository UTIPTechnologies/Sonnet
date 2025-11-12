import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth';
import { useTickets } from '../features/tickets';
import { Spinner } from '../shared/ui/spinner';
import '../shared/styles/index.css';

interface TicketsPageProps {
  navigateTo: (page: 'symbols' | 'settings' | 'tickets') => void;
}

const TicketsPage: React.FC<TicketsPageProps> = ({ navigateTo }) => {
  const { logout, woToken } = useAuth();
  const { tickets, archivedTickets, isLoading, error, fetchOpenTickets, fetchArchivedTickets, createNewTicket } = useTickets();
  const [isArchiveTab, setIsArchiveTab] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(5);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Загружаем тикеты при монтировании компонента и при изменении вкладки
  useEffect(() => {
    if (woToken) {
      if (isArchiveTab) {
        fetchArchivedTickets();
      } else {
        fetchOpenTickets();
      }
    }
  }, [woToken, isArchiveTab, fetchOpenTickets, fetchArchivedTickets]);

  const currentTickets = isArchiveTab ? archivedTickets : tickets;
  const displayedTickets = limit > 0 ? currentTickets.slice(0, limit) : currentTickets;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showTicket = (ticketId: number) => {
    // В будущем можно добавить страницу просмотра обращения
    console.log('Show ticket:', ticketId);
    alert(`Просмотр обращения #${ticketId}. Функция будет реализована позже.`);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !messageText.trim()) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createNewTicket({
        subject: subject.trim(),
        text: messageText.replace(/\n/g, '<br>'),
        department: 1,
      });
      
      // Закрываем модальное окно и очищаем форму
      setShowCreateModal(false);
      setSubject('');
      setMessageText('');
      setCreateError(null);
      
      // Список обновится автоматически через fetchOpenTickets в createNewTicket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать обращение';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSubject('');
    setMessageText('');
    setCreateError(null);
  };

  return (
    <div className="menuBackground">
      <div className="mountains" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header */}
        <div className="topContent" style={{ 
          backgroundColor: 'transparent',
          height: 'auto',
          minHeight: '48px',
          padding: '12px 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(167, 174, 232, 0.3)',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigateTo('symbols')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              color: '#FFFFFF',
              margin: 0
            }}>
              {isArchiveTab ? 'Архив обращений' : 'Обращения'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsArchiveTab(!isArchiveTab)}
              style={{
                padding: '6px 12px',
                backgroundColor: isArchiveTab ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isArchiveTab ? 'Активные' : 'Архив'}
            </button>
            <button
              onClick={logout}
              aria-label="Logout"
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(235, 68, 68, 0.5)',
                borderRadius: '4px',
                color: '#EB4444',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Выход
            </button>
          </div>
        </div>

        {/* Tickets list */}
        {isLoading && currentTickets.length === 0 ? (
          <div className="scrollableDiv">
            <div className="loadingContainer">
              <Spinner size="lg" />
            </div>
          </div>
        ) : (
          <div className="scrollableDiv" style={{ backgroundColor: 'transparent' }}>
            <div className="formBackground">
              {error && (
                <div 
                  className="errorMessage" 
                  style={{ margin: '15px' }}
                >
                  <p style={{ margin: 0 }}>Ошибка: {error}</p>
                </div>
              )}

              {!isLoading && currentTickets.length === 0 && (
                <div className="emptyState" style={{ 
                  margin: '15px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#FFFFFF', marginBottom: '15px' }}>
                    {isArchiveTab ? 'У вас нет архивных обращений' : 'У вас нет открытых обращений'}
                  </p>
                </div>
              )}

              {displayedTickets.length > 0 && (
                <div style={{ padding: 0 }}>
                  {displayedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => showTicket(ticket.id)}
                      style={{
                        padding: '15px',
                        borderBottom: '1px solid rgba(167, 174, 232, 0.2)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        backgroundColor: ticket.new_message ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                        borderLeft: ticket.new_message ? '3px solid #5DBA40' : 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ticket.new_message ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: ticket.resolved ? 'rgba(167, 174, 232, 0.3)' : 'rgba(93, 186, 64, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            color: '#FFFFFF',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {ticket.text || ticket.subject || `Обращение #${ticket.id}`}
                          </div>
                          {ticket.ticketMessage && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: 'rgba(167, 174, 232, 0.8)',
                              marginBottom: '8px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                            dangerouslySetInnerHTML={{ __html: ticket.ticketMessage }}
                            />
                          )}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: 'rgba(167, 174, 232, 0.6)'
                          }}>
                            <span>{formatDate(ticket.message_date_conv)}</span>
                            {ticket.resolved && ticket.close_date_conv && (
                              <span>Закрыто: {formatDate(ticket.close_date_conv)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {limit > 0 && currentTickets.length > limit && (
                <div style={{ padding: '15px', textAlign: 'center' }}>
                  <button
                    onClick={() => setLimit(0)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '4px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Показать все ({currentTickets.length - limit} еще)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          backgroundColor: 'transparent',
          padding: '12px 15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderTop: '1px solid rgba(167, 174, 232, 0.3)'
        }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(93, 186, 64, 0.2)',
              border: '1px solid rgba(93, 186, 64, 0.5)',
              borderRadius: '4px',
              color: '#5DBA40',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Создать обращение
          </button>
        </div>
      </div>

      {/* Модальное окно создания обращения */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid rgba(167, 174, 232, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '18px', fontWeight: 600 }}>Создать обращение</h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#FFFFFF', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Тема обращения <span style={{ color: '#EB4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Введите тему обращения"
                  required
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(167, 174, 232, 0.3)',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#FFFFFF', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  Описание <span style={{ color: '#EB4444' }}>*</span>
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Введите описание проблемы"
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(167, 174, 232, 0.3)',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {createError && (
                <div style={{
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: 'rgba(235, 68, 68, 0.2)',
                  border: '1px solid rgba(235, 68, 68, 0.5)',
                  borderRadius: '4px',
                  color: '#EB4444',
                  fontSize: '14px'
                }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: isCreating ? 'not-allowed' : 'pointer',
                    opacity: isCreating ? 0.5 : 1
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !subject.trim() || !messageText.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isCreating || !subject.trim() || !messageText.trim() 
                      ? 'rgba(93, 186, 64, 0.3)' 
                      : 'rgba(93, 186, 64, 0.8)',
                    border: '1px solid rgba(93, 186, 64, 0.5)',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: isCreating || !subject.trim() || !messageText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isCreating ? (
                    <>
                      <Spinner size="sm" />
                      Создание...
                    </>
                  ) : (
                    'Создать'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;

