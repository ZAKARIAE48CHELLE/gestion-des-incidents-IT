const apiBase = "/api/affectations";

const state = {
    affectations: []
};

const allowedTransitions = {
    EN_ATTENTE: ["EN_COURS"],
    EN_COURS: ["BLOQUE", "RESOLU"],
    BLOQUE: ["EN_COURS"],
    RESOLU: ["CLOTURE"],
    CLOTURE: []
};

const statusLabels = {
    EN_ATTENTE: "En attente",
    EN_COURS: "En cours",
    BLOQUE: "Bloque",
    RESOLU: "Resolu",
    CLOTURE: "Cloture"
};

const createForm = document.querySelector("#create-form");
const historyForm = document.querySelector("#history-form");
const historyResults = document.querySelector("#history-results");
const refreshBtn = document.querySelector("#refresh-btn");
const affectationsGrid = document.querySelector("#affectations-grid");
const banner = document.querySelector("#status-banner");
const template = document.querySelector("#affectation-card-template");
const simulationPanel = document.querySelector("#simulation-panel");

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-scroll-target");
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

createForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(createForm);
    const payload = {
        incidentId: toNumber(formData.get("incidentId")),
        technicienId: toNumber(formData.get("technicienId")),
        equipeId: optionalNumber(formData.get("equipeId"))
    };

    try {
        await request(apiBase, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        createForm.reset();
        showBanner("Affectation creee avec succes. Les validations MS1/MS3 ont ete executees.", "success");
        await loadAffectations();
    } catch (error) {
        showBanner(error.message, "error");
    }
});

historyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(historyForm);
    const incidentId = toNumber(formData.get("incidentId"));

    try {
        const items = await request(`${apiBase}/incident/${incidentId}`);
        renderHistory(items, incidentId);
    } catch (error) {
        historyResults.className = "history-results empty-state";
        historyResults.textContent = error.message;
    }
});

refreshBtn.addEventListener("click", () => {
    loadAffectations(true);
});

async function loadSimulationInfo() {
    try {
        const data = await request("/api/simulation");
        if (!data?.enabled) {
            return;
        }

        simulationPanel.classList.remove("hidden");
        setText("#simulation-incidents", joinIds(data.incidentIds));
        setText("#simulation-technicians", joinIds(data.technicianIds));
        renderSimulationEvents(data.recentEvents || []);
    } catch (error) {
        console.warn("Simulation info unavailable", error);
    }
}

async function loadAffectations(isManual = false) {
    if (isManual) {
        showBanner("Actualisation des affectations en cours...", "success");
    }

    try {
        const data = await request(apiBase);
        state.affectations = data;
        renderStats(data);
        renderAffectations(data);
        await loadSimulationInfo();

        if (isManual) {
            showBanner("Tableau synchronise avec MS2.", "success");
        }
    } catch (error) {
        renderAffectations([]);
        renderStats([]);
        showBanner(error.message, "error");
    }
}

function renderStats(data) {
    const byStatus = data.reduce((acc, item) => {
        acc[item.statut] = (acc[item.statut] || 0) + 1;
        return acc;
    }, {});

    setText("#stat-total", data.length);
    setText("#stat-active", byStatus.EN_COURS || 0);
    setText("#stat-blocked", byStatus.BLOQUE || 0);
    setText("#stat-closed", byStatus.CLOTURE || 0);
}

function renderAffectations(data) {
    affectationsGrid.innerHTML = "";

    if (!data.length) {
        affectationsGrid.innerHTML = '<div class="empty-state">Aucune affectation disponible pour le moment.</div>';
        return;
    }

    data
        .slice()
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .forEach((affectation) => {
            const fragment = template.content.cloneNode(true);
            const closureForm = fragment.querySelector(".closure-form");
            const closureNote = fragment.querySelector(".closure-note");

            fragment.querySelector(".card-id").textContent = `Affectation #${affectation.id}`;
            fragment.querySelector(".card-title").textContent = `Incident #${affectation.incidentId}`;
            fragment.querySelector(".technicien").textContent = `#${affectation.technicienId}`;
            fragment.querySelector(".equipe").textContent = affectation.equipeId ? `#${affectation.equipeId}` : "Non renseignee";
            fragment.querySelector(".date-affectation").textContent = formatDate(affectation.dateAffectation);
            fragment.querySelector(".date-fin").textContent = affectation.dateFin ? formatDate(affectation.dateFin) : "Pas encore";

            const statusPill = fragment.querySelector(".status-pill");
            statusPill.textContent = statusLabels[affectation.statut] || affectation.statut;
            statusPill.classList.add(`status-${affectation.statut.toLowerCase()}`);

            const nextList = fragment.querySelector(".next-list");
            const nextStatuses = allowedTransitions[affectation.statut] || [];
            if (nextStatuses.length) {
                nextStatuses.forEach((status) => {
                    const chip = document.createElement("span");
                    chip.className = "next-chip";
                    chip.textContent = statusLabels[status] || status;
                    nextList.appendChild(chip);
                });
            } else {
                const chip = document.createElement("span");
                chip.className = "next-chip none";
                chip.textContent = affectation.statut === "RESOLU" ? "Utiliser la cloture" : "Aucune";
                nextList.appendChild(chip);
            }

            if (affectation.noteCloture) {
                closureNote.classList.remove("hidden");
                closureNote.textContent = `Note de cloture: ${affectation.noteCloture}`;
            }

            const actionRow = fragment.querySelector(".action-row");
            buildActions(actionRow, affectation, closureForm);

            closureForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                const formData = new FormData(closureForm);
                const dateFin = formData.get("dateFin");
                const payload = {
                    noteCloture: formData.get("noteCloture")?.toString().trim() || null,
                    dateFin: dateFin ? localDateTimeInputToApi(dateFin) : null
                };

                try {
                    await request(`${apiBase}/${affectation.id}/cloturer`, {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    });
                    showBanner(`Affectation #${affectation.id} cloturee. Evenement CLOTURE emis vers MS5.`, "success");
                    await loadAffectations();
                } catch (error) {
                    showBanner(error.message, "error");
                }
            });

            fragment.querySelector(".cancel-closure").addEventListener("click", () => {
                closureForm.classList.add("hidden");
            });

            affectationsGrid.appendChild(fragment);
        });
}

function buildActions(container, affectation, closureForm) {
    const transitions = allowedTransitions[affectation.statut] || [];

    transitions.forEach((status) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `action-btn ${buttonTone(status)}`;
        button.textContent = `Passer ${statusLabels[status] || status}`;
        button.addEventListener("click", async () => {
            try {
                await request(`${apiBase}/${affectation.id}/statut`, {
                    method: "PUT",
                    body: JSON.stringify({ statut: status })
                });
                showBanner(`Affectation #${affectation.id} mise a jour vers ${statusLabels[status] || status}.`, "success");
                await loadAffectations();
            } catch (error) {
                showBanner(error.message, "error");
            }
        });
        container.appendChild(button);
    });

    if (affectation.statut === "RESOLU") {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "action-btn priority";
        closeButton.textContent = "Cloturer le dossier";
        closeButton.addEventListener("click", () => {
            closureForm.classList.remove("hidden");
            closureForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        container.appendChild(closeButton);
    }

    const inspectButton = document.createElement("button");
    inspectButton.type = "button";
    inspectButton.className = "action-btn";
    inspectButton.textContent = "Afficher le detail JSON";
    inspectButton.addEventListener("click", () => {
        showBanner(JSON.stringify(affectation, null, 2), "success");
    });
    container.appendChild(inspectButton);
}

function renderHistory(items, incidentId) {
    historyResults.className = "history-results";

    if (!items.length) {
        historyResults.innerHTML = `<div class="empty-state">Aucune affectation trouvee pour l'incident #${incidentId}.</div>`;
        return;
    }

    historyResults.innerHTML = "";
    items
        .slice()
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .forEach((item) => {
            const article = document.createElement("article");
            article.className = "history-item";
            article.innerHTML = `
                <strong>Affectation #${item.id} - ${statusLabels[item.statut] || item.statut}</strong>
                <div>Technicien #${item.technicienId}${item.equipeId ? ` • Equipe #${item.equipeId}` : ""}</div>
                <div>Creee le ${formatDate(item.dateAffectation)}</div>
                <div>${item.dateFin ? `Terminee le ${formatDate(item.dateFin)}` : "Toujours en cours de traitement"}</div>
            `;
            historyResults.appendChild(article);
        });
}

function renderSimulationEvents(events) {
    const container = document.querySelector("#simulation-events");
    if (!container) {
        return;
    }

    if (!events.length) {
        container.className = "event-list empty-state";
        container.textContent = "Aucun evenement pour le moment.";
        return;
    }

    container.className = "event-list";
    container.innerHTML = "";
    events.forEach((event) => {
        const item = document.createElement("div");
        item.className = "event-item";
        item.textContent = `${event.type} • Incident #${event.incidentId} • Acteur #${event.acteurId}${event.statut ? ` • ${event.statut}` : ""}`;
        container.appendChild(item);
    });
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        let message = `Erreur ${response.status}`;
        try {
            const data = await response.json();
            message = data.message || message;
        } catch (error) {
            const text = await response.text();
            if (text) {
                message = text;
            }
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function showBanner(message, tone) {
    banner.hidden = false;
    banner.className = `status-banner ${tone}`;
    banner.textContent = message;
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function formatDate(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function optionalNumber(value) {
    return value ? Number(value) : null;
}

function toNumber(value) {
    return Number(value);
}

function buttonTone(status) {
    switch (status) {
        case "EN_COURS":
            return "priority";
        case "BLOQUE":
            return "warn";
        case "RESOLU":
            return "success";
        default:
            return "";
    }
}

function localDateTimeInputToApi(value) {
    return `${value}:00`;
}

function joinIds(ids = []) {
    return ids.length ? ids.map((id) => `#${id}`).join(", ") : "Aucun ID configure";
}

loadAffectations();
