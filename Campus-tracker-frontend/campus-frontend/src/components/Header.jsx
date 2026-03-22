export default function Header({ userEmail, isAdmin, onLogout }) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <div className="navbar-title">Campus Tracker</div>
          <div className="navbar-subtitle">Operations System</div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <span className={`user-role ${isAdmin ? 'user-role-admin' : 'user-role-student'}`}>
              {isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}