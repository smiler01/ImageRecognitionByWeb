# coding: utf-8
import os
import numpy as np
import keras
from keras.models import load_model
from keras import backend as K
from keras.applications.mobilenetv2 import MobileNetV2, decode_predictions
from keras.applications.mobilenet import MobileNet, decode_predictions
from keras.applications.densenet import DenseNet121, decode_predictions

def result(image):
    K.clear_session()
    #model = MobileNetV2(weights="imagenet", include_top=True)
    #model = MobileNet(weights="imagenet", include_top=True)
    model = DenseNet121(weights="imagenet", include_top=True)
    x = np.expand_dims(image, axis=0)
    x = image.reshape(x.shape[0], 224, 224, 3)
    preds = model.predict(x)
    result = decode_predictions(preds, top=3)[0]
    result_str = ""
    for _, name, score in result: result_str += "{}: {:.2%} ".format(name, score)
    return result_str