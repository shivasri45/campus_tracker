import { useState } from 'react';

export default function ResolveModal({ apiUrl, onConfirm, onCancel }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file || null);
    setPhotoName(file ? file.name : '');
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      let resolvedImageUrl = null;
      if (photo) {
        const urlResponse = await fetch(`${apiUrl}/upload-url`);
        const urlData = await urlResponse.json();
        const s3Response = await fetch(urlData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': photo.type },
          body: photo,
        });
        if (!s3Response.ok) throw new Error(`S3 Upload Failed: ${s3Response.status} ${s3Response.statusText}`);
        resolvedImageUrl = urlData.uploadUrl.split('?')[0];
      }
      await onConfirm({ resolvedImageUrl, adminComments: comments.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✓ Resolve Ticket</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <p className="modal-subtitle">
          Optionally upload a photo of the resolved issue and add comments visible to the student.
        </p>

        <div className="form-group">
          <label>Resolution Photo (Optional)</label>
          <input type="file" accept="image/jpeg, image/png" onChange={handlePhotoChange} />
          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Resolution preview" />
              <div className="photo-preview-name">📎 {photoName}</div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Admin Comments (Optional)</label>
          <textarea
            rows="3"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="e.g., The AC unit has been repaired and tested successfully."
          />
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            className="modal-btn-resolve"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Resolving…' : '✓ Mark as Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}
