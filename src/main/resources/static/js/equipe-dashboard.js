const teamName = document.getElementById("teamName");
const teamIntro = document.getElementById("teamIntro");
const teamResponsableBadge = document.getElementById("teamResponsableBadge");
const teamMembersBadge = document.getElementById("teamMembersBadge");
const teamDetails = document.getElementById("teamDetails");
const membersList = document.getElementById("membersList");

const teamId = new URLSearchParams(window.location.search).get("id");

function fillTeamDetails(entries) {
    teamDetails.innerHTML = "";
    entries.forEach(([label, value]) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value ?? "-";
        teamDetails.append(dt, dd);
    });
}

function showTeamError(message) {
    teamName.textContent = "Equipe introuvable";
    teamIntro.textContent = message;
    teamResponsableBadge.textContent = "Responsable indisponible";
    teamMembersBadge.textContent = "0 membre";
    fillTeamDetails([["Statut", "Echec du chargement"]]);
    membersList.className = "member-list empty-state";
    membersList.textContent = "Aucune donnee membre disponible.";
}

function renderMembers(members) {
    if (!members.length) {
        membersList.className = "member-list empty-state";
        membersList.textContent = "Cette equipe ne contient encore aucun utilisateur rattache.";
        return;
    }

    membersList.className = "member-list";
    membersList.innerHTML = "";

    members.forEach((member) => {
        const article = document.createElement("article");
        article.className = "member-card";
        article.innerHTML = `
            <h3>${member.nom}</h3>
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>Role:</strong> ${member.role}</p>
        `;
        membersList.append(article);
    });
}

async function loadEquipeDashboard() {
    if (!teamId) {
        showTeamError("Aucun identifiant d'equipe n'a ete fourni dans l'URL.");
        return;
    }

    try {
        const [teamResponse, membersResponse] = await Promise.all([
            fetch(`/api/equipes/${encodeURIComponent(teamId)}`),
            fetch(`/api/utilisateurs/equipe/${encodeURIComponent(teamId)}`)
        ]);

        if (!teamResponse.ok) {
            throw new Error("Impossible de recuperer les informations de l'equipe.");
        }

        if (!membersResponse.ok) {
            throw new Error("Impossible de recuperer la liste des membres.");
        }

        const team = await teamResponse.json();
        const members = await membersResponse.json();

        teamName.textContent = team.nom;
        teamIntro.textContent = team.description || "Aucune description d'equipe n'est encore renseignee.";
        teamResponsableBadge.textContent = `Responsable: ${team.responsable ?? "-"}`;
        teamMembersBadge.textContent = `${members.length} membre${members.length > 1 ? "s" : ""}`;

        fillTeamDetails([
            ["ID", team.id],
            ["Nom", team.nom],
            ["Responsable", team.responsable ?? "-"],
            ["Description", team.description ?? "-"]
        ]);

        renderMembers(members);
    } catch (error) {
        showTeamError(error.message);
    }
}

loadEquipeDashboard();
