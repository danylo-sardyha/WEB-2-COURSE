
const getBrandImage = (brandName) => {
    const brand = brandName.toLowerCase();
    
    if (brand.includes('nike')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'; 
    }
    if (brand.includes('adidas')) {
        return 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400';
    }
    if (brand.includes('puma')) {
        return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400';
    }
    if (brand.includes('reebok')) {
        return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400';
    }
    
    return 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400';
};

const normalizeText = (text) => {
    return text.toLowerCase().replace(/\s+/g, '');
};

// --- Initial Data ---
let shoesData = [
    { id: 1, manufacturer: 'Nike', color: 'Black/White leather', price: 150, size: 42, image: getBrandImage('Nike') },
    { id: 2, manufacturer: 'Adidas', color: 'Pure White mesh', price: 120, size: 40, image: getBrandImage('Adidas') },
    { id: 3, manufacturer: 'Puma', color: 'Red suede', price: 90, size: 43, image: getBrandImage('Puma') },
    { id: 4, manufacturer: 'Reebok', color: 'Blue running fabric', price: 110, size: 39, image: getBrandImage('Reebok') }
];

let currentEditId = null;

// --- Elements ---
const navView = document.getElementById('navView');
const navCreate = document.getElementById('navCreate');
const viewPage = document.getElementById('viewPage');
const createPage = document.getElementById('createPage');
const editPage = document.getElementById('editPage');

const shoesGrid = document.getElementById('shoesGrid');
const sortToggle = document.getElementById('sortToggle');
const countBtn = document.getElementById('countBtn');
const totalPriceEl = document.getElementById('totalPrice');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

const shoeForm = document.getElementById('shoeForm');
const editForm = document.getElementById('editForm');
const errorBanner = document.getElementById('errorBanner');
const closeError = document.getElementById('closeError');

// --- Navigation Logic ---
const switchTab = (showView) => {
    editPage.classList.add('hidden');
    if (showView) {
        navView.classList.add('active');
        navCreate.classList.remove('active');
        viewPage.classList.remove('hidden');
        createPage.classList.add('hidden');
        renderShoes(shoesData); 
    } else {
        navCreate.classList.add('active');
        navView.classList.remove('active');
        createPage.classList.remove('hidden');
        viewPage.classList.add('hidden');
    }
    errorBanner.classList.add('hidden');
};

navView.addEventListener('click', () => switchTab(true));
navCreate.addEventListener('click', () => switchTab(false));

// --- View Page Logic ---
const renderShoes = (data) => {
    shoesGrid.innerHTML = '';
    
    if (data.length === 0) {
        shoesGrid.innerHTML = '<p style="grid-column: 1/-1;">No shoes found.</p>';
        return;
    }

    const cardsHtml = data.map(shoe => `
        <div class="card">
            <img src="${shoe.image}" alt="${shoe.manufacturer}" class="card__img">
            <div class="card__body">
                <h3 class="card__title">${shoe.manufacturer}</h3>
                <p class="card__text">Color: ${shoe.color}. Available in size ${shoe.size}.</p>
                <p class="card__meta">Price: $${shoe.price} | Last updated just now</p>
                <div class="card__actions">
                    <button class="btn btn-info edit-btn" data-id="${shoe.id}">Edit</button>
                    <button class="btn btn-danger remove-btn" data-id="${shoe.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    shoesGrid.insertAdjacentHTML('beforeend', cardsHtml);
};

// Sort (sort)
sortToggle.addEventListener('change', (e) => {
    const isSorted = e.target.checked;
    let dataToRender = [...shoesData];
    if (isSorted) {
        dataToRender.sort((a, b) => b.price - a.price);
    } 
    const query = normalizeText(searchInput.value);
    if (query) {
        dataToRender = dataToRender.filter(shoe => normalizeText(shoe.manufacturer).includes(query));
    }
    renderShoes(dataToRender);
});

// Count (reduce)
countBtn.addEventListener('click', () => {
    const query = normalizeText(searchInput.value);
    const currentData = query ? shoesData.filter(s => normalizeText(s.manufacturer).includes(query)) : shoesData;
    const total = currentData.reduce((sum, shoe) => sum + parseFloat(shoe.price), 0);
    totalPriceEl.textContent = total.toFixed(2);
});

// Search (filter)
const performSearch = () => {
    const query = normalizeText(searchInput.value);
    let filtered = shoesData.filter(shoe => normalizeText(shoe.manufacturer).includes(query));
    if (sortToggle.checked) {
        filtered.sort((a, b) => b.price - a.price);
    }
    renderShoes(filtered);
    totalPriceEl.textContent = "0.0";
};

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    performSearch();
});

// --- Edit & Remove Click Handler (Event Delegation) ---
shoesGrid.addEventListener('click', (e) => {
    const id = parseInt(e.target.getAttribute('data-id'));

    // Обробка натискання на Edit
    if (e.target.classList.contains('edit-btn')) {
        openEditPage(id);
    }

    // Обробка натискання на Remove
    if (e.target.classList.contains('remove-btn')) {
        shoesData = shoesData.filter(shoe => shoe.id !== id);
        
        const query = normalizeText(searchInput.value);
        let currentViewData = query ? shoesData.filter(shoe => normalizeText(shoe.manufacturer).includes(query)) : [...shoesData];
        
        if (sortToggle.checked) {
            currentViewData.sort((a, b) => b.price - a.price);
        }
        
        renderShoes(currentViewData);
        totalPriceEl.textContent = "0.0"; 
    }
});

const openEditPage = (id) => {
    const shoe = shoesData.find(s => s.id === id); 
    if (!shoe) return;
    currentEditId = id; 

    document.getElementById('editManufacturer').value = shoe.manufacturer;
    document.getElementById('editColor').value = shoe.color;
    document.getElementById('editPrice').value = shoe.price;
    document.getElementById('editSize').value = shoe.size;

    viewPage.classList.add('hidden');
    createPage.classList.add('hidden');
    editPage.classList.remove('hidden');
    navView.classList.remove('active');
    navCreate.classList.remove('active');
    errorBanner.classList.add('hidden');
};

// --- Form Submissions ---
closeError.addEventListener('click', () => errorBanner.classList.add('hidden'));

// Create Form Submit
shoeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const manufacturer = document.getElementById('manufacturer').value.trim();
    const color = document.getElementById('color').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const size = document.getElementById('size').value;

    if (!manufacturer || !color || !size || isNaN(price) || price <= 0) {
        errorBanner.classList.remove('hidden');
        return;
    }
    errorBanner.classList.add('hidden');

    const newShoe = {
        id: Date.now(),
        manufacturer,
        color,
        price,
        size: parseInt(size),
        image: getBrandImage(manufacturer)
    };

    shoesData.push(newShoe);
    shoeForm.reset();
    switchTab(true); 
});

// Edit Form Submit
editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const manufacturer = document.getElementById('editManufacturer').value.trim();
    const color = document.getElementById('editColor').value.trim();
    const price = parseFloat(document.getElementById('editPrice').value);
    const size = document.getElementById('editSize').value;

    if (!manufacturer || !color || !size || isNaN(price) || price <= 0) {
        errorBanner.classList.remove('hidden');
        return;
    }
    errorBanner.classList.add('hidden');

    const index = shoesData.findIndex(s => s.id === currentEditId);
    if (index !== -1) {
        shoesData[index] = {
            ...shoesData[index], 
            manufacturer,
            color,
            price,
            size: parseInt(size),
            image: getBrandImage(manufacturer)
        };
    }

    editForm.reset();
    currentEditId = null;
    switchTab(true); 
});

// Initial load
renderShoes(shoesData);