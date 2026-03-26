import pickle
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")

# ── Static mappings for vector encoding ──
PLATFORMS   = ["Mobile", "PC", "PlayStation", "Xbox", "Switch"]
PLAY_STYLES = ["Casual", "Competitive", "Both"]
PLAY_TIMES  = ["Morning", "Afternoon", "Evening", "Night", "Anytime"]
ALL_GENRES  = [
    "Battle Royale", "Strategy", "Casual", "Sports", "RPG",
    "FPS", "MOBA", "Card Games", "Racing", "Simulation", "Action", "Adventure"
]
ALL_GAMES = [
    "BGMI", "Free Fire", "Free Fire MAX", "Call of Duty Mobile", "PUBG Mobile",
    "Clash Royale", "Clash of Clans", "Brawl Stars", "Mobile Legends", "Arena of Valor",
    "Ludo King", "Teen Patti Gold", "Rummy Circle", "MPL Games", "WinZO",
    "Subway Surfers", "Temple Run 2", "Candy Crush Saga", "Hill Climb Racing",
    "Asphalt 9", "Real Cricket 22", "World Cricket Championship 3", "Dream11",
    "8 Ball Pool", "Carrom Pool", "Stick Cricket Super League", "Road Fighter",
    "Garena Contra Returns", "League of Legends: Wild Rift", "Genshin Impact Mobile",
    "Honkai Star Rail", "Pokemon Unite", "Yu-Gi-Oh! Master Duel Mobile",
    "FIFA Mobile", "eFootball Mobile", "NBA 2K Mobile",
    "Valorant", "CS2", "GTA V", "Minecraft", "Fortnite",
    "Apex Legends", "League of Legends", "Dota 2", "FIFA 25", "WWE 2K24",
    "God of War", "Elden Ring", "Spider-Man PC", "Cyberpunk 2077",
]

# Load model bundle once at import time
_bundle = None

def _load_bundle():
    global _bundle
    if _bundle is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "model.pkl not found. Run: python ml/train.py first."
            )
        with open(MODEL_PATH, "rb") as f:
            _bundle = pickle.load(f)
    return _bundle


def _one_hot(value: str, options: list) -> list:
    """Convert a single categorical value to a one-hot encoded list."""
    return [1 if value == o else 0 for o in options]


def _multi_hot(values: list, options: list) -> list:
    """Convert a list of values to a multi-hot encoded list."""
    return [1 if o in values else 0 for o in options]


def build_user_vector(user: dict) -> np.ndarray:
    """
    Convert a user profile dict into a numeric feature vector.
    Used for cosine similarity (cold start) matching.
    """
    games  = user.get("games",  [])
    genres = user.get("genres", [])

    vec = (
        _one_hot(user.get("platform",  "Mobile"),    PLATFORMS)   +
        _one_hot(user.get("playStyle", "Casual"),    PLAY_STYLES) +
        _one_hot(user.get("playTime",  "Night"),     PLAY_TIMES)  +
        _multi_hot(genres, ALL_GENRES)                             +
        _multi_hot(games,  ALL_GAMES)
    )
    return np.array(vec, dtype=float)


def build_pair_features(user_a: dict, user_b: dict) -> np.ndarray:
    """
    Build the feature vector for a (user_a, user_b) pair.
    These are the same 7 features the model was trained on.
    """
    games_a  = set(user_a.get("games",  []))
    games_b  = set(user_b.get("games",  []))
    genres_a = set(user_a.get("genres", []))
    genres_b = set(user_b.get("genres", []))

    shared_games   = len(games_a  & games_b)
    shared_genres  = len(genres_a & genres_b)
    platform_match = int(user_a.get("platform")  == user_b.get("platform"))
    playstyle_match = int(
        user_a.get("playStyle") == user_b.get("playStyle") or
        "Both" in [user_a.get("playStyle"), user_b.get("playStyle")]
    )
    playtime_match = int(
        user_a.get("playTime") == user_b.get("playTime") or
        "Anytime" in [user_a.get("playTime"), user_b.get("playTime")]
    )
    age_diff = abs(int(user_a.get("age", 20)) - int(user_b.get("age", 20)))

    # Compatibility score (same formula as dataset generation)
    compat = (
        shared_games  * 20 +
        shared_genres * 15 +
        platform_match  * 20 +
        playstyle_match * 15 +
        playtime_match  * 10 +
        (10 if age_diff <= 2 else 5 if age_diff <= 4 else 0)
    )
    compat = min(compat, 100)

    return np.array([[
        shared_games, shared_genres, platform_match,
        playstyle_match, playtime_match, age_diff, compat
    ]], dtype=float)


def get_matches(current_user: dict, all_users: list, top_n: int = 10) -> list:
    bundle  = _load_bundle()
    model   = bundle["model"]
    scaler  = bundle["scaler"]

    current_vec    = build_user_vector(current_user).reshape(1, -1)
    current_id     = str(current_user.get("_id", current_user.get("id", "")))
    current_gender = current_user.get("gender", "").lower()

    # Determine opposite gender
    opposite_gender = "male" if current_gender == "female" else "female"

    results = []

    for candidate in all_users:
        candidate_id     = str(candidate.get("_id", candidate.get("id", "")))
        candidate_gender = candidate.get("gender", "").lower()

        # Skip self
        if candidate_id == current_id:
            continue

        # Skip same gender — only show opposite
        if candidate_gender != opposite_gender:
            continue

        # ── rest of the scoring stays exactly the same ──
        candidate_vec = build_user_vector(candidate).reshape(1, -1)
        cos_sim       = float(cosine_similarity(current_vec, candidate_vec)[0][0])

        pair_features  = build_pair_features(current_user, candidate)
        pair_scaled    = scaler.transform(pair_features)
        match_prob     = float(model.predict_proba(pair_scaled)[0][1])

        combined_score = (match_prob * 0.70) + (cos_sim * 0.30)

        results.append({
            **candidate,
            "matchScore":       round(combined_score * 100),
            "modelProbability": round(match_prob * 100),
            "cosineSimilarity": round(cos_sim * 100),
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)
    return results[:top_n]
