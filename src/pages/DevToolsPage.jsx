import { useState } from 'react';
import { clearAllData, seedDummyData } from '../api/seed';
import '../styles/challenges.css'; // reuse existing button styles

export default function DevToolsPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleClear() {
    if (!confirm('This will delete ALL data from Firestore. Are you sure?')) return;

    setLoading(true);
    setStatus(null);
    try {
      const result = await clearAllData();
      setStatus(`✅ Cleared: ${result.challenges} challenges, ${result.submissions} submissions, ${result.code} code docs.`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  }

  async function handleSeed() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await seedDummyData();
      setStatus(`✅ Seeded: ${result.challenges} challenges, ${result.submissions} submissions.`);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <main className="challenges-page">
      <h1>Dev Tools</h1>
      <p>Database utilities for development and testing.</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          className="btn"
          onClick={handleClear}
          disabled={loading}
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          {loading ? 'Working...' : '🗑️ Clear All Data'}
        </button>

        <button
          className="btn btn--primary"
          onClick={handleSeed}
          disabled={loading}
        >
          {loading ? 'Working...' : '🌱 Seed Dummy Data'}
        </button>
      </div>

      {status && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          fontSize: '0.9rem',
        }}>
          {status}
        </div>
      )}
    </main>
  );
}
