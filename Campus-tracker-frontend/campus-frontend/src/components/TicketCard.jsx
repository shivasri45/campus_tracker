export default function TicketCard({ ticket, index, isAdmin, onResolve, onDelete }) {
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isResolved = ticket.status === 'RESOLVED';
  const isDeleted = ticket.status === 'DELETED';

  return (
    <div className={`ticket-card ${isResolved ? 'resolved' : ''} ${isDeleted ? 'deleted' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="ticket-header">
        <span className={`badge ${isResolved ? 'badge-resolved' : isDeleted ? 'badge-deleted' : 'badge-open'}`}>
          {isResolved ? '✓ Resolved' : isDeleted ? '✕ Deleted' : '● Open'}
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

      {/* Original issue image — visible to everyone */}
      {ticket.imageUrl && (
        <img src={ticket.imageUrl} alt="Issue evidence" className="ticket-image" />
      )}

      {/* Deletion notice — visible to student */}
      {isDeleted && (
        <div className="deletion-notice">
          <span className="deletion-notice-icon">⚠️</span>
          <div>
            <p className="deletion-notice-title">Your ticket was removed by the admin.</p>
            {ticket.deletionReason && (
              <p className="deletion-notice-reason">Reason: {ticket.deletionReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Resolution details — visible to everyone */}
      {isResolved && (ticket.resolvedImageUrl || ticket.adminComments) && (
        <div className="resolved-details">
          {ticket.resolvedImageUrl && (
            <img src={ticket.resolvedImageUrl} alt="Resolution evidence" className="ticket-image resolved-image" />
          )}
          {ticket.adminComments && (
            <p className="admin-comments">
              <span className="admin-comments-label">💬 Admin note:</span> {ticket.adminComments}
            </p>
          )}
        </div>
      )}
      
      <p className="ticket-meta">{formatDate(ticket.createdAt)}</p>
      
      {isAdmin && !isDeleted && (
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