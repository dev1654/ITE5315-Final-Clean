/*******************************
 ***
 * ITE5315 – Assignment 2
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source (including web sites) or distributed to other students.
 *
 * Name: Dev Khilan Patel Student ID: N01708022 Date: 28/10/2025
 *
 ********************************
 **/

const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Configure Handlebars
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        formatPrice: function(price) {
            if (!price) return 'N/A';
            return price.toString().replace('$', '').trim();
        },
        formatName: function(name) {
            return name && name.trim() !== '' ? name : 'N/A';
        }
    }
}));
app.set('view engine', '.hbs');

// Load data with error handling
let airbnbData = [];
try {
    // Read file synchronously for Vercel compatibility
    const data = fs.readFileSync(path.join(__dirname, 'airbnb_data.json'), 'utf8');
    airbnbData = JSON.parse(data);
    console.log(`✅ Loaded ${airbnbData.length} records`);
} catch (error) {
    console.error('❌ Error loading data:', error.message);
    // Fallback to minimal data
    airbnbData = [
        {
            "id": "1001254",
            "NAME": "Sample Property 1",
            "neighbourhood": "Kensington",
            "room type": "Private room",
            "price": "$100",
            "review rate number": "4",
            "thumbnail": "https://picsum.photos/200/150"
        },
        {
            "id": "1001255",
            "NAME": "Sample Property 2",
            "neighbourhood": "Manhattan",
            "room type": "Entire home",
            "price": "$200",
            "review rate number": "5",
            "thumbnail": "https://picsum.photos/200/151"
        }
    ];
    console.log('✅ Using fallback sample data');
}

// ===== SIMPLIFIED ROUTES =====

// Test route
app.get('/test', (req, res) => {
    res.send('✅ Server working! Data records: ' + airbnbData.length);
});

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// View data (limited to 50 records)
app.get('/viewData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 50);
    res.render('viewData', {
        title: 'Properties',
        data: dataToShow
    });
});

// Search form
app.get('/search', (req, res) => {
    res.render('searchForm', {
        title: 'Search'
    });
});

// Simple search
app.get('/search/results', (req, res) => {
    const { q } = req.query;
    let results = [];

    if (q) {
        results = airbnbData.filter(item =>
            item.NAME?.toLowerCase().includes(q.toLowerCase()) ||
            item.neighbourhood?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 20);
    }

    res.render('searchResults', {
        title: 'Search Results',
        results: results,
        searchTerm: q
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;