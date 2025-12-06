const params = new URLSearchParams(window.location.search);
const websiteName = params.get("website") || "Unknown";
document.getElementById("website").textContent = websiteName;