import { useState } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../cognito';

function BrandHeader() {
  return (
    <div className="auth-brand">
      <div className="auth-brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div className="auth-brand-eyebrow">Campus Operations</div>
      <div className="auth-brand-title">Campus Tracker</div>
    </div>
  );
}

function PasswordField({ value, onChange, show, onToggle, placeholder = 'Enter your password' }) {
  return (
    <div className="password-wrapper">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        minLength={8}
      />
      <button type="button" className="password-toggle" onClick={onToggle} tabIndex={-1}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

export default function Auth({ authView, setAuthView, onLoginSuccess }) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // New Password State (For Admin-invited users)
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [cognitoUserObj, setCognitoUserObj] = useState(null);

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Current view override within Auth component
  const [localView, setLocalView] = useState('login');

  // In-page messages instead of alert()
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // --- 1. LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        onLoginSuccess(result);
      },
      onFailure: (err) => {
        setIsSubmitting(false);
        if (err.code === 'UserNotConfirmedException') {
          setSignUpEmail(email);
          setLocalView('verify');
          setError('');
          setSuccess('Please verify your email first. Check your inbox.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      },
      newPasswordRequired: () => {
        setIsSubmitting(false);
        setCognitoUserObj(cognitoUser);
        setLocalView('new_password');
        clearMessages();
      }
    });
  };

  const handleNewPasswordSubmit = (e) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    cognitoUserObj.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        onLoginSuccess(result);
      },
      onFailure: (err) => {
        setIsSubmitting(false);
        setError(err.message || 'Failed to set new password.');
      }
    });
  };

  // --- 2. SIGN UP ---
  const handleSignUp = (e) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: signUpEmail })
    ];

    userPool.signUp(signUpEmail, signUpPassword, attributeList, null, (err, result) => {
      setIsSubmitting(false);
      if (err) {
        setError(err.message || 'Sign up failed.');
        return;
      }
      setLocalView('verify');
      setError('');
      setSuccess('Verification code sent to your email!');
    });
  };

  // --- 3. VERIFY EMAIL ---
  const handleVerify = (e) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    const cognitoUser = new CognitoUser({ Username: signUpEmail, Pool: userPool });

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      setIsSubmitting(false);
      if (err) {
        setError(err.message || 'Verification failed.');
        return;
      }
      setEmail(signUpEmail);
      setLocalView('login');
      setError('');
      setSuccess('Account verified successfully! You can now log in.');
    });
  };



  // --- RENDER SCREENS ---

  if (authView === 'loading') {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>Loading Campus Tracker...</span>
      </div>
    );
  }

  // VERIFY SCREEN
  if (localView === 'verify') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <BrandHeader />
          <h2 className="auth-heading">Verify Email</h2>
          <p className="auth-subtitle">
            We sent a 6-digit code to <strong>{signUpEmail}</strong>.
          </p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Verification Code</label>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required placeholder="123456" />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><span className="spinner spinner-sm"></span> Verifying...</> : 'Verify Account'}
            </button>
          </form>
          <div className="auth-footer">
            <button onClick={() => { setLocalView('login'); clearMessages(); }} className="auth-link-btn">← Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  // NEW PASSWORD SCREEN
  if (localView === 'new_password' || authView === 'new_password') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <BrandHeader />
          <h2 className="auth-heading">Set New Password</h2>
          <p className="auth-subtitle">
            First time logging in. Please set a permanent password.
          </p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <form onSubmit={handleNewPasswordSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <PasswordField value={newPassword} onChange={(e) => setNewPassword(e.target.value)} show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} placeholder="Min 8 characters" />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><span className="spinner spinner-sm"></span> Setting...</> : 'Set Password & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SIGN UP SCREEN
  if (localView === 'signup') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <BrandHeader />
          <h2 className="auth-heading">Create Account</h2>
          <p className="auth-subtitle">Register as a new student to get started.</p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required placeholder="your.name@campus.edu" />
            </div>
            <div className="form-group">
              <label>Password (Min 8 characters)</label>
              <PasswordField value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} show={showSignUpPassword} onToggle={() => setShowSignUpPassword(!showSignUpPassword)} placeholder="Create a strong password" />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><span className="spinner spinner-sm"></span> Creating...</> : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account?{' '}
            <button onClick={() => { setLocalView('login'); clearMessages(); }} className="auth-link-btn">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <BrandHeader />
        <h2 className="auth-heading">Welcome Back</h2>
        <p className="auth-subtitle">Enter your student or staff email to continue.</p>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your.name@campus.edu" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <><span className="spinner spinner-sm"></span> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account?{' '}
          <button onClick={() => { setLocalView('signup'); clearMessages(); }} className="auth-link-btn">Create Account</button>
        </div>
      </div>
    </div>
  );
}