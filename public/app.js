import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc
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

let products = [];
let productMap = new Map(); // productId → productData

const $ = id => document.getElementById(id);

// TABS
const productTab = $("productTab");
const vendorTab = $("vendorTab");
const productsSection = $("productsSection");
const vendorsSection = $("vendorsSection");

productTab.onclick = () => {
  productTab.classList.add("active");
  vendorTab.classList.remove("active");
  productsSection.style.display = "block";
  vendorsSection.style.display = "none";
};

vendorTab.onclick = () => {
  vendorTab.classList.add("active");
  productTab.classList.remove("active");
  vendorsSection.style.display = "block";
  productsSection.style.display = "none";
};

// ADD PRODUCT
$("addProductForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("productName").value.trim();
  const unit = $("productUnit").value.trim();
  const price = parseFloat($("productPrice").value);
  const type = $("productType").value;
  const vendor = $("productVendor").value.trim();

  if (!name || !unit || !vendor || isNaN(price)) return alert("All fields required");

  const docRef = await addDoc(collection(db, "products"), { name, unit, price, type, vendor });
  products.push({ id: docRef.id, name, unit, price, type, vendor });
  productMap.set(docRef.id, { name, unit, price, type, vendor });
  $("addProductForm").reset();
  renderProducts();
  renderVendors();
});

// SEARCH
$("searchButton").addEventListener("click", () => {
  const term = $("searchInput").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

// RENDER PRODUCTS
function renderProducts(data = products) {
  const list = $("productList");
  list.innerHTML = "";

  const grouped = groupBy(data, "name");
  const sortedNames = Object.keys(grouped).sort();

  for (const name of sortedNames) {
    const items = grouped[name];
    const container = document.createElement("div");
    container.className = "card clickable";
    container.innerHTML = `
      <strong>${name}</strong>
      <span class="tag ${items[0].type}">${items[0].type}</span>
    `;
    container.onclick = () => {
      card.classList.toggle("hidden");
    };

    const card = document.createElement("div");
    card.className = "details hidden";
    card.innerHTML = items.map(p => `
      <div>
        <div><strong>Vendor:</strong> ${p.vendor}</div>
        <div contenteditable="true" onblur="updateField('${p.id}', 'unit', this.textContent)">Unit: ${p.unit}</div>
        <div contenteditable="true" onblur="updateField('${p.id}', 'price', this.textContent)">Price: ${p.price}</div>
        <button onclick="confirmDelete('${p.id}')">🗑 Delete</button>
      </div><hr>
    `).join("");

    list.appendChild(container);
    list.appendChild(card);
  }
}

// RENDER VENDORS
function renderVendors() {
  const list = $("vendorList");
  list.innerHTML = "";

  const grouped = groupBy(products, "vendor");
  const sortedVendors = Object.keys(grouped).sort();

  sortedVendors.forEach(vendor => {
    const el = document.createElement("div");
    el.className = "card clickable";
    el.innerHTML = `<strong>${vendor}</strong>`;
    el.onclick = () => {
      details.classList.toggle("hidden");
    };

    const details = document.createElement("div");
    details.className = "details hidden";
    details.innerHTML = grouped[vendor].map(p => `
      <div><strong>${p.name}</strong> - ${p.unit} @ ${p.price}</div>
    `).join("<hr>");

    list.appendChild(el);
    list.appendChild(details);
  });
}

// HELPER FUNCTIONS
function groupBy(arr, key) {
  return arr.reduce((acc, obj) => {
    (acc[obj[key]] ||= []).push(obj);
    return acc;
  }, {});
}

window.updateField = async (id, field, value) => {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, { [field]: field === "price" ? parseFloat(value) : value });
};

window.confirmDelete = async id => {
  if (!confirm("Delete this product?")) return;
  await deleteDoc(doc(db, "products", id));
  products = products.filter(p => p.id !== id);
  renderProducts();
  renderVendors();
};

// LOAD PRODUCTS
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const p = { id: docSnap.id, ...data };
    products.push(p);
    productMap.set(p.id, p);
  });
  renderProducts();
  renderVendors();
}

loadProducts();
