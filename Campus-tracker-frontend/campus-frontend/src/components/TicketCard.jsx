export default function TicketCard({ ticket, index, isAdmin, onResolve, onDelete }) {
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isResolved = ticket.status === 'RESOLVED';

  return (
    <div className={`ticket-card ${isResolved ? 'resolved' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="ticket-header">
        <span className={`badge ${isResolved ? 'badge-resolved' : 'badge-open'}`}>
          {isResolved ? '✓ Resolved' : '● Open'}
        </span>
        <span className="category">{ticket.category}</span>
      </div>
      
      <h3>{ticket.title}</h3>
      
      {(ticket.studentName || ticket.rollNo) && (
        <p className="ticket-reporter">
          👤 {ticket.studentName} ({ticket.rollNo})
        </p>
      )}

      <p className="desc">{ticket.description}</p>
      
      {isAdmin && ticket.imageUrl && (
        <img src={ticket.imageUrl} alt="Issue evidence" className="ticket-image" />
      )}
      
      <p className="ticket-meta">{formatDate(ticket.createdAt)}</p>
      
      {isAdmin && (
        <div className="ticket-actions">
          {!isResolved && (
            <button className="btn-resolve" onClick={() => onResolve(ticket.ticketId)}>
              ✓ RESOLVE
            </button>
          )}
          <button className="btn-delete" onClick={() => onDelete(ticket.ticketId)}>
            🗑️ DELETE
          </button>
        </div>
      )}
    </div>
  );
}