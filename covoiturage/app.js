// ==========================
// INSCRIPTION
// ==========================
const formInscription = document.getElementById("formInscription");
if (formInscription) {
    formInscription.addEventListener("submit", function(e){
        e.preventDefault();
        const nom = document.getElementById("nom").value.trim();
        const telephone = document.getElementById("telephone").value.trim();
        const motdepasse = document.getElementById("motdepasse").value;

        let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
        if(utilisateurs.find(u=>u.telephone===telephone)){
            alert("Numéro déjà utilisé");
            return;
        }
        utilisateurs.push({nom, telephone, motdepasse});
        localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
        alert("Compte créé");
        window.location.href="connexion.html";
    });
}

// ==========================
// CONNEXION
// ==========================
const formConnexion = document.getElementById("formConnexion");
if(formConnexion){
    formConnexion.addEventListener("submit", function(e){
        e.preventDefault();
        const tel = document.getElementById("loginTel").value.trim();
        const pass = document.getElementById("loginPass").value;
        let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
        const user = utilisateurs.find(u=>u.telephone===tel && u.motdepasse===pass);
        if(!user){ alert("Identifiants incorrects"); return; }
        localStorage.setItem("utilisateurConnecte", JSON.stringify(user));
        alert("Connexion réussie !");
        window.location.href="publier-trajet.html";
    });
}

// ==========================
// UTILISATEUR CONNECTE
// ==========================
const utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateurConnecte"));
const alerteDiv = document.getElementById("alerteConnexion");
if(!utilisateurConnecte && alerteDiv){
    alerteDiv.textContent="⚠ Vous devez être connecté pour publier un trajet.";
    const formTrajet = document.getElementById("formTrajet");
    if(formTrajet) formTrajet.style.display="none";
}

// ==========================
// PUBLIER TRAJET
// ==========================
const formTrajet = document.getElementById("formTrajet");
if(formTrajet && utilisateurConnecte){
    formTrajet.addEventListener("submit", function(e){
        e.preventDefault();
        const depart = document.getElementById("depart").value.trim();
        const arrivee = document.getElementById("arrivee").value.trim();
        const date = document.getElementById("date").value;
        const prix = document.getElementById("prix").value;
        const trajet = {depart, arrivee, date, prix, auteur: utilisateurConnecte.nom, telephone: utilisateurConnecte.telephone};
        let trajets = JSON.parse(localStorage.getItem("trajets")) || [];
        trajets.push(trajet);
        localStorage.setItem("trajets", JSON.stringify(trajets));
        alert("Trajet publié !");
        formTrajet.reset();
        afficherMesTrajets();
    });
}

// ==========================
// AFFICHER MES TRAJETS
// ==========================
function afficherMesTrajets(){
    const mesTrajetsDiv = document.getElementById("mesTrajets");
    if(!mesTrajetsDiv) return;
    const trajets = JSON.parse(localStorage.getItem("trajets")) || [];
    mesTrajetsDiv.innerHTML="";
    trajets.forEach(t=>{
        if(utilisateurConnecte && t.telephone===utilisateurConnecte.telephone){
            const div=document.createElement("div");
            div.className="trajet";
            div.innerHTML=`<strong>${t.depart} → ${t.arrivee}</strong><br>
                            📅 Date: ${t.date}<br>
                            💰 Prix: ${t.prix} FCFA<br>
                            Auteur: ${t.auteur}<br>
                            <a href="https://wa.me/${t.telephone}" target="_blank">📱 WhatsApp</a>`;
            mesTrajetsDiv.appendChild(div);
        }
    });
}

// ==========================
// RECHERCHE TRAJET
// ==========================
function rechercherTrajet(){
    const searchInput=document.getElementById("searchDepart");
    const resultats=document.getElementById("resultats");
    const recherche=searchInput.value.trim().toLowerCase();
    resultats.innerHTML="";
    const trajets=JSON.parse(localStorage.getItem("trajets"))||[];
    if(trajets.length===0){ resultats.innerHTML="<p>Aucun trajet enregistré.</p>"; return;}
    let trouve=false;
    trajets.forEach(t=>{
        if(recherche==="" || t.depart.toLowerCase().includes(recherche)){
            trouve=true;
            const div=document.createElement("div");
            div.className="trajet";
            div.innerHTML=`<strong>${t.depart} → ${t.arrivee}</strong><br>
                           📅 Date: ${t.date}<br>
                           💰 Prix: ${t.prix} FCFA<br>
                           Auteur: ${t.auteur}<br>
                           <a href="https://wa.me/${t.telephone}" target="_blank">📱 WhatsApp</a>`;
            resultats.appendChild(div);
            afficherTrajetCarte(t.depart,t.arrivee);
            notifierUtilisateur(`Nouveau trajet trouvé : ${t.depart} → ${t.arrivee}, ${t.prix} FCFA`);
        }
    });
    if(!trouve){ resultats.innerHTML="<p>Aucun trajet trouvé pour cette recherche.</p>"; }
}

// ==========================
// NOTIFICATIONS
// ==========================
if("Notification" in window){
    if(Notification.permission!=="granted") Notification.requestPermission();
}
function notifierUtilisateur(message){
    if(Notification.permission==="granted") new Notification("Covoiturage", {body:message});
}

// ==========================
// GOOGLE MAPS
// ==========================
let map,directionsService,directionsRenderer;
function initMap(){
    map=new google.maps.Map(document.getElementById("map"),{center:{lat:8.6195,lng:0.8248},zoom:6});
    directionsService=new google.maps.DirectionsService();
    directionsRenderer=new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}
function afficherTrajetCarte(depart,arrivee){
    if(!directionsService||!directionsRenderer) return;
    directionsService.route({origin:depart,destination:arrivee,travelMode:google.maps.TravelMode.DRIVING},
    (result,status)=>{
        if(status===google.maps.DirectionsStatus.OK){ directionsRenderer.setDirections(result);}
        else{ alert("Impossible de calculer le trajet : "+status);}
    });
}

// ==========================
// INITIALISATION
// ==========================
document.addEventListener("DOMContentLoaded",()=>{
    if(utilisateurConnecte) afficherMesTrajets();
});
