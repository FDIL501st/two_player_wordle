"""
Routes that deals with checks.

For example, checking if a word is valid.
Might also include comparison between two words.
"""

from fastapi import APIRouter
from db.checks import word_in_db

router = APIRouter(
    tags=["Checks"],
    prefix="/check"
)


@router.get('/isValid', response_model=bool)
async def wordIsValid(word: str) -> bool:
    """Returns a random five letter word.
    :param word: The word to check if it is valid.
    """
    return await word_in_db(word)
