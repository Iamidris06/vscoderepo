import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing__content">
        <h1 className="landing__title">
          GAMER<span className="landing__title--accent">DATE</span>
        </h1>
        <p className="landing__subtitle">
          Find your Player 2. Match with people who play what you play.
        </p>
        <Link to="/discover" className="landing__cta">
          Start Discovering →
        </Link>
      </div>
    </div>
  );
}
