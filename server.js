const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// База даних у пам'яті сервера
let shoesData = [
    { id: 1, manufacturer: 'Nike', color: 'Black/White leather', price: 150, size: 42, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { id: 2, manufacturer: 'Adidas', color: 'Pure White mesh', price: 120, size: 40, image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400' },
    { id: 3, manufacturer: 'Puma', color: 'Red suede', price: 90, size: 43, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400' },
    { id: 4, manufacturer: 'Reebok', color: 'Blue running fabric', price: 110, size: 39, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400' }
];

// --- REST API (CRUD) ---

// READ 
app.get('/api/shoes', (req, res) => {
    let result = [...shoesData];
    
    const { search, sort } = req.query;

    if (search) {
        const searchQuery = search.toLowerCase().replace(/\s+/g, '');
        result = result.filter(shoe => 
            shoe.manufacturer.toLowerCase().replace(/\s+/g, '').includes(searchQuery)
        );
    }
    if (sort === 'desc') {
        result.sort((a, b) => b.price - a.price);
    }

    res.json(result);
});

// CREATE 
app.post('/api/shoes', (req, res) => {
    const newShoe = { id: Date.now(), ...req.body };
    shoesData.push(newShoe);
    res.status(201).json(newShoe);
});

// UPDATE 
app.put('/api/shoes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = shoesData.findIndex(s => s.id === id);
    if (index !== -1) {
        shoesData[index] = { id, ...req.body };
        res.json(shoesData[index]);
    } else {
        res.status(404).send('Not found');
    }
});

// DELETE 
app.delete('/api/shoes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    shoesData = shoesData.filter(s => s.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));