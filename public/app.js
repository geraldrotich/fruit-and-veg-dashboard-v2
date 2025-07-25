import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAe9jgT1cD0PhRpLGLK8FWmKsK9Lyj8jKs",
  authDomain: "fruit-and-veg-dashboard-v2.firebaseapp.com",
  projectId: "fruit-and-veg-dashboard-v2",
  storageBucket: "fruit-and-veg-dashboard-v2.appspot.com",
  messagingSenderId: "742156994835",
  appId: "1:742156994835:web:2aa617429b65f8717eb2e6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM helpers
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Data arrays
let products = [];
let vendors = [];

// UI functions
function renderProducts(list = products) {
  const container = $("#productList");
  container.innerHTML = "";

  const grouped = groupBy(list, "name");

  Object.entries(grouped).sort().forEach(([name, entries]) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${name}</strong>
      <span class="tag">${entries[0].type}</span>
      <div class="details">
        ${entries.map(p =>
          `<div>
             <strong>Vendor:</strong> ${p.vendor}<br>
             <strong>Unit:</strong> ${p.unit}<br>
             <strong>Price:</strong> ${p.price}
           </div><hr>`).join("")}
      </div>
      <div class="details">
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderVendors() {
  const container = $("#vendorList");
  container.innerHTML = "";
  vendors.sort((a, b) => a.name.localeCompare(b.name)).forEach(v => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${v.name}</strong>
      <div class="details">${getVendorProducts(v.name)}</div>
    `;
    container.appendChild(card);
  });
}

function getVendorProducts(vendorName) {
  const filtered = products.filter(p => p.vendor === vendorName);
  if (!filtered.length) return "No products.";
  return filtered.map(p =>
    `<div>
      <strong>Product:</strong> ${p.name}<br>
      <strong>Unit:</strong> ${p.unit}<br>
      <strong>Price:</strong> ${p.price}
     </div><hr>`).join("");
}

// Event handlers
$("#searchButton").addEventListener("click", () => {
  const term = $("#searchInput").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

$("#toggleProductFormBtn").addEventListener("click", () => {
  $("#productForm").classList.toggle("hidden");
});

$$(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    $("#productsSection").classList.toggle("hidden", target !== "products");
    $("#vendorsSection").classList.toggle("hidden", target !== "vendors");
  });
});

$("#vendorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#vendorName").value.trim();
  if (!name) return;
  await addDoc(collection(db, "vendors"), { name });
  vendors.push({ name });
  renderVendors();
  populateVendorDropdown();
  e.target.reset();
});

$("#productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#productName").value.trim();
  const unit = $("#productUnit").value.trim();
  const price = parseFloat($("#productPrice").value);
  const type = $("#productType").value;
  const vendor = $("#vendorSelect").value;

  if (!name || !unit || !vendor || isNaN(price)) return;

  await addDoc(collection(db, "products"), { name, unit, price, type, vendor });
  products.push({ name, unit, price, type, vendor });
  renderProducts();
  renderVendors();
  e.target.reset();
});

function populateVendorDropdown() {
  const select = $("#vendorSelect");
  select.innerHTML = "";
  vendors.forEach(v => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = v.name;
    select.appendChild(option);
  });
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] ||= []).push(item);
    return acc;
  }, {});
}

// Load from Firestore
async function init() {
  const productSnap = await getDocs(collection(db, "products"));
  productSnap.forEach(doc => products.push(doc.data()));
  const vendorSnap = await getDocs(collection(db, "vendors"));
  vendorSnap.forEach(doc => vendors.push(doc.data()));

  renderProducts();
  renderVendors();
  populateVendorDropdown();
}

init();
