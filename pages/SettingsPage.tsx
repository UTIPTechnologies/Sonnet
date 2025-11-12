import React from 'react';
import { useTheme } from '../features/theme';
import { useAuth } from '../features/auth';
import { useSubscription } from '../features/subscription';
import { Spinner } from '../shared/ui/spinner';
import '../shared/styles/index.css';

interface SettingsPageProps {
  navigateTo: (page: 'symbols' | 'settings' | 'tickets') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigateTo }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { allSymbols, toggleSubscription, isSubscribed, isLoading, error } = useSubscription();

  return (
    <div className="menuBackground">
      <div className="scrollableDiv" style={{ height: '100vh' }}>
        <div className="innerScrollableDiv">
          <div className="title">Settings</div>
          
          <div className="globalRowSetting" style={{ 
            borderRadius: '4px',
            margin: '15px',
            overflow: 'hidden'
          }}>
            <div className="rowSetting nofocus" onClick={() => navigateTo('symbols')} style={{ 
              cursor: 'pointer'
            }}>
              <span>&larr; Back to Symbols</span>
              <div className="inDeep"></div>
            </div>
            
            <div className="rowSetting nofocus">
              <span>Appearance</span>
              <button
                onClick={toggleTheme}
                className="subscribeButton"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                style={{ 
                  minWidth: 'auto', 
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'var(--topContent-font-color)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
            
            <div className="rowSetting nofocus" style={{ 
              borderTop: '1px solid var(--general-menu-divider-color)'
            }}>
              <span>Account</span>
              <button
                onClick={logout}
                className="subscribeButton"
                aria-label="Logout"
                style={{ 
                  minWidth: 'auto', 
                  padding: '6px 12px',
                  backgroundColor: 'rgba(235, 68, 68, 0.2)',
                  color: '#EB4444',
                  border: '1px solid rgba(235, 68, 68, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          </div>

          <div className="settingsContainer" style={{ 
            borderRadius: '4px',
            margin: '0 15px',
            overflow: 'hidden'
          }}>
            <div className="settingsSection">
              <h2>Symbol Subscriptions</h2>
              {isLoading && (
                <div className="loadingContainer" style={{ padding: '20px', height: '100px' }}>
                  <Spinner />
                </div>
              )}
              {error && (
                <div 
                  className={error.includes('timeout') ? 'infoMessage' : 'errorMessage'} 
                  style={{ margin: '20px' }}
                >
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              )}
              {!isLoading && allSymbols.length > 0 && (
                <div className="symbolList">
                  {[...allSymbols]
                    .sort((a, b) => {
                      const aSubscribed = isSubscribed(a.Symbol);
                      const bSubscribed = isSubscribed(b.Symbol);
                      if (aSubscribed && !bSubscribed) return -1;
                      if (!aSubscribed && bSubscribed) return 1;
                      return a.Symbol.localeCompare(b.Symbol);
                    })
                    .map(symbol => (
                      <div key={symbol.Symbol} className="symbolItem">
                        <div className="symbolItemInfo">
                          <p style={{ fontWeight: 500 }}>{symbol.Symbol}</p>
                          <p>{symbol.Description || 'No description'}</p>
                        </div>
                        <button
                          onClick={() => toggleSubscription(symbol.Symbol)}
                          className={`subscribeButton ${isSubscribed(symbol.Symbol) ? 'subscribed' : ''}`}
                          style={{
                            backgroundColor: isSubscribed(symbol.Symbol) 
                              ? 'var(--primary-background-color)' 
                              : 'rgba(255, 255, 255, 0.2)',
                            color: 'var(--topContent-font-color)',
                            border: isSubscribed(symbol.Symbol) 
                              ? 'none' 
                              : '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {isSubscribed(symbol.Symbol) ? 'Subscribed' : 'Subscribe'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {!isLoading && allSymbols.length === 0 && !error && (
                <div className="emptyState" style={{ margin: '20px', padding: '40px 20px' }}>
                  <p style={{ margin: 0 }}>No symbols available</p>
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
