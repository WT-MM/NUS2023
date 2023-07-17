import glob
import os
from firebase_admin import credentials, initialize_app, storage
# Init firebase with your credentials
cred = credentials.Certificate("firebaseCreds.json")
initialize_app(cred, {'storageBucket': 'thisorthatai.appspot.com'})

bucket = storage.bucket()


for file in glob.glob('images/*.png'):
    file = "images/" + file.split("\\")[1]
    blob = bucket.blob(file)
    blob.upload_from_filename(file)
    print(f'Uploaded file: {file}')
