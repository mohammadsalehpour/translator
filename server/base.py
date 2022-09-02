from datetime import datetime
from googletrans import Translator


class Word():
    id = 0
    key = ""
    value = ""
    sourceLang = ""
    targetLang = ""
    suggestedSource = ""
    similarityPercentage = 0
    date_created = datetime.utcnow

    def __init__(self, key, value, sLang, tLang, suggestedSource):
        self.key = key
        self.value = value
        self.sourceLang = sLang
        self.targetLang = tLang
        self.suggestedSource = suggestedSource


def main():

    words = []

    # key = "document"
    src = 'en'
    dest = 'fa'
    key = "bags"

    translator = Translator()

    result = translator.translate(key, src=src, dest=dest)

    if not result:
        return

    words.append(Word(key, result.text, src, dest, "google"))
    print(result.text)

    if result.extra_data.get('parsed')[3][5]:
        suggestions = result.extra_data.get('parsed')[3][5][0][0][1]
        print(result.extra_data.get('parsed')[3][5][0][0][1])

        for suggest in suggestions:
            words.append(Word(key, suggest[0], src, dest, "google"))


    print(words)
    print(words)


if __name__ == "__main__":
    main()
