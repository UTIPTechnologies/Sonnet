import React from 'react';
import { useTheme } from '../features/theme';
import { useSubscription } from '../features/subscription';
import { Spinner } from '../shared/ui/spinner';
import '../shared/styles/index.css';

interface SettingsPageProps {
  navigateTo: (page: 'symbols' | 'settings') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ navigateTo }) => {
  const { theme, toggleTheme } = useTheme();
  const { allSymbols, toggleSubscription, isSubscribed, isLoading, error } = useSubscription();

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
              {!isLoading && !error && (
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
                      <div key={symbol.Symbol} className="symbolItem" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderBottom: '1px solid rgba(167, 174, 232, 0.2)'
                      }}>
                        <div className="symbolItemInfo">
                          <p style={{ color: '#FFFFFF', fontWeight: 500 }}>{symbol.Symbol}</p>
                          <p style={{ color: 'rgba(167, 174, 232, 0.8)' }}>{symbol.Description || 'No description'}</p>
                        </div>
                        <button
                          onClick={() => toggleSubscription(symbol.Symbol)}
                          className={`subscribeButton ${isSubscribed(symbol.Symbol) ? 'subscribed' : ''}`}
                          style={{
                            backgroundColor: isSubscribed(symbol.Symbol) 
                              ? '#5DBA40' 
                              : 'rgba(255, 255, 255, 0.2)',
                            color: '#FFFFFF',
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
            </div>
          </div>
          
          <div className="flexDiv"></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
