from fastapi import APIRouter

router = APIRouter(
    tags=['Hello']
)


@router.get("/")
async def index():
    return {"message": "Hello World"}
