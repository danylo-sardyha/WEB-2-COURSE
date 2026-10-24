const getBrandImage = (brandName) => {
    const brand = brandName.toLowerCase();
    
    if (brand.includes('nike')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'; 
    if (brand.includes('adidas')) return 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400';
    if (brand.includes('puma')) return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400';
    if (brand.includes('reebok')) return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400';
    
    return 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400';
};

const API_URL = 'http://localhost:3000/api/shoes';
let shoesData = []; 
let currentEditId = null;

// Елементи DOM
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

// Навігація
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

// Рендер карток
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

// Завантаження даних із сервера (з параметрами)
const loadData = async () => {
    const query = searchInput.value.trim();
    const isSorted = sortToggle.checked;
    
    const url = new URL(API_URL);
    if (query) url.searchParams.append('search', query);
    if (isSorted) url.searchParams.append('sort', 'desc');

    try {
        const response = await fetch(url);
        shoesData = await response.json(); 
        renderShoes(shoesData);
        totalPriceEl.textContent = "0.0"; 
    } catch (error) {
        console.error("Error loading shoes:", error);
    }
};

// Обробники фільтрів та підрахунку
sortToggle.addEventListener('change', loadData);
searchBtn.addEventListener('click', loadData);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadData();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    loadData();
});

countBtn.addEventListener('click', () => {
    const total = shoesData.reduce((sum, shoe) => sum + parseFloat(shoe.price), 0);
    totalPriceEl.textContent = total.toFixed(2);
});

// Делегування подій для кнопок Edit та Remove
shoesGrid.addEventListener('click', async (e) => {
    const id = parseInt(e.target.getAttribute('data-id'));

    if (e.target.classList.contains('edit-btn')) {
        openEditPage(id);
    }

    if (e.target.classList.contains('remove-btn')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadData(); // Оновлюємо список з сервера після видалення
        } catch (error) {
            console.error("Error deleting shoe:", error);
        }
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

closeError.addEventListener('click', () => errorBanner.classList.add('hidden'));

// Відправка форми створення
shoeForm.addEventListener('submit', async (e) => {
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
        manufacturer,
        color,
        price,
        size: parseInt(size),
        image: getBrandImage(manufacturer)
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newShoe)
        });
        
        shoeForm.reset();
        switchTab(true); 
        loadData(); // Оновлюємо список з сервера
    } catch (error) {
        console.error("Error creating shoe:", error);
    }
});

// Відправка форми редагування
editForm.addEventListener('submit', async (e) => {
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

    const updatedShoe = {
        manufacturer,
        color,
        price,
        size: parseInt(size),
        image: getBrandImage(manufacturer)
    };

    try {
        await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedShoe)
        });

        editForm.reset();
        currentEditId = null;
        switchTab(true); 
        loadData(); // Оновлюємо список з сервера
    } catch (error) {
        console.error("Error updating shoe:", error);
    }
});

// Завантаження даних при запуску сторінки
loadData();