import { useState } from 'react';

export default function TicketForm({ apiUrl, onTicketSubmitted, userEmail }) {
  const [studentName, setStudentName] = useState(''); // NEW
  const [rollNo, setRollNo] = useState('');           // NEW
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file || null);
    setPhotoName(file ? file.name : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalImageUrl = null;
      if (photo) {
        const urlResponse = await fetch(`${apiUrl}/upload-url`);
        const urlData = await urlResponse.json();
        
        const s3Response = await fetch(urlData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: photo,
        });
        if (!s3Response.ok) throw new Error("S3 Upload Failed");
        finalImageUrl = urlData.uploadUrl.split('?')[0]; 
      }

      // We added studentName and rollNo here!
      await fetch(`${apiUrl}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userEmail: userEmail,
            studentName, 
            rollNo, 
            title, 
            category, 
            description, 
            imageUrl: finalImageUrl 
        }),
      });

      // Reset form
      setStudentName(''); setRollNo(''); setTitle(''); setCategory('Maintenance'); setDescription('');
      setPhoto(null); setPhotoName('');
      onTicketSubmitted(); 
    } catch (err) {
      alert("Failed to submit report.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="form-section">
      <div className="card">
        <h2>⚡ Report an Issue</h2>
        <form onSubmit={handleSubmit}>
          {/* NEW: Name and Roll Number side-by-side */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Your Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Roll Number</label>
              <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="2400.." required />
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Broken AC" required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="IT/Tech">💻 IT / Tech Support</option>
              <option value="Safety">🛡 Safety / Security</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details..." required />
          </div>
          <div className="form-group">
            <label>Photo Evidence (Optional)</label>
            <input type="file" accept="image/jpeg, image/png" onChange={handlePhotoChange} />
            {photoName && <p style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>📎 {photoName}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? '⏳ Submitting...' : '→ Submit Report'}
          </button>
        </form>
      </div>
    </section>
  );
}