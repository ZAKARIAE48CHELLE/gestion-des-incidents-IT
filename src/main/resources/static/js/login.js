const switchButtons = document.querySelectorAll(".switcher-button");
const forms = document.querySelectorAll(".login-form");
const resultCard = document.querySelector(".result-card");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const resultDetails = document.getElementById("resultDetails");

function activateForm(target) {
    switchButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.target === target);
    });

    forms.forEach((form) => {
        form.classList.toggle("is-active", form.dataset.form === target);
    });
}

function renderDetails(entries) {
    resultDetails.innerHTML = "";
    entries.forEach(([label, value]) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value ?? "-";
        resultDetails.append(dt, dd);
    });
}

function setResultState(state, title, message, entries = []) {
    resultCard.classList.remove("is-success", "is-error");
    if (state) {
        resultCard.classList.add(state);
    }
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    renderDetails(entries);
}

switchButtons.forEach((button) => {
    button.addEventListener("click", () => activateForm(button.dataset.target));
});

forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const type = form.dataset.form;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        const endpoint = type === "utilisateur" ? "/api/auth/utilisateur" : "/api/auth/equipe";

        setResultState(null, "Connexion en cours", "Verification des informations...");

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(type === "utilisateur"
                    ? "Utilisateur introuvable. Verifiez l'email saisi."
                    : "Equipe introuvable. Verifiez le nom saisi.");
            }

            const data = await response.json();
            if (type === "utilisateur") {
                setResultState(
                    "is-success",
                    `Bienvenue ${data.nom}`,
                    "Le profil utilisateur a ete trouve avec succes.",
                    [
                        ["ID", data.id],
                        ["Email", data.email],
                        ["Role", data.role],
                        ["Equipe ID", data.equipeId]
                    ]
                );
                window.setTimeout(() => {
                    window.location.href = `/utilisateur.html?id=${encodeURIComponent(data.id)}`;
                }, 900);
            } else {
                setResultState(
                    "is-success",
                    `Equipe ${data.nom}`,
                    "L'equipe a ete trouvee avec succes.",
                    [
                        ["ID", data.id],
                        ["Responsable", data.responsable],
                        ["Description", data.description]
                    ]
                );
                window.setTimeout(() => {
                    window.location.href = `/equipe.html?id=${encodeURIComponent(data.id)}`;
                }, 900);
            }
        } catch (error) {
            setResultState("is-error", "Connexion refusee", error.message, []);
        }
    });
});
