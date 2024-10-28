from models import FiveLetter
from env import settings
import asyncio


async def main():

    engine = settings.engine
    results = await engine.find(FiveLetter)
    print(results)

    collection = engine.get_collection(FiveLetter)
    pipeline = [{"$sample": {"size": 1}}]
    # get a list that has 1 random document from FiveLetter collection
    docs = await collection.aggregate(pipeline).to_list(length=1)

    # convert the document type into FiveLetter object
    doc = docs[0]
    random_word: FiveLetter = FiveLetter.model_validate_doc(doc)

    print(random_word.word)

if __name__ == '__main__':
    asyncio.run(main())
