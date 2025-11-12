import React, { useState, useMemo } from 'react';
import { useAuth } from '../features/auth';
import { Spinner } from '../shared/ui/spinner';
import { useSubscription } from '../features/subscription';
import { useQuotes } from '../features/quotes';
import '../shared/styles/index.css';

interface SymbolsPageProps {
  navigateTo: (page: 'symbols' | 'settings' | 'tickets') => void;
}

const SymbolsPage: React.FC<SymbolsPageProps> = ({ navigateTo }) => {
  const { logout } = useAuth();
  const { allSymbols, subscribedSymbols, isLoading: isSymbolsLoading, error: symbolsError } = useSubscription();
  const quotes = useQuotes(subscribedSymbols);
  const [filter, setFilter] = useState('');

  const subscribedSymbolDetails = useMemo(() => {
    const subscribedSet = new Set(subscribedSymbols);
    return allSymbols.filter(s => subscribedSet.has(s.Symbol));
  }, [allSymbols, subscribedSymbols]);

  const filteredSymbols = useMemo(() => {
    if (!filter) return subscribedSymbolDetails;
    return subscribedSymbolDetails.filter(symbol =>
      symbol.Symbol.toLowerCase().includes(filter.toLowerCase()) ||
      (symbol.Description && symbol.Description.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [subscribedSymbolDetails, filter]);

  const calculateChange = (symbol: string) => {
    const quote = quotes[symbol];
    if (!quote) return null;
    
    // Простая логика: если bid > ask, то положительное изменение
    // В реальном приложении нужно хранить предыдущие значения
    const bid = parseFloat(quote.bid);
    const ask = parseFloat(quote.ask);
    const mid = (bid + ask) / 2;
    
    // Для демонстрации используем случайное небольшое изменение
    // В реальном приложении нужно сравнивать с предыдущим значением
    const change = (Math.random() - 0.5) * 0.3; // от -0.15% до +0.15%
    return {
      value: change,
      percent: change.toFixed(2),
      isPositive: change >= 0
    };
  };

  const getPriceDirection = (symbol: string) => {
    // В реальном приложении нужно сравнивать с предыдущим значением
    // Для демонстрации используем случайное направление
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  return (
    <div className="menuBackground">
      <div className="mountains" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header with hamburger, title, balance and settings */}
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
            <div style={{ 
              width: '24px', 
              height: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer'
            }}>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#FFFFFF' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#FFFFFF' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#FFFFFF' }}></div>
            </div>
            <h1 style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              color: '#FFFFFF',
              margin: 0
            }}>Quotes</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigateTo('tickets')}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Обращения
            </button>
            <button
              onClick={() => navigateTo('settings')}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
              </svg>
              Settings
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
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(235, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(235, 68, 68, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(235, 68, 68, 0.5)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          backgroundColor: 'transparent',
          padding: '12px 15px',
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr',
          gap: '10px',
          borderBottom: '1px solid rgba(167, 174, 232, 0.3)',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: 500
        }}>
          <div>Symbol</div>
          <div style={{ textAlign: 'right' }}>Bid/Ask</div>
          <div style={{ textAlign: 'right' }}>Today</div>
        </div>

        {/* Symbols list */}
        {isSymbolsLoading && subscribedSymbols.length === 0 ? (
          <div className="scrollableDiv">
            <div className="loadingContainer">
              <Spinner size="lg" />
            </div>
          </div>
        ) : (
          <div className="scrollableDiv" style={{ backgroundColor: 'transparent' }}>
            <div className="formBackground">
              {symbolsError && (
                <div 
                  className={symbolsError.includes('timeout') ? 'infoMessage' : 'warningMessage'} 
                  style={{ margin: '15px' }}
                >
                  <p style={{ margin: 0 }}>{symbolsError}</p>
                </div>
              )}

              {!isSymbolsLoading && filteredSymbols.length === 0 && (
                <div className="emptyState" style={{ 
                  margin: '15px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  padding: '40px 20px'
                }}>
                  <p style={{ color: '#FFFFFF', marginBottom: '15px' }}>
                    {subscribedSymbols.length > 0 ? "No symbols match your filter." : "You have no subscribed symbols."}
                  </p>
                  <button 
                    onClick={() => navigateTo('settings')} 
                    className="button loginButton"
                    style={{ minWidth: '200px', marginTop: '15px' }}
                  >
                    Go to Settings to subscribe
                  </button>
                </div>
              )}

              {filteredSymbols.length > 0 && (
                <div style={{ padding: 0 }}>
                  {filteredSymbols.map((symbol) => {
                    const quote = quotes[symbol.Symbol];
                    const change = calculateChange(symbol.Symbol);
                    const direction = quote ? getPriceDirection(symbol.Symbol) : null;
                    
                    return (
                      <div
                        key={symbol.Symbol}
                        style={{
                          padding: '15px',
                          borderBottom: '1px solid rgba(167, 174, 232, 0.2)',
                          display: 'grid',
                          gridTemplateColumns: '2fr 1.5fr 1fr',
                          gap: '10px',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Symbol and description */}
                        <div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            color: '#FFFFFF',
                            marginBottom: '4px'
                          }}>
                            {symbol.Symbol}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: 'rgba(167, 174, 232, 0.8)',
                            lineHeight: '1.3'
                          }}>
                            {symbol.Description || `${symbol.Symbol} description`}
                          </div>
                        </div>

                        {/* Bid/Ask prices */}
                        <div style={{ textAlign: 'right' }}>
                          {quote ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#FFFFFF'
                              }}>
                                {direction === 'up' && (
                                  <span style={{ color: '#5DBA40', fontSize: '12px' }}>▲</span>
                                )}
                                {direction === 'down' && (
                                  <span style={{ color: '#EB4444', fontSize: '12px' }}>▼</span>
                                )}
                                {quote.bid}
                              </div>
                              <div style={{ 
                                fontSize: '14px',
                                color: 'rgba(167, 174, 232, 0.8)'
                              }}>
                                {quote.ask}
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: 'rgba(167, 174, 232, 0.6)', fontSize: '14px' }}>-</div>
                          )}
                        </div>

                        {/* Today's change */}
                        <div style={{ textAlign: 'right' }}>
                          {change ? (
                            <div style={{ 
                              fontSize: '14px',
                              fontWeight: 500,
                              color: change.isPositive ? '#5DBA40' : '#EB4444'
                            }}>
                              {change.isPositive ? '+' : ''}{change.percent}%
                            </div>
                          ) : (
                            <div style={{ color: 'rgba(167, 174, 232, 0.6)', fontSize: '14px' }}>-</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with edit and add icons */}
        <div style={{
          backgroundColor: 'transparent',
          padding: '12px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(167, 174, 232, 0.3)'
        }}>
          <div 
            onClick={() => navigateTo('settings')}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div 
            onClick={() => navigateTo('settings')}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolsPage;
