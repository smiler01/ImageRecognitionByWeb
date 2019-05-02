#coding: utf-8
import os
from datetime import datetime
import numpy as np
import cv2

from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from flask_cors import CORS
from werkzeug import secure_filename

# 自作関数
from processing import image_processing
from processing import object_recognition

# 初期変数
UPLOAD_DIR = "./images/uploads/"
if not os.path.isdir(UPLOAD_DIR): os.makedirs(UPLOAD_DIR)
ALLOWED_EXTENSIONS = set(["png", "jpg", "PNG", "JPG"])
IMAGE_WIDTH = IMAGE_HEIGHT = 224

app = Flask(__name__)
#CORS(app) # ローカルにajaxでPOSTするために必要？
app.config["UPLOAD_DIR"] = UPLOAD_DIR

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1] in ALLOWED_EXTENSIONS

@app.route("/")
def index(): return render_template("index.html")

@app.route("/send", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        img_file = request.files["img_file"]

        if img_file and allowed_file(img_file.filename): filename = secure_filename(img_file.filename)
        else: return "<p>許可されていない拡張子です</p>"

        img_src = image_processing.read_image_from_bytesIO_and_to_numpy(img_file)
        img_dst = cv2.resize(img_src, (IMAGE_WIDTH, IMAGE_HEIGHT))

        # 画像を保存
        img_url = os.path.join(app.config["UPLOAD_DIR"], str(datetime.now)+"_"+filename)
        cv2.imwrite(img_url, img_dst)

        # 認識
        result = object_recognition.result(img_dst)
        return render_template("index.html", img_url=img_url, result=result)

    else: return redirect(url_for("index"))

@app.route("/images/uploads/<filename>")
def upload_file(filename): return send_from_directory(app.config["UPLOAD_DIR"], filename)

if __name__ == "__main__":
    app.debug = True
    app.run()