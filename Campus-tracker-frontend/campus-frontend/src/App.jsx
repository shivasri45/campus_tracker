import { useState, useEffect } from 'react';
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

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

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
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}`, { method: 'DELETE' });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILTERING LOGIC ---
  const displayedTickets = tickets.filter(t => {
    // 1. My Tickets Logic (Students only see theirs, Admins see all)
    // Note: Older tickets without an email will be hidden from students, but visible to Admins.
    const matchesUser = isAdmin ? true : (t.userEmail === userEmail);
    
    // 2. Search Logic
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 3. Dropdown Filters
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;

    return matchesUser && matchesSearch && matchesStatus && matchesCategory;
  });

  if (authView !== 'app') {
    return <Auth authView={authView} setAuthView={setAuthView} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Header userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />

      <main className="main-content">
        {!isAdmin && (
          <TicketForm apiUrl={API_BASE_URL} onTicketSubmitted={fetchTickets} userEmail={userEmail} />
        )}

        <section className="tickets-section" style={{ gridColumn: isAdmin ? '1 / -1' : 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h2>{isAdmin ? 'All Campus Reports' : 'My Submitted Reports'}</h2>
            
            {/* SEARCH AND FILTERS */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Search issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-raised)', border: '1px solid var(--border-bright)', color: 'white' }} />
              
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-raised)', border: '1px solid var(--border-bright)', color: 'white' }}>
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-raised)', border: '1px solid var(--border-bright)', color: 'white' }}>
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
            <div className="tickets-grid" style={{ gridTemplateColumns: isAdmin ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'repeat(auto-fill, minmax(290px, 1fr))'}}>
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