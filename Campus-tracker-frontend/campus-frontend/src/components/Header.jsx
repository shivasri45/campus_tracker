export default function Header({ userEmail, isAdmin, onLogout }) {
  return (
    <header className="header" style={{ paddingBottom: '2rem' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {userEmail} {isAdmin && <strong style={{ color: 'var(--accent)' }}>(Admin)</strong>}
        </span>
        <button onClick={onLogout} className="btn-resolve" style={{ borderColor: 'var(--border-bright)', color: 'var(--text-muted)', marginTop: 0 }}>
          Logout
        </button>
      </div>
      <div className="header-eyebrow">Campus Operations System</div>
      <h1>🏛️ Campus Tracker</h1>
      <p>Report and track campus maintenance issues in real-time.</p>
    </header>
  );
}