#coding: utf-8
from datetime import datetime
import cv2
import re
import base64
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
#from model import predict

app = Flask(__name__)
CORS(app) # ローカルにajaxでPOSTするために必要？

@app.route('/', methods=['GET', 'POST'])
def index():
    print(request.method)
    if request.method == "POST":
        ans = recognition(request)
        #print(request)
        #print(request.form['img'])
        # returnを返さないと500エラーおきる！！
        # https://stackoverflow.com/questions/25034123/flask-value-error-view-function-did-not-return-a-response
        return jsonify({'ans': "ans"})
    else:
        return render_template('index.html')

def recognition(req):
    print(req.form)
    img_str = re.search(r'base64,(.*)', req.form['img']).group(1)
    img_npa = np.fromstring(base64.b64decode(img_str), np.uint8)
    #img_str = base64.urlsafe_b64decode((img_str + '=' * ((4-len(img_str) % 4)%4)).encode("utf-8"))
    #img_str += "=" * ((4 - len(img_str) % 4) % 4)
    #img_str = img_str.encode("utf-8")
    #img_str = base64.b64decode(img_str)
    #img_str = img_str.encode("utf-8")
    #img_str = re.sub(rb'[^a-zA-Z0-9%s]+' % b'+/', b'', img_str)
    #missing_padding = len(img_str) % 4
    #if missing_padding: img_str += b"=" * (4 - missing_padding)
    #img_bin = base64.b64decode(img_str)
    #img_bin = np.frombuffer(img_bin, dtype=np.uint8)
    #img_npa = cv2.imdecode(img_bin, cv2.IMREAD_COLOR)
    #img_npa = np.fromstring(img_str, np.uint8)
    #img_src = cv2.imdecode(img_npa, cv2.IMREAD_COLOR)
    #img_gry = cv2.cvtColor(img_src, cv2.COLOR_BGR2GRAY)
    img_npa = cv2.resize(img_npa, (28, 28))
    cv2.imshow("img", img_npa)
    cv2.waitKey(0)
    return None

if __name__ == "__main__":
    app.debug = True
    app.run()