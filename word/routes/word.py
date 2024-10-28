"""
Routes that get words.
"""

from fastapi import APIRouter
from db.read import get_random_five_letter_word

router = APIRouter(
    tags=["Word"],
    prefix="/word"
)


@router.get('/five_letter', response_model=str)
async def get_five_letter_word() -> str:
    """Returns a random five letter word."""
    return await get_random_five_letter_word()