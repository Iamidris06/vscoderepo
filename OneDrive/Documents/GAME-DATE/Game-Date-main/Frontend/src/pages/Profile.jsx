import { useState, useEffect } from 'react';
import './Profile.css';

const GAMES_LIST = [
  'BGMI', 'Free Fire', 'Free Fire MAX', 'Call of Duty Mobile', 'PUBG Mobile',
  'Clash Royale', 'Clash of Clans', 'Brawl Stars', 'Mobile Legends', 'Ludo King',
  'Teen Patti Gold', 'Rummy Circle', 'MPL Games', 'WinZO', 'Subway Surfers',
  'Temple Run 2', 'Candy Crush Saga', 'Asphalt 9', 'Real Cricket 22',
  'World Cricket Championship 3', 'Dream11', '8 Ball Pool', 'Carrom Pool',
  'Genshin Impact Mobile', 'Honkai Star Rail', 'Pokemon Unite',
  'FIFA Mobile', 'eFootball Mobile', 'Valorant', 'CS2', 'GTA V',
  'Minecraft', 'Fortnite', 'Apex Legends', 'League of Legends',
];

const GENRES_LIST = [
  'FPS', 'RPG', 'Battle Royale', 'Survival', 'Strategy',
  'Horror', 'Simulation', 'Sports', 'Adventure', 'MOBA',
  'Card Games', 'Racing', 'Casual', 'Action',
];

const DEFAULT_PROFILE = {
  name: '', age: '', bio: '',
  gender: 'Male',
  platform: 'PC', playStyle: 'Casual', playTime: 'Night',
  games: [], genres: [],
};

const platformColors = {
  PC: '#2563eb', PlayStation: '#4338ca',
  Xbox: '#15803d', Mobile: '#d97706', Switch: '#dc2626',
};

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(DEFAULT_PROFILE);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('gamerdate_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed);
      setDraft(parsed);
    } else {
      setEditing(true);
    }
  }, []);

  const handleSave = async () => {
    if (!draft.name || !draft.age) {
      setError('Name and age are required.');
      return;
    }
    setError('');
    setSaving(true);

    const payload = {
      ...draft,
      age: parseInt(draft.age),
    };

    try {
      const existingId = profile._id || profile.id;

      let data;

      if (existingId) {
        // Profile exists — just update localStorage (PATCH endpoint optional later)
        data = { ...payload, id: existingId, _id: existingId };
      } else {
        // New user — POST to backend
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/users`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to save');
      }

      const toStore = { ...payload, id: data.id || data._id, _id: data.id || data._id };
      localStorage.setItem('gamerdate_profile', JSON.stringify(toStore));
      setProfile(toStore);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      // Backend offline — save to localStorage only
      const toStore = { ...payload };
      localStorage.setItem('gamerdate_profile', JSON.stringify(toStore));
      setProfile(toStore);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const toggleGame  = (g) => setDraft(d => ({
    ...d, games:  d.games.includes(g)  ? d.games.filter(x => x !== g)  : [...d.games,  g],
  }));
  const toggleGenre = (g) => setDraft(d => ({
    ...d, genres: d.genres.includes(g) ? d.genres.filter(x => x !== g) : [...d.genres, g],
  }));

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'default')}`;

  return (
    <div className="profile-page">

      {/* ── VIEW MODE ── */}
      {!editing && (
        <div className="profile-view">
          <div className="profile-view__card">
            <div className="pv__header">
              <img src={avatarUrl} alt="avatar" className="pv__avatar" />
              <div>
                <h2 className="pv__name">{profile.name || 'No Name'}, {profile.age || '??'}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pv__platform"
                    style={{ backgroundColor: platformColors[profile.platform] || '#555' }}>
                    {profile.platform}
                  </span>
                  <span className="pv__platform" style={{ backgroundColor: '#6b21a8' }}>
                    {profile.gender}
                  </span>
                </div>
              </div>
            </div>

            <p className="pv__bio">{profile.bio || 'No bio added yet.'}</p>

            <div className="pv__section">
              <p className="pv__label">🎮 Playing</p>
              <div className="pv__tags">
                {profile.games.length > 0
                  ? profile.games.map(g => <span key={g} className="ptag ptag--game">{g}</span>)
                  : <span className="pv__empty">No games selected</span>}
              </div>
            </div>

            <div className="pv__section">
              <p className="pv__label">🏷️ Genres</p>
              <div className="pv__tags">
                {profile.genres.length > 0
                  ? profile.genres.map(g => <span key={g} className="ptag ptag--genre">{g}</span>)
                  : <span className="pv__empty">No genres selected</span>}
              </div>
            </div>

            <div className="pv__meta">
              <span>🎯 {profile.playStyle}</span>
              <span>🕐 {profile.playTime}</span>
            </div>

            {saved && <p className="pv__saved">✅ Profile saved!</p>}

            <button className="btn-edit"
              onClick={() => { setDraft(profile); setEditing(true); }}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* ── EDIT MODE ── */}
      {editing && (
        <div className="profile-edit">
          <h2 className="pe__title">
            {profile.name ? 'Edit Your Profile' : '👋 Set Up Your Gamer Profile'}
          </h2>

          {error && <p className="pe__error">{error}</p>}

          <div className="pe__form">

            <div className="pe__row">
              <div className="pe__field">
                <label className="pe__label">Name</label>
                <input className="pe__input" type="text" placeholder="Your name"
                  value={draft.name}
                  onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="pe__field pe__field--small">
                <label className="pe__label">Age</label>
                <input className="pe__input" type="number" placeholder="22"
                  value={draft.age}
                  onChange={e => setDraft(d => ({ ...d, age: e.target.value }))} />
              </div>
            </div>

            {/* Gender */}
            <div className="pe__field">
              <label className="pe__label">I am a</label>
              <div className="pe__pills">
                {['Male', 'Female'].map(g => (
                  <button key={g} type="button"
                    onClick={() => setDraft(d => ({ ...d, gender: g }))}
                    className={`pe__pill ${draft.gender === g ? 'pe__pill--active' : ''}`}>
                    {g === 'Male' ? '👦 Male' : '👧 Female'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">Bio</label>
              <textarea className="pe__input pe__textarea"
                placeholder="Tell others what you play, how you play, and what you're looking for..."
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} />
            </div>

            <div className="pe__field">
              <label className="pe__label">Platform</label>
              <div className="pe__pills">
                {['PC', 'PlayStation', 'Xbox', 'Mobile', 'Switch'].map(p => (
                  <button key={p} type="button"
                    onClick={() => setDraft(d => ({ ...d, platform: p }))}
                    className={`pe__pill ${draft.platform === p ? 'pe__pill--active' : ''}`}
                    style={draft.platform === p
                      ? { backgroundColor: platformColors[p], borderColor: platformColors[p] }
                      : {}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">Play Style</label>
              <div className="pe__pills">
                {['Casual', 'Competitive', 'Both'].map(s => (
                  <button key={s} type="button"
                    onClick={() => setDraft(d => ({ ...d, playStyle: s }))}
                    className={`pe__pill ${draft.playStyle === s ? 'pe__pill--active' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">When do you usually play?</label>
              <div className="pe__pills">
                {['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setDraft(d => ({ ...d, playTime: t }))}
                    className={`pe__pill ${draft.playTime === t ? 'pe__pill--active' : ''}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">Games you play
                <span className="pe__hint"> (pick any)</span>
              </label>
              <div className="pe__pills pe__pills--wrap">
                {GAMES_LIST.map(g => (
                  <button key={g} type="button" onClick={() => toggleGame(g)}
                    className={`pe__pill ${draft.games.includes(g) ? 'pe__pill--active' : ''}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__field">
              <label className="pe__label">Genres you love
                <span className="pe__hint"> (pick any)</span>
              </label>
              <div className="pe__pills pe__pills--wrap">
                {GENRES_LIST.map(g => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`pe__pill ${draft.genres.includes(g) ? 'pe__pill--active' : ''}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="pe__actions">
              {profile.name && (
                <button className="btn-cancel" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Profile'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
