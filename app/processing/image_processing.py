# coding: utf-8
import os
import io
import numpy as np
import cv2

def read_image_from_bytesIO_and_to_numpy(img_file):
    f = img_file.stream.read()
    bin_data = io.BytesIO(f)
    file_bytes = np.asarray(bytearray(bin_data.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    return img
