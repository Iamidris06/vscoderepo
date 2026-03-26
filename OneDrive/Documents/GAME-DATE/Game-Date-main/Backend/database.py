import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")

client = AsyncIOMotorClient(MONGO_URI) if MONGO_URI else None
db     = client["gamerdate"] if client else None
