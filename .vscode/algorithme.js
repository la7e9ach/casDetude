
// Importation des modules Firebase
const admin = require("firebase-admin");

// Chemin vers la clé privée de l'application Firebase
const serviceAccount = require("./Desktop/casDetude/pottokdatabase-firebase-adminsdk.json");

// Initialisation de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Référence à la base de données Firestore
const db = admin.firestore();

/*
Algorithme du fonctionnement 
*/
function matching(utilisateur, annonce) {
  // Critère : localisation
  const distance = calculDistance(utilisateur.geopoint, annonce.geopoint);

  // Critère : niveau Galop
  const correspondanceNiveau = utilisateur.niveauGalop >= annonce.niveauMinGalopRequis ? 1 : 0;

  // Critère : Concours
  const correspondanceConcours = utilisateur.participationConcours === annonce.concoursAutorise ? 1 : 0;

  return { distance, correspondanceNiveau, correspondanceConcours };
}

// Fonction de calcul de la distance entre deux geopoints en utilisant la formule de Haversine
function calculDistance(geopoint1, geopoint2) {
  const R = 6371; // Rayon de la Terre en km
  const [lat1, lon1] = geopoint1; // Coordonnées du geopoint1
  const [lat2, lon2] = geopoint2; // Coordonnées du geopoint2

  // Convertir les degrés en radians
  const [radLat1, radLon1, radLat2, radLon2] = [lat1, lon1, lat2, lon2].map(degreesToRadians);

  // Calcul de difference entre les latitudes puis les longitudes
  const deltaLat = radLat1 - radLat2;
  const deltaLon = radLon1 - radLon2;

  // Calcul de la distance 
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

// Conversion des degrés en radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/*
Exemple d'utilisation de la fonction matching
*/

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Entrez votre nom : ', (nom) => {
  rl.question('Entrez votre prénom : ', (prenom) => {
    rl.question('Entrez votre niveau de galop (1 à 7) : ', (niveauGalop) => {
      niveauGalop = parseInt(niveauGalop);
      rl.question('Participez-vous aux concours ? (true/false) : ', (participationConcours) => {
        participationConcours = participationConcours.toLowerCase() === 'true';
        rl.question('Entrez la latitude de votre localisation : ', (latitude) => {
          latitude = parseFloat(latitude);
          rl.question('Entrez la longitude de votre localisation : ', (longitude) => {
            longitude = parseFloat(longitude);

            // Création du dictionnaire contenant les informations de l'utilisateur
            const utilisateur = {
              nom: nom,
              prenom: prenom,
              niveauGalop: niveauGalop,
              participationConcours: participationConcours,
              geopoint: [latitude, longitude]
            };

            // Enregistrement des informations de l'utilisateur dans la base de données Firestore
            db.collection("utilisateurs").add(utilisateur)
              .then(() => {
                console.log("Les informations de l'utilisateur ont été enregistrées avec succès dans la base de données Firestore.");
                rl.close();
              })
              .catch((error) => {
                console.error("Une erreur s'est produite lors de l'enregistrement des informations de l'utilisateur :", error);
                rl.close();
              });

            // Récupération des informations de l'annonce depuis Firestore
            const annonceRef = db.collection("annonce").doc("annonce2");
            annonceRef.get().then((doc) => {
              if (doc.exists) {
                const annonce = doc.data();
                console.log(annonce);
              } else {
                console.log("L'annonce n'existe pas.");
              }
            }).catch((error) => {
              console.error("Erreur lors de la récupération de l'annonce :", error);
            });
          });
        });
      });
    });
  });
});
