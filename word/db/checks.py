"""
Functions to make checks.
"""
from typing import Type

from env import settings
from db.models import *

available_collections: dict[int, Type[Model]] = {
    5: FiveLetter
}


async def word_in_db(word: str) -> bool:
    """
    Checks with the db if the word exists within the db.

    :param word: the word to search for
    :return: **True** if the word exists within the db, **False** otherwise.
    """
    engine = settings.engine
    word_len = len(word)
    model: Type[Model] | None = available_collections.get(word_len)

    # check if word_len has an available collection to search in
    if model is None:
        # word not in database as no available collection for it
        return False

    result = await engine.find_one(model, {"word": {"$eq": word}})

    # return True if found some result
    if result:
        return True
    else:
        return False
