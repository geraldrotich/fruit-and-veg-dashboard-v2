// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAe9jgT1cD0PhRpLGLK8FWmKsK9Lyj8jKs",
  authDomain: "fruit-and-veg-dashboard-v2.firebaseapp.com",
  projectId: "fruit-and-veg-dashboard-v2",
  storageBucket: "fruit-and-veg-dashboard-v2.firebasestorage.app",
  messagingSenderId: "742156994835",
  appId: "1:742156994835:web:2aa617429b65f8717eb2e6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [];
const vendors = [];

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadVendors();
  loadProducts();
  document.getElementById("addProductForm").addEventListener("submit", handleAddProduct);
  document.getElementById("vendorForm").addEventListener("submit", handleAddVendor);
  document.getElementById("searchButton").addEventListener("click", handleSearch);
});

function initTabs() {
  document.getElementById("productTab").addEventListener("click", () => switchTab("products"));
  document.getElementById("vendorTab").addEventListener("click", () => switchTab("vendors"));
}

function switchTab(tab) {
  document.getElementById("productsSection").style.display = tab === "products" ? "block" : "none";
  document.getElementById("vendorsSection").style.display = tab === "vendors" ? "block" : "none";
  document.getElementById("productTab").classList.toggle("active", tab === "products");
  document.getElementById("vendorTab").classList.toggle("active", tab === "vendors");
}

function handleAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const unit = document.getElementById("productUnit").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const type = document.getElementById("productType").value;
  const vendor = document.getElementById("productVendor").value.trim();

  if (!name || !unit || isNaN(price) || !type || !vendor) return alert("Fill all fields");

  const product = { name, unit, price, type, vendor };
  addDoc(collection(db, "products"), product).then(() => {
    products.push(product);
    renderProducts();
    document.getElementById("addProductForm").reset();
  });
}

function handleAddVendor(e) {
  e.preventDefault();
  const vendorName = document.getElementById("vendorName").value.trim();
  if (!vendorName) return alert("Vendor name required");

  const vendor = { name: vendorName };
  addDoc(collection(db, "vendors"), vendor).then(() => {
    vendors.push(vendor);
    renderVendors();
    document.getElementById("vendorForm").reset();
  });
}

function handleSearch() {
  const term = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
}

async function loadVendors() {
  const snap = await getDocs(collection(db, "vendors"));
  snap.forEach(doc => {
    const data = doc.data();
    if (data.name) vendors.push(data);
  });
  renderVendors();
}

async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  snap.forEach(doc => {
    const data = doc.data();
    if (data.name) products.push(data);
  });
  renderProducts();
}

function renderProducts(filtered = null) {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  const grouped = groupBy(filtered || products, "name");

  Object.keys(grouped).sort().forEach(name => {
    const group = grouped[name];
    const header = document.createElement("div");
    header.className = "card";
    header.innerHTML = `
      ${name}
      <span class="tag ${group[0].type}">${group[0].type}</span>
    `;
    header.addEventListener("click", () => {
      card.classList.toggle("hidden");
    });

    const card = document.createElement("div");
    card.className = "details hidden";
    card.innerHTML = group.map(p => `
      <div><strong>Vendor:</strong> ${p.vendor}</div>
      <div><strong>Unit:</strong> ${p.unit}</div>
      <div><strong>Price:</strong> ${p.price}</div>
      <button class="edit">✏️ Edit</button>
      <button class="delete">🗑 Delete</button>
      <hr>
    `).join("");

    list.appendChild(header);
    list.appendChild(card);
  });
}

function renderVendors() {
  const list = document.getElementById("vendorList");
  list.innerHTML = "";

  vendors.sort((a, b) => a.name.localeCompare(b.name)).forEach(v => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = v.name;
    card.addEventListener("click", () => {
      const vendorProducts = products.filter(p => p.vendor === v.name);
      detail.innerHTML = vendorProducts.map(p => `
        <div><strong>Product:</strong> ${p.name}</div>
        <div><strong>Unit:</strong> ${p.unit}</div>
        <div><strong>Price:</strong> ${p.price}</div><hr>
      `).join("");
      detail.classList.toggle("hidden");
    });

    const detail = document.createElement("div");
    detail.className = "details hidden";
    list.appendChild(card);
    list.appendChild(detail);
  });
}

function groupBy(arr, key) {
  return arr.reduce((acc, obj) => {
    acc[obj[key]] = acc[obj[key]] || [];
    acc[obj[key]].push(obj);
    return acc;
  }, {});
}
