import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.index import router as index
from routes.word import router as word_router
from routes.checks import router as checks_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:10000",
    "http://localhost:10001",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index)
app.include_router(word_router)
app.include_router(checks_router)


if __name__ == '__main__':
    uvicorn.run("main:app", port=10005, log_level="debug", reload_includes=["*.py"])
