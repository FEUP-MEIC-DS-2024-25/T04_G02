import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("my-ds-teste-firebase-adminsdk-gr29f-bc523b8a4f.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
