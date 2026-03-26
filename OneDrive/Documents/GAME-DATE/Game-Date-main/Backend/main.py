from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router as user_router
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MatchmakingServer")

app = FastAPI(title="GamerDate API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://*.vercel.app",     
                   "https://yourdomain.com",
                ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/users", tags=["Users"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("New client connected to matchmaking.")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info("Client disconnected from matchmaking.")

manager = ConnectionManager()

@app.websocket("/ws/matchmaking")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't strictly need to receive data for the handshake, 
            # but we wait for messages to keep the connection open and catch disconnects.
            data = await websocket.receive_text()
            logger.info(f"Received from client: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "GamerDate API is running!"}
