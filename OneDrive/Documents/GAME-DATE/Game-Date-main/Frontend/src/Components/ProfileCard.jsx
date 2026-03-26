import { useState } from 'react';
import './ProfileCard.css';

const platformColors = {
  PC: 'platform--pc',
  PlayStation: 'platform--ps',
  Xbox: 'platform--xbox',
  Mobile: 'platform--mobile',
  Switch: 'platform--switch',
};

const genreClasses = [
  'genre--purple', 'genre--cyan', 'genre--pink',
  'genre--orange', 'genre--teal',
];

export default function ProfileCard({ user, onLike, showMatchScore = false })  {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      onLike(user._id || user.id);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

  return (
    <div className={`card ${liked ? 'card--liked' : ''}`}>
      {showMatchScore && user.matchScore !== undefined && (
        <div className="card__matchbadge">
          <span
            className={`matchbadge ${user.matchScore >= 75 ? 'matchbadge--high' :
                user.matchScore >= 50 ? 'matchbadge--mid' : 'matchbadge--low'
              }`}
          >
            {user.matchScore}% Match
          </span>
          <span className="matchbadge__sub">
            🤖 {user.modelProbability}% · 🧬 {user.cosineSimilarity}%
          </span>
        </div>
      )}

      {/* Header */}
      <div className="card__header">
        <img src={avatarUrl} alt={user.name} className="card__avatar" />
        <div className="card__identity">
          <h3 className="card__name">{user.name}, {user.age}</h3>
          <span className={`card__platform ${platformColors[user.platform] || ''}`}>
            {user.platform}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="card__bio">{user.bio}</p>

      {/* Games */}
      <div className="card__section">
        <p className="card__label">Playing</p>
        <div className="card__tags">
          {user.games.map(game => (
            <span key={game} className="tag tag--game">{game}</span>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="card__tags">
        {user.genres.map((genre, i) => (
          <span key={genre} className={`tag tag--genre ${genreClasses[i % genreClasses.length]}`}>
            {genre}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="card__footer">
        <div className="card__meta">
          <span>🎯 {user.playStyle}</span>
          <span>🕐 {user.playTime}</span>
        </div>
        <button
          onClick={handleLike}
          className={`btn-like ${liked ? 'btn-like--active' : ''}`}
        >
          {liked ? '❤️ Liked' : '🤍 Like'}
          <span className="btn-like__count">{(user.likes || 0) + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}
