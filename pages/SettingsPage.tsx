import React, { useMemo } from 'react';
import { useTheme } from '../features/theme';
import { useAuth } from '../features/auth';
import { useSubscription } from '../features/subscription';
import { Spinner } from '../shared/ui/spinner';
import '../shared/styles/index.css';

interface SettingsPageProps {
  navigateTo: (page: 'symbols' | 'settings') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigateTo }) => {
  const { theme, toggleTheme } = useTheme();
  const { utipToken, acsToken } = useAuth();
  const token = utipToken || acsToken || null;
  const { allSymbols, toggleSubscription, isSubscribed, isLoading, error } = useSubscription(token);

  // Мемоизированная сортировка для оптимизации производительности
  const sortedSymbols = useMemo(() => {
    try {
      return [...allSymbols].sort((a, b) => {
        const aSubscribed = isSubscribed(a.Symbol);
        const bSubscribed = isSubscribed(b.Symbol);
        if (aSubscribed && !bSubscribed) return -1;
        if (!aSubscribed && bSubscribed) return 1;
        return (a.Symbol || '').localeCompare(b.Symbol || '');
      });
    } catch (error) {
      console.error('Error sorting symbols:', error);
      return allSymbols;
    }
  }, [allSymbols, isSubscribed]);

  return (
    <div className="menuBackground">
      <div className="scrollableDiv" style={{ height: '100vh' }}>
        <div className="innerScrollableDiv">
          <div className="title" style={{ 
            fontSize: '16px',
            padding: '14px 0',
            borderBottom: '1px solid rgba(167, 174, 232, 0.3)',
            textAlign: 'center',
            color: '#FFFFFF',
            fontWeight: 500
          }}>Settings</div>
          
          <div className="globalRowSetting" style={{ 
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            margin: '15px',
            overflow: 'hidden'
          }}>
            <div className="rowSetting nofocus" onClick={() => navigateTo('symbols')} style={{ 
              cursor: 'pointer',
              color: '#FFFFFF',
              backgroundColor: 'transparent'
            }}>
              <span style={{ color: '#FFFFFF' }}>&larr; Back to Symbols</span>
              <div className="inDeep"></div>
            </div>
            
            <div className="rowSetting nofocus" style={{ 
              color: '#FFFFFF',
              backgroundColor: 'transparent'
            }}>
              <span style={{ color: '#FFFFFF' }}>Appearance</span>
              <button
                onClick={toggleTheme}
                className="subscribeButton"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                style={{ 
                  minWidth: 'auto', 
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>

          <div className="settingsContainer" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            margin: '0 15px',
            overflow: 'hidden'
          }}>
            <div className="settingsSection">
              <h2 style={{ 
                fontSize: '16px',
                fontWeight: 500,
                margin: 0,
                padding: '20px 20px 10px',
                color: '#FFFFFF'
              }}>Symbol Subscriptions</h2>
              {isLoading && (
                <div className="loadingContainer" style={{ padding: '20px', height: '100px' }}>
                  <Spinner />
                </div>
              )}
              {error && (
                <div className="errorMessage" style={{ margin: '20px' }}>
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              )}
              {!isLoading && !error && sortedSymbols.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#FFFFFF' }}>
                  No symbols available
                </div>
              )}
              {!isLoading && !error && sortedSymbols.length > 0 && (
                <div className="symbolList" aria-busy={isLoading} aria-live="polite">
                  {sortedSymbols.map(symbol => {
                    // Вычисляем статус подписки один раз для оптимизации
                    const subscribed = isSubscribed(symbol.Symbol);
                    const symbolName = symbol.Symbol || '';
                    const description = symbol.Description || 'No description';

                    return (
                      <div key={symbol.Symbol} className="symbolItem" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: '1px solid rgba(167, 174, 232, 0.2)'
                      }}>
                        <div className="symbolItemInfo">
                          <p style={{ color: '#FFFFFF', fontWeight: 500 }}>{symbolName}</p>
                          <p style={{ color: 'rgba(167, 174, 232, 0.8)' }}>{description}</p>
                        </div>
                        <button
                          onClick={() => toggleSubscription(symbol.Symbol)}
                          className={`subscribeButton ${subscribed ? 'subscribed' : ''}`}
                          aria-label={subscribed ? `Unsubscribe from ${symbolName}` : `Subscribe to ${symbolName}`}
                          style={{
                            backgroundColor: subscribed 
                              ? '#5DBA40' 
                              : 'rgba(255, 255, 255, 0.2)',
                            color: '#FFFFFF',
                            border: subscribed 
                              ? 'none' 
                              : '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {subscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flexDiv"></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
