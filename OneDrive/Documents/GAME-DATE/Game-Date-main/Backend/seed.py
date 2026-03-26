import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")

seed_users = [
    {
        "name": "Arjun R.",     "age": 22, "gender":"Male",
        "bio": "Valorant Radiant grinder. Looking for a duo who can keep up in ranked.",
        "platform": "PC",       "games": ["Valorant", "CS2", "Minecraft"],
        "genres": ["FPS", "Survival"], "playStyle": "Competitive", "playTime": "Night", "likes": 14,
    },
    {
        "name": "Priya S.",     "age": 21, "gender":"Female",
        "bio": "Casual RPG lover obsessed with Elden Ring lore.",
        "platform": "PlayStation", "games": ["Elden Ring", "God of War", "Stardew Valley"],
        "genres": ["RPG", "Action"], "playStyle": "Casual", "playTime": "Evening", "likes": 31,
    },
    {
        "name": "Rishi K.",     "age": 24, "gender":"Male",
        "bio": "Mobile gamer by convenience, PC at heart. BGMI Diamond.",
        "platform": "Mobile",   "games": ["BGMI", "Clash Royale"],
        "genres": ["Battle Royale", "Strategy"], "playStyle": "Competitive", "playTime": "Anytime", "likes": 9,
    },
    {
        "name": "Meera T.",     "age": 20, "gender":"Female",
        "bio": "Minecraft builder who secretly loves horror games.",
        "platform": "PC",       "games": ["Minecraft", "Phasmophobia", "Stardew Valley"],
        "genres": ["Survival", "Horror", "Simulation"], "playStyle": "Casual", "playTime": "Night", "likes": 22,
    },
    {
        "name": "Dev P.",       "age": 23, "gender":"Male",
        "bio": "FIFA sweaty + casual Switch guy. Race me in Mario Kart.",
        "platform": "Switch",   "games": ["Mario Kart 8", "Zelda: TOTK"],
        "genres": ["Sports", "Adventure"], "playStyle": "Both", "playTime": "Evening", "likes": 17,
    },
    {
        "name": "Ananya V.",    "age": 22, "gender":"Female",
        "bio": "Apex Legends main (Lifeline only). Into cozy games on break days.",
        "platform": "PC",       "games": ["Apex Legends", "Unpacking", "A Short Hike"],
        "genres": ["Battle Royale", "Simulation"], "playStyle": "Both", "playTime": "Night", "likes": 28,
    },
]

async def seed():
    if not MONGO_URI:
        print("❌ MONGO_URI is empty. Add it to .env first.")
        return
    client = AsyncIOMotorClient(MONGO_URI)
    db     = client["gamerdate"]
    await db["users"].delete_many({})
    await db["users"].insert_many(seed_users)
    print(f" Seeded {len(seed_users)} users successfully!")
    client.close()

asyncio.run(seed())
