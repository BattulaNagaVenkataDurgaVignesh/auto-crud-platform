// ===== Helper: Hide all main content sections =====
function hideAllSections() {
    const sections = ["loginSection", "modelBuilder", "modelsList", "dashboardSection"];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
  }
  
  // ===== Helper: Highlight active menu item =====
  function setActiveLink(linkId) {
    document.querySelectorAll(".sidebar-menu a").forEach(a => a.classList.remove("active"));
    const link = document.getElementById(linkId);
    if (link) link.classList.add("active");
  }
  
  // ====== Auth & State ======
  let authToken = null;
  let userId = null;
  let userRole = null;
  
  // ====== Elements ======
  const loginBtn = document.getElementById("loginBtn");
  const publishBtn = document.getElementById("publishModelBtn");
  const addFieldBtn = document.getElementById("addFieldBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const modelsContainer = document.getElementById("modelsContainer");
  const recordsContainer = document.getElementById("recordsContainer");
  const userWelcome = document.getElementById("userWelcome");
  const sidebarMenu = document.getElementById("sidebarMenu");
  
  // ====== Sidebar Navigation ======
  document.getElementById("showDashboard").onclick = () => {
    hideAllSections();
    document.getElementById("dashboardSection").classList.remove("hidden");
    setActiveLink("showDashboard");
  };
  
  document.getElementById("showLogin").onclick = () => {
    hideAllSections();
    document.getElementById("loginSection").classList.remove("hidden");
    setActiveLink("showLogin");
  };
  
  document.getElementById("showModels").onclick = () => {
    hideAllSections();
    document.getElementById("modelsList").classList.remove("hidden");
    setActiveLink("showModels");
    loadPublishedModels();
  };
  
  // ====== Toggle Logout Button ======
  function updateLogoutVisibility() {
    logoutBtn.style.display = authToken ? "inline-block" : "none";
  }
  
  // ====== Persist Session to localStorage ======
  function saveSession() {
    localStorage.setItem(
      "autoCrudUser",
      JSON.stringify({ token: authToken, id: userId, role: userRole })
    );
  }
  
  function clearSession() {
    localStorage.removeItem("autoCrudUser");
  }
  
  function restoreSession() {
    const saved = localStorage.getItem("autoCrudUser");
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.token && parsed.id && parsed.role) {
        authToken = parsed.token;
        userId = parsed.id;
        userRole = parsed.role;
        userWelcome.textContent = `${userRole} (${userId})`;
        updateLogoutVisibility();
        addModelBuilderMenu();
        hideAllSections();
        document.getElementById("dashboardSection").classList.remove("hidden");
        setActiveLink("showDashboard");
        updateDashboardStats();
        return true;
      }
    } catch (e) {
      console.error("Session restore failed:", e);
    }
    return false;
  }
  
  // ====== Add Model Builder Menu dynamically ======
  function addModelBuilderMenu() {
    if (!document.getElementById("showModelBuilder")) {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" id="showModelBuilder">Model Builder</a>`;
      sidebarMenu.insertBefore(li, document.getElementById("showModels").parentNode);
  
      document.getElementById("showModelBuilder").onclick = () => {
        hideAllSections();
        document.getElementById("modelBuilder").classList.remove("hidden");
        setActiveLink("showModelBuilder");
      };
    }
  }
  
  // ====== Login ======
  if (loginBtn) {
    loginBtn.onclick = async () => {
      const id = document.getElementById("userId").value.trim();
      const role = document.getElementById("userRole").value.trim();
  
      if (!id || !role) {
        document.getElementById("loginMsg").textContent = "Please enter User ID and Role.";
        return;
      }
  
      // Demo token
      authToken = btoa(JSON.stringify({ id, role }));
      userId = id;
      userRole = role;
  
      document.getElementById("loginMsg").textContent = "Login successful!";
      document.getElementById("loginMsg").style.color = "#16a34a";
  
      // Update UI
      userWelcome.textContent = `${userRole} (${userId})`;
      updateLogoutVisibility();
      addModelBuilderMenu();
      saveSession();
  
      // Show dashboard
      hideAllSections();
      document.getElementById("dashboardSection").classList.remove("hidden");
      setActiveLink("showDashboard");
  
      updateDashboardStats();
    };
  }
  
  // ====== Logout ======
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      authToken = null;
      userId = null;
      userRole = null;
      userWelcome.textContent = "Guest";
      document.getElementById("loginMsg").textContent = "";
  
      // Remove Model Builder menu
      const modelBuilderItem = document.getElementById("showModelBuilder");
      if (modelBuilderItem) modelBuilderItem.parentNode.remove();
  
      // Reset Dashboard Stats to 0
      document.getElementById("totalModels").textContent = "0";
      document.getElementById("totalRecords").textContent = "0";
      document.getElementById("activeUsers").textContent = "0";
  
      // Clear session
      clearSession();
  
      hideAllSections();
      document.getElementById("loginSection").classList.remove("hidden");
      setActiveLink("showLogin");
      updateLogoutVisibility();
    };
  }
  
  // ====== Add Dynamic Field in Model Builder ======
  if (addFieldBtn) {
    addFieldBtn.onclick = () => {
      const container = document.getElementById("fieldsContainer");
      const fieldDiv = document.createElement("div");
      fieldDiv.classList.add("field-row");
  
      fieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="field-name" />
        <select class="field-type">
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
        </select>
        <button class="removeField btn btn-danger">Remove</button>
      `;
  
      container.appendChild(fieldDiv);
      fieldDiv.querySelector(".removeField").onclick = () => container.removeChild(fieldDiv);
    };
  }
  
  // ====== Publish Model ======
  if (publishBtn) {
    publishBtn.onclick = async () => {
      const modelName = document.getElementById("modelName").value.trim();
      const ownerField = document.getElementById("ownerField").value.trim();
      const rbacJson = document.getElementById("rbacJson").value.trim();
      const fields = Array.from(document.querySelectorAll(".field-row")).map(row => ({
        name: row.querySelector(".field-name").value,
        type: row.querySelector(".field-type").value
      }));
  
      if (!modelName) {
        document.getElementById("publishMsg").textContent = "Model name is required!";
        document.getElementById("publishMsg").style.color = "#dc2626";
        return;
      }
  
      try {
        const res = await fetch("http://localhost:4000/models", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ modelName, ownerField, fields, rbac: JSON.parse(rbacJson) })
        });
  
        const data = await res.json();
        if (data.success) {
          document.getElementById("publishMsg").textContent = `✅ Model "${modelName}" published successfully!`;
          document.getElementById("publishMsg").style.color = "#16a34a";
          loadPublishedModels();
          updateDashboardStats();
        } else {
          document.getElementById("publishMsg").textContent = "Failed to publish model.";
          document.getElementById("publishMsg").style.color = "#dc2626";
        }
      } catch (err) {
        document.getElementById("publishMsg").textContent = "Error publishing model.";
        document.getElementById("publishMsg").style.color = "#dc2626";
        console.error(err);
      }
    };
  }
  
  // ====== Load Published Models ======
  async function loadPublishedModels() {
    try {
      const res = await fetch("http://localhost:4000/models", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
  
      modelsContainer.innerHTML = "";
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          const li = document.createElement("li");
          li.innerHTML = `<button class="btn btn-primary" onclick="openModel('${model}')">${model}</button>`;
          modelsContainer.appendChild(li);
        });
      } else {
        modelsContainer.innerHTML = "<p>No models published yet.</p>";
      }
    } catch (err) {
      modelsContainer.innerHTML = "<p>Error loading models.</p>";
      console.error(err);
    }
  }
  
  // ====== Open a Model ======
  async function openModel(modelName) {
    hideAllSections();
    document.getElementById("modelsList").classList.remove("hidden");
    setActiveLink("showModels");
  
    try {
      const res = await fetch(`http://localhost:4000/api/${modelName}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const records = await res.json();
  
      recordsContainer.innerHTML = `
        <h3>${modelName} Records</h3>
        <table class="table">
          <thead><tr>${Object.keys(records[0] || {}).map(k => `<th>${k}</th>`).join("")}</tr></thead>
          <tbody>${records.map(r => `<tr>${Object.values(r).map(v => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      `;
    } catch (err) {
      recordsContainer.innerHTML = "<p>Failed to load records.</p>";
      console.error(err);
    }
  }
  
  // ====== Dashboard Stats ======
  function updateDashboardStats() {
    document.getElementById("totalModels").textContent = Math.floor(Math.random() * 8 + 2);
    document.getElementById("totalRecords").textContent = Math.floor(Math.random() * 120 + 10);
    document.getElementById("activeUsers").textContent = authToken ? 1 : 0;
  }
  
  // ====== Initialize ======
  hideAllSections();
  updateLogoutVisibility();
  
  // Try restoring session
  if (!restoreSession()) {
    document.getElementById("loginSection").classList.remove("hidden");
    setActiveLink("showLogin");
  }
  