import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage

'''
Wanted structure:
Style
    - "Unstyled"
        - Category
            - "People"
                - Prompt
                    - "1"
                        - Model
                            - "sd1.5"
                                - image1.png
                                - image2.png
Current structure:
[['sd1.5', 'People', '0', 'Unstyled', '0.'], ['sd1.5', 'People', '0', 'Unstyled', '1.'], ['sd1.5', 'People', '0', 'Unstyled', '2.'], ['sd1.5', 'People', '0', 'Unstyled', '3.'], ['sd1.5', 'People', '0', 'Watercolor', '0.'], ['sd1.5', 'People', '0', 'Watercolor', '1.'], ['sd1.5', 'People', '0', 'Watercolor', '2.'], ['sd1.5', 'People', '0', 'Watercolor', '3.']]
'''



cred = credentials.Certificate("firebaseCreds.json")
firebase_admin.initialize_app(cred, {'storageBucket': 'thisorthatai.appspot.com'})


def create_structure(data):
    structured_data = {}

    for item in data:
        model, category, prompt, style, image = item

        # Ensure style exists
        if style not in structured_data:
            structured_data[style] = {}

        # Ensure category exists under style
        if category not in structured_data[style]:
            structured_data[style][category] = {}

        # Ensure prompt exists under category
        if prompt not in structured_data[style][category]:
            structured_data[style][category][prompt] = {}

        # Ensure model exists under prompt
        if model not in structured_data[style][category][prompt]:
            structured_data[style][category][prompt][model] = []

        # Append image to list
        structured_data[style][category][prompt][model].append("_".join(item) + ".png")

    return structured_data


bucket = storage.bucket()
files = [mm.name.split("/")[1][:-4].split("_") for mm in list(bucket.list_blobs())]
files = [mm for mm in files if len(mm) == 5 and type(mm) == list and len(mm[3].split(" ")) == 1]
print(len(files))
with open("imageReference.json", "w") as f:
    f.write(json.dumps(create_structure(files)))


