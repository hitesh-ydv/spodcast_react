from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic

app = FastAPI()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ytmusic = YTMusic()

@app.get("/")
def root():
    return {"message": "YouTube Music API Backend Running 🎵"}

@app.get("/home")
def get_home(limit: int = 3):
    try:
        home_data = ytmusic.get_home(limit=limit)
        return {"status": "success", "data": home_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/song/{videoId}")
def get_song(videoId: str):
    """
    Fetch detailed song info using videoId
    Example: /song/abcd1234xyz
    """
    try:
        song_info = ytmusic.get_song(videoId)
        return {"status": "success", "data": song_info}
    except Exception as e:
        return {"status": "error", "message": str(e)}