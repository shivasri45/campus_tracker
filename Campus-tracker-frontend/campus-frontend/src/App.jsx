import { useState, useEffect, useCallback } from 'react';
import { userPool } from './cognito';
import './App.css';

import Auth from './components/Auth';
import Header from './components/Header';
import TicketForm from './components/TicketForm';
import TicketCard from './components/TicketCard';

const API_BASE_URL = "https://de9200onbi.execute-api.ap-south-1.amazonaws.com"; 

function App() {
  const [authView, setAuthView] = useState('loading');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);


  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exit: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3500);
  }, []);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) return setAuthView('login');
        handleLoginSuccess(session);
      });
    } else {
      setAuthView('login');
    }
  }, []);

  const handleLoginSuccess = (sessionOrResult) => {
    const payload = sessionOrResult.getIdToken().decodePayload();
    const groups = payload['cognito:groups'] || [];
    setIsAdmin(groups.includes('Admins'));
    setUserEmail(payload.email);
    setAuthView('app');
    fetchTickets();
  };

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    setAuthView('login');
    setIsAdmin(false);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`);
      const data = await response.json();
      const sorted = (data.tickets || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId) => {
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      showToast('Ticket marked as resolved', 'success');
      fetchTickets();
    } catch (err) {
      showToast('Failed to resolve ticket', 'error');
      console.error(err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}`, { method: 'DELETE' });
      showToast('Ticket deleted', 'success');
      fetchTickets();
    } catch (err) {
      showToast('Failed to delete ticket', 'error');
      console.error(err);
    }
  };

  
  const displayedTickets = tickets.filter(t => {
    const matchesUser = isAdmin ? true : (t.userEmail === userEmail);
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesUser && matchesSearch && matchesStatus && matchesCategory;
  });

  if (authView !== 'app') {
    return <Auth authView={authView} setAuthView={setAuthView} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast toast-${toast.type} ${toast.exit ? 'toast-exit' : ''}`}>
              <span className="toast-icon">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              {toast.message}
            </div>
          ))}
        </div>
      )}

      <Header userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />

      {/* Hero Section */}
      <div className="hero">
        <h1>
          <svg style={{ verticalAlign: 'middle', marginRight: '8px', marginBottom: '6px' }} xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Campus Tracker
        </h1>
        <p>Report and track campus maintenance issues in real-time.</p>
      </div>

      <main className={`main-content ${isAdmin ? 'main-content-full' : ''}`}>
        {!isAdmin && (
          <TicketForm apiUrl={API_BASE_URL} onTicketSubmitted={fetchTickets} userEmail={userEmail} onToast={showToast} />
        )}

        <section className="tickets-section">
          <div className="section-header">
            <h2 className="section-title">
              {isAdmin ? 'All Campus Reports' : 'My Submitted Reports'}
              <span className="tickets-count">{displayedTickets.length}</span>
            </h2>
            
            <div className="filter-bar">
              <input
                type="text"
                className="filter-input"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="IT/Tech">IT / Tech</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="loading">Fetching issues...</p>
          ) : displayedTickets.length === 0 ? (
            <p className="empty-state">No issues match your search 🎉</p>
          ) : (
            <div className={`tickets-grid ${isAdmin ? 'tickets-grid-wide' : ''}`}>
              {displayedTickets.map((ticket, i) => (
                <TicketCard key={ticket.ticketId} ticket={ticket} index={i} isAdmin={isAdmin} onResolve={handleResolve} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;