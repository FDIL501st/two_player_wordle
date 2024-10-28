"""
Reads env variables from .env file
"""
from dotenv import load_dotenv
from os import environ

from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine


class _Settings:
    """A class that should only have 1 object defined."""

    def __init__(self):
        # if docker compose is used
        if environ.get("USE_COMPOSE"):
            self.DB_HOST: str = environ.get("MONGO_HOST")
        else:
            # load variables from .env
            load_dotenv("../.env")

            # this env variable is defined if you are using a mongo cluster
            mongo_cluster_uri: str | None = environ.get("MONGO_CLUSTER_HOST")

            # case where you are using a local mongo deployment
            if mongo_cluster_uri is None:
                self.DB_HOST = environ.get("MONGO_CONNECTION_URL")

            # case where you are using a mongo cluster
            else:
                self.DB_HOST = mongo_cluster_uri

        # define the engine
        client = AsyncIOMotorClient(self.DB_HOST)
        self.engine = AIOEngine(client=client, database="Words")


# create the single Settings object
settings = _Settings()

