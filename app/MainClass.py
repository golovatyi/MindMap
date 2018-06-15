from flask import Flask, redirect, url_for, request, render_template, make_response, Response, jsonify, send_file
from flask_uploads import UploadSet, configure_uploads, IMAGES
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

import io
import os


from gridfs import GridFS

app = Flask(__name__)
photos = UploadSet('photos', IMAGES)
app.config['UPLOADED_PHOTOS_DEST'] = 'static/img'
configure_uploads(app, photos)



class Mongo():
    has_instance = False
    client = None
    db = None
    fs = None

    def __init__(self):
        if not self.has_instance:
            self.client = MongoClient('localhost', 27017)
            self.db = self.client['mindmap_tree']
            self.has_instance = True
            self.fs = GridFS(self.db)


class MainClass():
    __login = "test"
    __password = "1234"

    admin_template = 'admin.html'

    @app.route('/adminer/<authString>', methods=['GET', 'POST'])
    def main(authString):
        if authString[0:4] == MainClass.__login and authString[4:] == MainClass.__password:
            try:

                client = MongoClient('localhost', 27017)
                db = client['mindmap_tree']
                collection = db['main']
                doc = collection.find({}, {"_id": 0})
                queue = []
                for document in doc:
# пополняем массив строковыми представлениями
                    queue.append(str(document))

                images = db['img'].find()
                img = {}

                for item in images:
                    print(item)
                    img.update({item.get("_id"): item.get("img")})
                return render_template('admin_body.html', queue=queue, img=img)

            except(Exception):
                print('jhjuih')
                return render_template('admin.html')
        else:
            print(authString[0:12] + '\n' + authString[12:])
            return redirect(url_for('MindMap'))




# вызывается из jQuery
@app.route('/save', methods=['POST'])
def save():
    if request.method == 'POST':
        print(type(request.form['item']))
        client = MongoClient('localhost', 27017)

        doc = dict(eval(request.form['item']))
        print(request.form)

        # отправка в mongo
        db = client['mindmap_tree']
        collection = db['main']
        collection.drop()
        collection = db['main']
        key = list(doc.keys())[0]
        doc.update({"_id": key})
        try:
            collection.insert_one(doc)
        except DuplicateKeyError:
            collection.replace_one({"_id": key}, doc)

        return Response("succc")

@app.route('/img', methods=['POST'])
def img():
    if request.method == 'POST' and 'img' in request.files:
        selector = request.form['selector']
        img = request.files['img']


        collection = Mongo().db['img']
        #file = Mongo().fs.put(img)
        file = request.form['image']
        doc = {"_id": selector, "img": file}

        try:
            collection.insert_one(doc)

        except:
            collection.replace_one({"_id": selector}, doc)
        return Response('success')

@app.route('/MindMap')
def MindMap():
    client = MongoClient('localhost', 27017)
    db = client['mindmap_tree']
    collection = db['main']
    doc = collection.find({}, {"_id": 0})
    queue = []

    images = db['img'].find()
    img = {}

    for document in doc:
        # пополняем массив строковыми представлениями
        queue.append(str(document))
        # строковое представение готово
    for item in images:
        print(item)

        #file = Mongo().fs.get(item.get("img"))
        img.update({item.get("_id"):item.get("img")})
        #img.append(file.read())



    return render_template('user.html', queue=queue, img=img)


@app.route('/<string>')
def define_action(string):
    if len(string) < 8:
        return redirect(url_for('MindMap'))
    elif string[:8] == "adminer/":
        return redirect(url_for('main'))
    else:
        return redirect(url_for('MindMap'))


@app.route('/')
def default():
    return redirect(url_for('MindMap'))


@app.route('/delete_image', methods=['POST'])
def delete_image():
    if request.method == 'POST':
        Mongo().db['img'].delete_one({"_id": request.form['data']})
        return Response('success')

@app.route('/delete_skill', methods=['POST'])
def delete_skill():
    if request.method == 'POST':
        Mongo().db['main'].delete_one({'_id': request.form['selector']})
        return Response('success')

if __name__ == '__main__':
    app.run(debug=True)
