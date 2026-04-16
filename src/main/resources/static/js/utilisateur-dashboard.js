const userName = document.getElementById("userName");
const userIntro = document.getElementById("userIntro");
const userRole = document.getElementById("userRole");
const userTeamBadge = document.getElementById("userTeamBadge");
const userDetails = document.getElementById("userDetails");
const teamSummary = document.getElementById("teamSummary");
const teamLink = document.getElementById("teamLink");

const userId = new URLSearchParams(window.location.search).get("id");

function fillDetails(container, entries) {
    container.innerHTML = "";
    entries.forEach(([label, value]) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value ?? "-";
        container.append(dt, dd);
    });
}

function showUserError(message) {
    userName.textContent = "Utilisateur introuvable";
    userIntro.textContent = message;
    userRole.textContent = "Aucun profil";
    userTeamBadge.textContent = "Aucune equipe";
    fillDetails(userDetails, [["Statut", "Echec du chargement"]]);
}

async function loadUserDashboard() {
    if (!userId) {
        showUserError("Aucun identifiant utilisateur n'a ete fourni dans l'URL.");
        return;
    }

    try {
        const userResponse = await fetch(`/api/utilisateurs/${encodeURIComponent(userId)}`);
        if (!userResponse.ok) {
            throw new Error("Impossible de recuperer le profil utilisateur.");
        }

        const user = await userResponse.json();
        userName.textContent = user.nom;
        userIntro.textContent = `Bienvenue dans votre espace personnel. Votre role actuel est ${user.role}.`;
        userRole.textContent = `Role: ${user.role}`;
        userTeamBadge.textContent = user.equipeId ? `Equipe #${user.equipeId}` : "Sans equipe";

        fillDetails(userDetails, [
            ["ID", user.id],
            ["Nom", user.nom],
            ["Email", user.email],
            ["Role", user.role],
            ["Equipe ID", user.equipeId ?? "-"]
        ]);

        if (!user.equipeId) {
            teamLink.removeAttribute("href");
            teamLink.textContent = "Aucune equipe associee";
            return;
        }

        teamLink.href = `/equipe.html?id=${encodeURIComponent(user.equipeId)}`;
        const teamResponse = await fetch(`/api/equipes/${encodeURIComponent(user.equipeId)}`);
        if (!teamResponse.ok) {
            throw new Error("Le profil utilisateur a ete charge, mais l'equipe associee reste inaccessible.");
        }

        const team = await teamResponse.json();
        teamSummary.innerHTML = `
            <h2>${team.nom}</h2>
            <p><strong>Responsable:</strong> ${team.responsable ?? "-"}</p>
            <p><strong>Description:</strong> ${team.description ?? "Aucune description renseignee."}</p>
        `;
    } catch (error) {
        showUserError(error.message);
    }
}

loadUserDashboard();
