from tkinter import E
from werkzeug import Response
from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import Model, SQLAlchemy
from flask import send_file, send_from_directory
from sqlalchemy import delete
from datetime import datetime
import os
from flask import Flask, render_template, request, redirect, url_for, abort
from werkzeug.utils import secure_filename
import json
from flask_cors import CORS, cross_origin
from googletrans import Translator
import numpy as np


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///translator.db'
db = SQLAlchemy(app)

app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['UPLOAD_EXTENSIONS'] = ['.po', '.json', '.xml']
app.config['UPLOAD_PATH'] = 'uploads'
app.config['DOWNLOAD_PATH'] = 'downloads'
app.config['FILENAME_PATH'] = 'static'


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Task %r>' % self.id


class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(500))
    value = db.Column(db.String(500))
    sourceLang = db.Column(db.String(10))
    targetLang = db.Column(db.String(10))
    suggestedSource = db.Column(db.String(20))
    similarityPercentage = db.Column(db.Integer)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, key, value, sLang, tLang, suggestedSource):
        self.key = key
        self.value = value
        self.sourceLang = sLang
        self.targetLang = tLang
        self.suggestedSource = suggestedSource

    def __repr__(self):
        return '<Word %r>' % self.id


class TranslatedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(500))
    value = db.Column(db.String(500))
    sourceLang = db.Column(db.String(10))
    targetLang = db.Column(db.String(10))
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, key, value, sLang, tLang):
        self.key = key
        self.value = value
        self.sourceLang = sLang
        self.targetLang = tLang

    def __repr__(self):
        return '<TranslatedFile %r>' % self.id


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        task_content = request.form['content']
        new_task = Todo(content=task_content)

        try:
            db.session.add(new_task)
            db.session.commit()
            return redirect('/')
        except:
            return 'There was an issue adding your task'

    else:
        tasks = Todo.query.order_by(Todo.date_created).all()
        return render_template('index.html', tasks=tasks)


@app.route('/delete/<int:id>')
def deleteTask(id):
    task_to_delete = Todo.query.get_or_404(id)

    try:
        db.session.delete(task_to_delete)
        db.session.commit()
        return redirect('/')
    except:
        return 'There was a problem deleting that task'


@app.route('/update/<int:id>', methods=['GET', 'POST'])
def update(id):
    task = Todo.query.get_or_404(id)

    if request.method == 'POST':
        task.content = request.form['content']

        try:
            db.session.commit()
            return redirect('/')
        except:
            return 'There was an issue updating your task'

    else:
        return render_template('update.html', task=task)


@app.route('/api/file/save', methods=['POST'])
def fileSave():
    if request.method == 'POST':
        data = json.loads(request.data)
        words = dict(data).get('words')

        try:
            for word in words:
                # db.engine.execute('')
                file = TranslatedFile.query.filter_by(key=word['key']).first()
                file.value = word['value']
                db.session.commit()
            return Response("file Saved Successfully!", 200)
        except:
            return Response("Can Not Saved File!", 200)

    return Response("Request method not POST", 200)


@app.route('/api/word/saveAll', methods=['POST'])
def saveAll():
    if request.method == 'POST':
        data = json.loads(request.data)
        words = dict(data).get('words')
        new_words = []

        for word in words:
            new_word = Word(key=word['key'], value=word['value'],
                            sLang=word['sourceLang'], tLang=word['targetLang'])
            new_words.append(new_word)

        try:
            for _word in new_words:
                db.session.add(_word)
                db.session.commit()

            return Response("save_words", 200)
        except:
            return 'There was an issue adding your task'
    return Response("error save_words", 200)


@app.route('/api/word/getAll', methods=['GET'])
def getAll():
    headers = {
        'Content-Type': 'application/json'
    }
    body = {
        'error': True,
        'message': "",
        'result': "",
        'data': None
    }
    body = dict(body)

    if request.method == 'GET':
        words = TranslatedFile.query.order_by(TranslatedFile.id).all()
        wordList = []
        for word in words:
            wordList.append({
                "key": word.key,
                "value": word.value,
                "suggestion": [],
                "sourceLang": word.sourceLang,
                "targetLang": word.targetLang,
                "sourceDirection": "",
                "targetDirection": ""
            })

        body['error'] = False
        body['message'] = "Get All Record Word"
        body['result'] = getFileName()
        body['data'] = wordList

        return Response(json.dumps(body), 200, headers)

    return Response(body, 200)


@app.route('/api/word/getEntity', methods=['POST'])
def getWord():
    if request.method == 'POST':
        if request.data:
            data = json.loads(request.data)
            key = dict(data).get('key')

            headers = {
                'Content-Type': 'application/json'
            }
            body = {
                'error': True,
                'message': "",
                'result': "",
                'data': None
            }
            body = dict(body)
            suggestions = getSuggestions(key, "en", "fa")

            try:
                dbWord = TranslatedFile.query.filter_by(key=key).first()
                word = {
                    "key": dbWord.key,
                    "value": dbWord.value,
                    "suggestion": suggestions,
                    "sourceLang": dbWord.sourceLang,
                    "targetLang": dbWord.targetLang
                }

                body['error'] = False
                body['message'] = "Get " + key
                body['result'] = getFileName()
                body['data'] = word

                return Response(json.dumps(body), 200, headers)
            except:
                return Response("Can Not Find Word By Key = " + key, 200)

    return Response(body, 200)


@app.route('/api/test', methods=['GET', 'POST'])
@cross_origin(origin='*')
def test(*args, **kwargs):
    if request.method == 'POST':

        data = json.loads(request.data)
        words = dict(data).get('words')
        words = json.dumps(words)

        headers = {
            'Content-Type': 'application/json'
        }
        # data = request.data
        return Response(words, 200, headers)
    if request.method == 'OPTIONS':
        return Response("OPTIONS", 200, headers)
    if request.method == 'GET':
        return Response("GET", 200, headers)
    return Response("return null", 200, headers)


@app.route('/api/file/upload', methods=['POST'])
def uploadFile():
    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)
    setFileName(filename)
    headers = {
        'Content-Type': 'application/json'
    }
    body = {
        'error': True,
        'message': "",
        'data': None
    }
    body = dict(body)

    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            body['error'] = True
            body['message'] = "The file extension is not correct! It should be (.po, .json, .xml)"
            return Response(json.dumps(body), 200, headers)
        try:
            uploaded_file.save(os.path.join(
                app.config['UPLOAD_PATH'], filename))

            if saveWords():
              body['error'] = False
              body['message'] = filename+" File Saved Successfully!"
              body['data'] = filename
              return Response(json.dumps(body), 200, headers)
        except:
            return Response("file save error", 200, headers)

    body['error'] = True
    body['message'] = "filename is empty!"
    return Response(json.dumps(body), 200, headers)


@app.route('/api/file/download', methods=['GET'])
def downloadFileLink():
    # replaceWords()
    # return redirect("http://localhost:5050/api/file/download/" + getFileName())
    # link = "http://localhost:5050/api/file/download/" + getFileName()
    return Response(getFileName(), 200)


@app.route('/api/file/download/<path:filename>', methods=['GET'])
def downloadFile(filename):
    if filename != "":
        if replaceWords():
            uploads = os.path.join(app.root_path, app.config['DOWNLOAD_PATH'])
            uploads = uploads + "/" + filename
            return send_file(path_or_file=uploads, as_attachment=True)
        else:
            return "error"


def getGoogleSuggestions(key, sourceLang, targetLang):
    words = []
    suggestedSource = "Google"
    translator = Translator()

    result = translator.translate(key, src=sourceLang, dest=targetLang)

    if not result:
        return []

    words.append(Word(key, result.text, sourceLang,
                 targetLang, suggestedSource))

    if indexExists(result.extra_data.get('parsed'), 3):
        if indexExists(result.extra_data.get('parsed')[3], 5):
            if indexNone(result.extra_data.get('parsed')[3], 5):
                return words
            else:
                suggestions = result.extra_data.get('parsed')[3][5][0][0][1]

                for suggest in suggestions:
                    words.append(
                        Word(key, suggest[0], sourceLang, targetLang, suggestedSource))

    return words


def getAppSuggestions(key, sourceLang, targetLang):
    words = []
    suggestedSource = "App"

    for item in range(2):
          words.append(Word(key, "پیشنهاد نرم افزار " + str(item), sourceLang,
                 targetLang, suggestedSource))


    return words


def getDictionarySuggestions(key, sourceLang, targetLang):
    words = []
    suggestedSource = "Dictionary"

    for item in range(2):
          words.append(Word(key, "پیشنهاد لغت نامه" + str(item), sourceLang,
                 targetLang, suggestedSource))

    return words


def getSuggestions(key, sourceLang, targetLang):
    googleSuggestions = np.array(
        getGoogleSuggestions(key, sourceLang, targetLang))
    appSuggestions = np.array(getAppSuggestions(key, sourceLang, targetLang))
    dictionarySuggestions = np.array(
        getDictionarySuggestions(key, sourceLang, targetLang))
    suggestions = np.concatenate(
        (googleSuggestions, appSuggestions, dictionarySuggestions))
    suggestions = list(suggestions)
    words = []

    for suggest in suggestions:
        words.append({
            "key": suggest.key,
            "value": suggest.value,
            "sourceLang": suggest.sourceLang,
            "targetLang": suggest.targetLang,
            "suggestedSource": suggest.suggestedSource
        })

    print(words)
    return words


def deleteTable():
    try:
        db.session.query(TranslatedFile).delete()
        db.session.commit()
        return True
    except:
        return False


def extractWords():
    sourceFile = app.config['UPLOAD_PATH'] + "/" + getFileName()
    words = []

    file = open(sourceFile, 'r', encoding="utf8")
    lines = file.readlines()

    key = ""
    value = ""

    for line in lines:

        word = {
            'key': "",
            'value': "",
            'sourceLang': "en",
            'targetLang': "fa"
        }
        word = dict(word)

        if line.startswith('msgid "'):
            key = line.lstrip('msgid "')
            key = key.rstrip('"\n')

        if key != "":
            if line.startswith('msgstr "'):

                value = line.lstrip('msgstr "')
                value = value.rstrip('"\n')

                word['key'] = key
                word['value'] = value

                words.append(word)

    return words


def saveWords():
    words = extractWords()
    if deleteTable():
        new_words = []
        for word in words:
            # word = dict(word)
            new_word = TranslatedFile(
                key=word['key'], value=word['value'], sLang=word['sourceLang'], tLang=word['targetLang'])
            new_words.append(new_word)

        try:
            db.session.add_all(new_words)
            db.session.commit()
            return True
        except:
            return Response("There was an issue adding your task", 200)

    return None


def loadWords():
    words = TranslatedFile.query.order_by(TranslatedFile.id).all()
    wordList = []
    for word in words:
        wordList.append({
            "key": word.key,
            "value": word.value,
            "suggestion": [],
            "sourceLang": word.sourceLang,
            "targetLang": word.targetLang,
            "sourceDirection": "",
            "targetDirection": ""
        })
    return wordList


def replaceWords():
    words = loadWords()
    fileName = getFileName()
    sourceFile = app.config['UPLOAD_PATH'] + "/" + fileName
    targetFile = app.config['DOWNLOAD_PATH'] + "/" + fileName

    fileS = open(sourceFile, 'r', encoding="utf8")
    fileT = open(targetFile, 'w', encoding="utf8")
    lines = fileS.readlines()

    key = ""
    value = ""

    try:
        for line in lines:
            if line.startswith('msgid "'):
                key = line.lstrip('msgid "')
                key = key.rstrip('"\n')

            if key != "":
                if line.startswith('msgstr "'):

                    value = line.lstrip('msgstr "')
                    value = value.rstrip('"\n')

                    for word in words:
                        if word['key'] == key:
                            line = 'msgstr "' + word['value'] + '"\n'

            fileT.write(line)

        fileS.close()
        fileT.close()

        return True
    except:
        return False


def setFileName(name):
    fileNamePath = app.config['FILENAME_PATH'] + "/filename.txt"
    try:
        file = open(fileNamePath, 'w', encoding="utf8")
        line = name
        file.write(line)
        return True
    except:
        return False


def getFileName():
    fileNamePath = app.config['FILENAME_PATH'] + "/filename.txt"
    try:
        file = open(fileNamePath, 'r', encoding="utf8")
        value = file.readline()
        line = value.rstrip('"\n')
        return line
    except:
        return ""


def indexExists(list, index):
    if 0 <= index < len(list):
        return True
    else:
        return False


def indexNone(list, index):
    if list[index] is None in list:
        return True
    else:
        return False


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5050)
