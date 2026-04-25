const App = {
  state: {
    complaints: [],
    officers: [],
    nextId: 1001
  },

  init() {
    this.state.officers = [
      { id: "O1", name: "Officer Sharma", online: true, load: 0 },
      { id: "O2", name: "Officer Patil", online: true, load: 0 },
      { id: "O3", name: "Officer Gupta", online: false, load: 0 }
    ];

    this.bindEvents();
    this.renderAll();

    console.log("System Initialized");
  },

  assignOfficer() {
    const available = this.state.officers.filter(o => o.online);

    if (available.length === 0) return null;

    // Least workload first
    available.sort((a, b) => a.load - b.load);

    return available[0];
  },

  routeComplaint(complaint) {
    const officer = this.assignOfficer();

    if (officer) {
      complaint.status = "ASSIGNED";
      complaint.officer = officer.id;
      officer.load++;
    }
  },

  createComplaint(data) {
    const complaint = {
      id: "C" + this.state.nextId++,
      name: data.name,
      category: data.category,
      location: data.location,
      description: data.description,
      status: "NEW",
      severity: "medium",
      officer: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.state.complaints.unshift(complaint);

    this.routeComplaint(complaint);

    this.renderAll();
  },

  updateStatus(id) {
    const c = this.state.complaints.find(x => x.id === id);
    if (!c) return;

    if (c.status === "ASSIGNED") {
      c.status = "IN PROGRESS";
    } else if (c.status === "IN PROGRESS") {
      c.status = "RESOLVED";

      // Reduce officer load
      const off = this.state.officers.find(o => o.id === c.officer);
      if (off) off.load = Math.max(0, off.load - 1);
    }

    c.updatedAt = Date.now();

    this.renderAll();
  },

  bindEvents() {
    document.getElementById("submitComplaintBtn")
      .addEventListener("click", () => {

        const name = document.getElementById("citizenName").value.trim();
        const category = document.getElementById("complaintCategory").value;
        const location = document.getElementById("locationInput").value.trim();
        const description = document.getElementById("descriptionInput").value.trim();

        if (!name || !category || !location) {
          alert("Fill all fields");
          return;
        }

        this.createComplaint({ name, category, location, description });

        // reset form
        document.getElementById("citizenName").value = "";
        document.getElementById("locationInput").value = "";
        document.getElementById("descriptionInput").value = "";
      });
  },

  renderComplaints() {
    const container = document.getElementById("complaintsList");

    if (this.state.complaints.length === 0) {
      container.innerHTML = "<p class='empty-text'>No complaints yet</p>";
      return;
    }

    container.innerHTML = this.state.complaints.map(c => `
      <div class="complaint-card" onclick="App.updateStatus('${c.id}')">
        <strong>${c.id}</strong> - ${c.category}<br>
        <small>📍 ${c.location}</small><br>
        <small>👨‍💼 ${c.officer || "Unassigned"}</small><br>
        <span>Status: ${c.status}</span>
      </div>
    `).join("");
  },

  renderOfficers() {
    const container = document.getElementById("officersList");

    container.innerHTML = this.state.officers.map(o => `
      <div class="officer-row">
        ${o.name} (${o.load})
        <span style="color:${o.online ? "green" : "gray"}">
          ${o.online ? "Online" : "Offline"}
        </span>
      </div>
    `).join("");
  },

  renderAll() {
    this.renderComplaints();
    this.renderOfficers();
  }
};

App.init();

