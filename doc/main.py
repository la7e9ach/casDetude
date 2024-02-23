'''
l'integration de la base de donnee depuis firebase
'''
from firebase_functions import https_fn
from firebase_admin import initialize_app
import firebase_admin
from firebase_admin import credentials, firestore

# Initialisation de Firebase
cred = credentials.Certificate("Desktop\casDetude\pottokdatabase-firebase-adminsdk.json")
firebase_admin.initialize_app(cred)

# Référence à la base de données Firestore
db = firestore.client()


'''
Algorithme du fonctionnement 
'''
from math import *
def matching(utilisateur, annonce):
    # critere : localisation
    distance = calcul_distance(utilisateur["geopoint"], annonce["geopoint"])

    # critere :  niveau Galop
    correspondance_niveau =1 if utilisateur["niveauGalop"] >= annonce["niveauMinGalopRequis"] else 0

    # critere : Concours , si les 2 sont pour concours cest 1, si l'un ne veut pas concours cest 0
    correspondance_concours = 1 if utilisateur["participationConcours"] == annonce["concoursAutorise"] else 0

    return {"distance": distance, "correspondance_niveau": correspondance_niveau, "correspondance_concours": correspondance_concours}

# Fonction de calcul de la distance entre deux geopoints en utilisant la formule de Haversine
def calcul_distance(geopoint1, geopoint2):
    R = 6371                # Rayon de la Terre en km
    lat1, lon1 = geopoint1  # Coordonnées du geopoint1
    lat2, lon2 = geopoint2  # Coordonnées du geopoint2                
    # Convertir les degrés en radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    # Calcul de difference entre les latitudes puis les longitudes
    DeltaLAT = lat1 - lat2    
    DeltaLON = lon1 - lon2   
    # Calcul de la distance 
    a = sin(DeltaLAT / 2)**2 + cos(lat1) * cos(lat2) * sin(DeltaLON / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    d = R*c
    return d


'''
Exemple d'utilisation de la fonction matching
'''
utilisateur_ref = db.collection("utilisateur").document("user1")
annonce_ref = db.collection("annonce").document("annonce2")

utilisateur = utilisateur_ref.get().to_dict()
annonce = annonce_ref.get().to_dict()

print(matching(utilisateur, annonce))



