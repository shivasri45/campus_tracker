import { useState } from 'react';

export default function DeleteModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🗑️ Delete Ticket</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <p className="modal-subtitle">
          The student will be notified that their ticket was removed. Please provide a reason.
        </p>
        <div className="form-group">
          <label>Reason for Deletion <span className="required-star">*</span></label>
          <textarea
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Duplicate report, issue already resolved, invalid submission..."
            required
          />
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            className="modal-btn-delete"
            onClick={handleConfirm}
            disabled={submitting || !reason.trim()}
          >
            {submitting ? 'Deleting…' : '🗑️ Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
