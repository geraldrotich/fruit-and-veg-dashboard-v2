import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

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

const vendors = [];

document.getElementById("toggleAddProductBtn").onclick = () => {
  const form = document.getElementById("addProductForm");
  const btn = document.getElementById("toggleAddProductBtn");
  const isHidden = form.style.display === "none";
  form.style.display = isHidden ? "block" : "none";
  btn.textContent = isHidden ? "✖ Hide Product Form" : "➕ Add New Product";
};

async function loadVendors() {
  const vendorSelect = document.getElementById("productVendor");
  vendorSelect.innerHTML = "";
  const snapshot = await getDocs(collection(db, "vendorContacts"));
  vendors.length = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name) {
      vendors.push({ id: doc.id, name: data.name });
    }
  });
  vendors.forEach(v => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = v.name;
    vendorSelect.appendChild(option);
  });
}

window.addProduct = async function () {
  const name = document.getElementById("productName").value;
  const unit = document.getElementById("productUnit").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const type = document.getElementById("productType").value;
  const vendor = document.getElementById("productVendor").value;

  if (!name || !unit || isNaN(price) || !vendor) {
    alert("Please fill all fields.");
    return;
  }

  if (!vendors.find(v => v.name === vendor)) {
    alert("Please select a valid vendor.");
    return;
  }

  await addDoc(collection(db, "products"), { name, unit, price, type, vendor });
  alert("Product added successfully.");
};

loadVendors();
