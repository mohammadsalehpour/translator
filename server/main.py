from googletrans import Translator
import os

def main():
    sourceFile = "./fa_IR.po"
    targetFile = "./dist/fa_IR.po"

    fileS = open(sourceFile, 'r', encoding="utf8")
    fileT = open(targetFile, 'w', encoding="utf8")
    lines = fileS.readlines()

    translator = Translator()

    key = ""

    for line in lines:
        if  line.startswith('msgid "'):
            key = line.lstrip('msgid "')
            key = key.rstrip('"\n')
            
        if(key != ""):
            if  line.strip() == 'msgstr ""':
                value = get_translation(translator, key)
                line = 'msgstr "' + value + '"\n'
        
        fileT.write(line)

    fileS.close()
    fileT.close()


def get_translation(translator, source):

    result = translator.translate(source, src='en', dest="fa")

    if not result:
        return
        
    print(result.text)
    return result.text



if __name__ == "__main__":
    main()