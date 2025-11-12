import React, { useState } from 'react';
import { useAuth } from '../features/auth';
import { Spinner } from '../shared/ui/spinner';
import '../shared/styles/index.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('test@test.ru');
  const [password, setPassword] = useState('123456Aa');
  const loginEndpoint = 'https://dev-virt-point.utip.work/v3/login';
  const { login, isLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password, loginEndpoint);
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div className="authPage">
      <div className="mainForm">
        <div className="mainLogo">
          <div className="logotip">
            <div style={{ 
              width: '112px', 
              height: '56px', 
              backgroundColor: '#CFB2FF', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              UTIP
            </div>
          </div>
          <div className="logotipLabel">Symbol Tracker</div>
        </div>
        <form name="authForm" className="mainForm" onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="authFormContainer">
            <div className="pageTitle">Sign In</div>
            
            <div className="input-wrapper">
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            {(authError || localError) && (
              <div className="errorMessage" style={{ marginTop: '15px', marginBottom: '0' }}>
                <p style={{ margin: 0 }}>Login Failed: {authError || localError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="button loginButton"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
