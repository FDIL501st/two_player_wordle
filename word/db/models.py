from odmantic import Model


class FiveLetter(Model):
    word: str

    model_config = {
        "collection": "FiveLetters"
    }


class FourLetter(Model):
    word: str

    model_config = {
        "collection": "FourLetters"
    }


class SixLetter(Model):
    word: str

    model_config = {
        "collection": "SixLetters"
    }
