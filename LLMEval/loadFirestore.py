import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Initialize Firestore
cred = credentials.Certificate("firebaseConfig.json")
firebase_admin.initialize_app(cred)

# Get a reference to the Firestore client
db = firestore.client()

# Function to get data from Firestore
def get_data(collection, document):
    doc_ref = db.collection(collection).document(document)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        print("Document {} does not exist.".format(document))

# Function to set data in Firestore
def set_data(collection, document, data):
    doc_ref = db.collection(collection).document(document)
    doc_ref.set(data)

def exportData(wantedCollection=None):
    # Export all data from Firestore

    dataJson = {}

    # Get all collections
    collections = db.collections()

    # Loop through all collections
    for collection in collections:

        if wantedCollection and collection.id != wantedCollection:
            continue

        # Get all documents in collection
        documents = collection.stream()

        # Loop through all documents in collection
        for document in documents:
            # Get data from document
            data = document.to_dict()
            data['timestamp'] = data['timestamp'].timestamp()
            # Add document data to JSON
            if collection.id not in dataJson:
                dataJson[collection.id] = {}
            dataJson[collection.id][document.id] = data
    return dataJson
    

# Import data to Firestore, data should be a JSON object
def importData(data):
    # Loop through all collections
    for collection in data:
        # Loop through all documents in collection
        for document in data[collection]:
            # Set document data
            set_data(collection, document, data[collection][document])

mm = exportData(wantedCollection="test")

with open("test.json", "w") as f:
    json.dump(mm, f)

