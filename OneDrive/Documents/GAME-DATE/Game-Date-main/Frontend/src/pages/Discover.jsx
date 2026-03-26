import { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import { mockUsers } from '../data/mockUsers';
import './Discover.css';

const GENRES    = ['All', 'FPS', 'RPG', 'Battle Royale', 'Casual', 'Strategy',
                   'Horror', 'Simulation', 'Sports', 'Adventure', 'MOBA', 'Card Games', 'Racing'];
const PLATFORMS = ['All', 'PC', 'PlayStation', 'Xbox', 'Mobile', 'Switch'];

export default function Discover() {
  const [users,           setUsers]         = useState([]);
  const [loading,         setLoading]       = useState(true);
  const [mode,            setMode]          = useState('loading');
  // mode: 'ml' | 'browse' | 'mock'

  const [genreFilter,     setGenre]         = useState('All');
  const [platformFilter,  setPlatform]      = useState('All');

  const storedProfile = JSON.parse(localStorage.getItem('gamerdate_profile') || '{}');
  const currentUserId = storedProfile?.id || storedProfile?._id || null;

  useEffect(() => {
    setLoading(true);

    const loadML = async () => {
      // ── Try ML matches first (requires logged-in profile with ID) ──
      if (currentUserId) {
        try {
          const API = import.meta.env.VITE_API_URL;
          const res  = await fetch(`${API}/api/users/${currentUserId}/matches?top_n=20`)
          const data = await res.json();

          if (res.ok && Array.isArray(data.matches) && data.matches.length > 0) {
            let filtered = data.matches;
            if (genreFilter    !== 'All') filtered = filtered.filter(u => u.genres?.includes(genreFilter));
            if (platformFilter !== 'All') filtered = filtered.filter(u => u.platform === platformFilter);
            setUsers(filtered);
            setMode('ml');
            setLoading(false);
            return;
          }
        } catch (_) {}
      }

      // ── Fall back to browse all users ──
      try {
        const params = new URLSearchParams();
        if (genreFilter    !== 'All') params.append('genre',     genreFilter);
        if (platformFilter !== 'All') params.append('platform',  platformFilter);
        const API = import.meta.env.VITE_API_URL;
        const res  = await fetch(`${API}/api/users?${params}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          setMode('browse');
          setLoading(false);
          return;
        }
      } catch (_) {}

      // ── Final fallback — mock data ──
      let filtered = mockUsers;
      if (genreFilter    !== 'All') filtered = filtered.filter(u => u.genres.includes(genreFilter));
      if (platformFilter !== 'All') filtered = filtered.filter(u => u.platform === platformFilter);
      setUsers(filtered);
      setMode('mock');
      setLoading(false);
    };

    loadML();
  }, [genreFilter, platformFilter, currentUserId]);

  const handleLike = (id) => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/users/${id}/like`, { method: 'PATCH' }).catch(() => {});
  };

  const statusMessage = () => {
    if (mode === 'ml')     return `🤖 ${users.length} ML-ranked matches for you`;
    if (mode === 'browse') return `🔍 Browsing all ${users.length} players`;
    if (mode === 'mock')   return `⚠️ Backend offline — showing demo data`;
    return '';
  };

  return (
    <div className="discover">

      {/* Header */}
      <div className="discover__header">
        <h2 className="discover__title">
          {mode === 'ml' ? '💘 Your Matches' : 'Discover Players'}
        </h2>
        <p className="discover__subtitle">{statusMessage()}</p>

        {/* Mode toggle — only show if profile is set up */}
        {currentUserId && mode !== 'mock' && (
          <div className="discover__modetoggle">
            <button
              className={`modetab ${mode === 'ml' ? 'modetab--active' : ''}`}
              onClick={() => setMode('ml')}
            >
              🤖 ML Matches
            </button>
            <button
              className={`modetab ${mode === 'browse' ? 'modetab--active' : ''}`}
              onClick={() => setMode('browse')}
            >
              🔍 Browse All
            </button>
          </div>
        )}

        {/* Prompt to set up profile if no ID */}
        {!currentUserId && (
          <div className="discover__prompt">
            <a href="/profile">👤 Set up your profile</a> to get ML-powered matches!
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <p className="filter-group__label">Genre</p>
          <div className="filter-group__pills">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={`pill ${genreFilter === g ? 'pill--active-purple' : ''}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <p className="filter-group__label">Platform</p>
          <div className="filter-group__pills">
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className={`pill ${platformFilter === p ? 'pill--active-cyan' : ''}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="discover__status">
          <span className="discover__spinner" />
          Loading{mode === 'ml' ? ' your matches' : ' players'}...
        </div>
      ) : users.length === 0 ? (
        <div className="discover__status">No players found with these filters.</div>
      ) : (
        <div className="discover__grid">
          {users.map(user => (
            <ProfileCard
              key={user._id || user.id}
              user={user}
              onLike={handleLike}
              showMatchScore={mode === 'ml'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
