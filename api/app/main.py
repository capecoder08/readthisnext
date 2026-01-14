from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, library

app = FastAPI(
    title="Read This Next API",
    description="API for Read This Next book recommendation platform",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(library.router, prefix="/api/library", tags=["library"])


@app.get("/")
async def root():
    return {"message": "Read This Next API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

