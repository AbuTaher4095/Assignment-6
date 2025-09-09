// DOM elements
const categoryList = document.getElementById("categoryList");
const plantList = document.getElementById("plantList");
const messageBox = document.getElementById("messageBox");
const mainTitle = document.getElementById("mainTitle");
const statusBadge = document.getElementById("statusBadge");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalImage = document.getElementById("modalImage");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const closeModal = document.getElementById("closeModal");

let cart = [];
let activeCatId = null;

// -------- utils --------
function getFirst(obj, keys, defaultValue=''){
  for(let k of keys){
    if(obj[k] != null) return obj[k];
  }
  return defaultValue;
}

function getId(o){ 
  return getFirst(o,['id','plantId','_id','plant_id','category_id','cat_id']); 
}

function getName(o){ 
  return getFirst(o,['name','title','plant_name','category','category_name'],'Unknown'); 
}

function getImg(o){ 
  return getFirst(o,['image','img','thumbnail','picture','photo','image_url'],''); 
}

function getPrice(o){ 
  return +getFirst(o,['price','cost','amount','price_bd'],0) || 0; 
}

function firstArr(...args){ 
  return args.find(a => Array.isArray(a)) || []; 
}

// -------- categories --------
function loadCategories() {
  statusBadge.textContent = "Loading...";
  fetch("https://openapi.programming-hero.com/api/categories")
    .then(res => res.json())
    .then(data => {
      statusBadge.textContent = "";
      const categories = firstArr(data.data, data.categories, data.results);
      showCategories(categories);
    })
    .catch(err => {
      statusBadge.textContent = "";
      console.error(err);
    });
}

function showCategories(categories) {
  categoryList.innerHTML = "";
  categories.forEach(cat => {
    const id = getId(cat);
    const name = getName(cat);
    categoryList.innerHTML += `<li class="cursor-pointer p-2 rounded hover:bg-green-100" data-id="${id}">${name}</li>`;
  });

  categoryList.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    const allLi = categoryList.querySelectorAll("li");
    allLi.forEach(l => l.classList.remove("bg-green-200"));
    li.classList.add("bg-green-200");
    loadPlantsByCategory(li.dataset.id, li.innerText);
  });
}

// -------- plants --------
function loadPlants() {
  statusBadge.textContent = "Loading...";
  fetch("https://openapi.programming-hero.com/api/plants")
    .then(res => res.json())
    .then(data => {
      statusBadge.textContent = "";
      const plants = firstArr(data.data, data.plants);
      showPlants(plants, "All Plants");
    })
    .catch(err => {
      statusBadge.textContent = "";
      console.error(err);
    });
}

function loadPlantsByCategory(id, name="Category") {
  statusBadge.textContent = "Loading...";
  fetch(`https://openapi.programming-hero.com/api/category/${id}`)
    .then(res => res.json())
    .then(data => {
      statusBadge.textContent = "";
      const plants = firstArr(data.data, data.plants);
      showPlants(plants, name);
    })
    .catch(err => {
      statusBadge.textContent = "";
      messageBox.innerText = "Something went wrong";
      messageBox.classList.remove("hidden");
    });
}

function showPlants(plants, title) {
  mainTitle.textContent = title;
  plantList.innerHTML = "";
  if (!plants.length) {
    messageBox.innerText = "No plants found";
    messageBox.classList.remove("hidden");
    return;
  }
  messageBox.classList.add("hidden");

  plants.forEach(p => {
    const id = getId(p);
    const name = getName(p);
    const price = getPrice(p);
    const img = getImg(p);
    const desc = getFirst(p, ['description','desc','about'],'No description');

    plantList.innerHTML += `
      <div class="bg-white rounded-lg shadow p-4">
        <img src="${img}" class="w-full h-36 object-cover rounded mb-3">
        <h3 class="text-lg font-semibold text-green-700 cursor-pointer hover:underline"
            data-name="${name}" data-price="${price}" data-img="${img}" data-desc="${desc}">
            ${name}
        </h3>
        <div class="mt-1 mb-3 text-gray-600">৳${price}</div>
        <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full">Add to Cart</button>
      </div>`;
  });
}

// -------- modal + cart --------
plantList.addEventListener("click", (e) => {
  if (e.target.tagName === "H3") {
    const el = e.target;
    modalTitle.textContent = el.dataset.name;
    modalImage.src = el.dataset.img;
    modalDescription.textContent = el.dataset.desc;
    modalPrice.textContent = el.dataset.price;
    modal.classList.remove("hidden");
  }

  if (e.target.tagName === "BUTTON" && e.target.innerText === "Add to Cart") {
    const card = e.target.closest("div");
    const name = card.querySelector("h3").dataset.name;
    const price = +card.querySelector("h3").dataset.price;
    cart.push({name, price});
    renderCart();
  }
});

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", e => { if(e.target === modal) modal.classList.add("hidden"); });

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((it,i) => {
    total += it.price;
    cartItems.innerHTML += `<li class="flex justify-between items-center bg-gray-100 p-2 rounded">
      <span>${it.name}-৳${it.price}</span>
      <button onclick="removeFromCart(${i})" class="text-red-600 font-bold">x</button>
    </li>`;
  });
  cartTotal.textContent = `Total: ৳${total}`;
}

function removeFromCart(i) {
  cart.splice(i,1);
  renderCart();
}

// -------- init --------
loadCategories();
loadPlants();

