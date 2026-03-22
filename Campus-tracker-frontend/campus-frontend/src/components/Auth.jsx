import { useState } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../cognito';

export default function Auth({ authView, setAuthView, onLoginSuccess }) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New Password State (For Admin-invited users)
  const [newPassword, setNewPassword] = useState('');
  const [cognitoUserObj, setCognitoUserObj] = useState(null);

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Current view override within Auth component
  const [localView, setLocalView] = useState('login'); // 'login', 'signup', 'verify', 'new_password'

  // --- 1. LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => onLoginSuccess(result),
      onFailure: (err) => {
        if (err.code === 'UserNotConfirmedException') {
          setSignUpEmail(email);
          setLocalView('verify');
          alert('Please verify your email first.');
        } else {
          alert(err.message || JSON.stringify(err));
        }
      },
      newPasswordRequired: () => {
        setCognitoUserObj(cognitoUser);
        setLocalView('new_password');
      }
    });
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    cognitoUserObj.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (result) => onLoginSuccess(result),
      onFailure: (err) => alert(err.message || JSON.stringify(err))
    });
  };

  // --- 2. SIGN UP ---
  const handleSignUp = (e) => {
    e.preventDefault();
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: signUpEmail })
    ];

    userPool.signUp(signUpEmail, signUpPassword, attributeList, null, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      // Sign up success! Now they need to verify their email.
      setLocalView('verify');
      alert('Verification code sent to your email!');
    });
  };

  // --- 3. VERIFY EMAIL ---
  const handleVerify = (e) => {
    e.preventDefault();
    const cognitoUser = new CognitoUser({ Username: signUpEmail, Pool: userPool });

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      alert('Account verified successfully! You can now log in.');
      setEmail(signUpEmail); // Pre-fill login email
      setLocalView('login');
    });
  };

  // --- RENDER SCREENS ---

  if (authView === 'loading') return <div className="loading-screen">Loading...</div>;

  // VERIFY SCREEN
  if (localView === 'verify') {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <h2 style={{ justifyContent: 'center', borderBottom: 'none', marginBottom: '0.5rem' }}>Verify Email</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            We sent a 6-digit code to <strong>{signUpEmail}</strong>.
          </p>
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required placeholder="123456" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Verify Account</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => setLocalView('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>← Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  // NEW PASSWORD SCREEN
  if (localView === 'new_password' || authView === 'new_password') {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <h2 style={{ justifyContent: 'center', borderBottom: 'none' }}>Change Password</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            First time logging in. Please set a permanent password.
          </p>
          <form onSubmit={handleNewPasswordSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Set Password & Enter</button>
          </form>
        </div>
      </div>
    );
  }

  // SIGN UP SCREEN
  if (localView === 'signup') {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div className="header-eyebrow" style={{ justifyContent: 'center', display: 'flex', width: '100%' }}>Campus Operations</div>
          <h2 style={{ justifyContent: 'center', borderBottom: 'none', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Register as a new student.</p>
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password (Min 8 characters)</label>
              <input type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Sign Up</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <button onClick={() => setLocalView('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (Default)
  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="header-eyebrow" style={{ justifyContent: 'center', display: 'flex', width: '100%' }}>Campus Operations</div>
        <h2 style={{ justifyContent: 'center', borderBottom: 'none', marginBottom: '0.5rem' }}>Sign In</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter your student or staff email.</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Secure Login</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <button onClick={() => setLocalView('signup')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}