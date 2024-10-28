"""
Has functions that reads from the db.
"""

from env import settings
from db.models import FiveLetter


async def get_random_five_letter_word() -> str:
    """
    Gets a random five letter word from the database.

    :return: a five letter word
    """
    five_letter_collection = settings.engine.get_collection(FiveLetter)
    pipeline = [{"$sample": {"size": 1}}]
    # get a list that has 1 random document from FiveLetter collection
    docs = await five_letter_collection.aggregate(pipeline).to_list(length=1)

    # convert the document type into FiveLetter object
    doc = docs[0]
    random_word: FiveLetter = FiveLetter.model_validate_doc(doc)

    return random_word.word

