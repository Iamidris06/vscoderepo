from fastapi       import APIRouter, HTTPException, Query
from typing        import Optional, List
from bson          import ObjectId
from database      import db
from models        import UserCreate, UserOut
from ml.matcher    import get_matches   # ← add this import

router = APIRouter()

def fmt(user: dict) -> dict:
    user["id"] = str(user["_id"])
    del user["_id"]
    return user

# ── existing routes stay exactly the same ──
@router.get("/", response_model=List[UserOut])
async def get_users(
    genre     : Optional[str] = Query(None),
    platform  : Optional[str] = Query(None),
    playStyle : Optional[str] = Query(None),
):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")
    query = {}
    if genre:     query["genres"]    = {"$in": [genre]}
    if platform:  query["platform"]  = platform
    if playStyle: query["playStyle"] = playStyle
    users = await db["users"].find(query).sort("_id", -1).to_list(100)
    return [fmt(u) for u in users]

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return fmt(user)

@router.post("/", response_model=UserOut, status_code=201)
async def create_user(user: UserCreate):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")
    payload          = user.model_dump()
    payload["likes"] = 0
    result           = await db["users"].insert_one(payload)
    created          = await db["users"].find_one({"_id": result.inserted_id})
    return fmt(created)

@router.patch("/{user_id}/like", response_model=UserOut)
async def like_user(user_id: str):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")
    result = await db["users"].find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$inc": {"likes": 1}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return fmt(result)

# ── NEW: ML matches endpoint ──
@router.get("/{user_id}/matches")
async def get_user_matches(user_id: str, top_n: int = Query(10, ge=1, le=50)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    # Get the requesting user
    current_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    current_user = fmt(current_user)

    # Get everyone else
    all_users_raw = await db["users"].find({}).to_list(1000)
    all_users     = [fmt(u) for u in all_users_raw]

    try:
        matches = get_matches(current_user, all_users, top_n=top_n)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {"user_id": user_id, "matches": matches}
