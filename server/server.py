from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.auth import auth_router

app = FastAPI()

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount routers
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.server:app", host="0.0.0.0", port=8000, reload=False)
