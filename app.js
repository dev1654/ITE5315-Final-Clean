/*******************************
 ***
 * ITE5315 – Assignment 2
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source (including web sites) or distributed to other students.
 *
 * Name: Dev Khilan Patel Student ID: N01708022 Date: 28/10/2025
 *********************************
 **/

const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
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
app.set('views', path.join(__dirname, 'views'));

// Load 2000 records sample
let airbnbData = [];
try {
    airbnbData = require('./airbnb_data.json');
    console.log(`✅ Loaded ${airbnbData.length} records`);
} catch (error) {
    console.error('Error loading data:', error);
    airbnbData = [];
}

// ===== ROUTES =====

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Airbnb Property Explorer' });
});

// View all data (show first 100 records)
app.get('/viewData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 100);
    res.render('viewData', {
        title: 'All Airbnb Properties',
        data: dataToShow
    });
});

// Clean data (remove empty names)
app.get('/viewData/clean', (req, res) => {
    const cleanData = airbnbData.filter(item =>
        item.NAME && item.NAME.trim() !== ''
    ).slice(0, 100);
    res.render('viewData', {
        title: 'Cleaned Data - No Empty Names',
        data: cleanData
    });
});

// Price search form
app.get('/viewData/price', (req, res) => {
    res.render('priceSearch', {
        title: 'Search by Price Range'
    });
});

// Price search results
app.post('/viewData/price/results', (req, res) => {
    const minPrice = parseFloat(req.body.minPrice) || 0;
    const maxPrice = parseFloat(req.body.maxPrice) || 10000;

    const results = airbnbData.filter(item => {
        const priceStr = item.price?.toString().replace('$', '').trim();
        const price = parseFloat(priceStr) || 0;
        return price >= minPrice && price <= maxPrice;
    }).slice(0, 100);

    res.render('priceResults', {
        title: 'Price Range Results',
        results: results,
        minPrice: minPrice,
        maxPrice: maxPrice
    });
});

// Assignment 1 data
app.get('/allData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 50);
    res.render('allData', {
        title: 'Assignment 1 Data',
        data: dataToShow
    });
});

// Search form
app.get('/search/propertyLine', (req, res) => {
    res.render('searchForm', {
        title: 'Search Properties'
    });
});

// Search results
app.get('/search/results', (req, res) => {
    const { searchType, name, id, neighbourhood, property_type, allTerms } = req.query;

    let results = [];
    let searchTerm = '';

    switch (searchType) {
        case 'name':
            searchTerm = name;
            results = airbnbData.filter(item =>
                item.NAME?.toLowerCase().includes((name || '').toLowerCase())
            );
            break;
        case 'id':
            searchTerm = id;
            results = airbnbData.filter(item =>
                item.id?.toString().toLowerCase().includes((id || '').toLowerCase())
            );
            break;
        case 'neighbourhood':
            searchTerm = neighbourhood;
            results = airbnbData.filter(item =>
                item.neighbourhood?.toLowerCase().includes((neighbourhood || '').toLowerCase())
            );
            break;
        case 'property_type':
            searchTerm = property_type;
            results = airbnbData.filter(item =>
                item.property_type?.toLowerCase().includes((property_type || '').toLowerCase())
            );
            break;
        case 'all':
            searchTerm = allTerms;
            results = airbnbData.filter(item =>
                item.NAME?.toLowerCase().includes((allTerms || '').toLowerCase()) ||
                item.id?.toString().toLowerCase().includes((allTerms || '').toLowerCase()) ||
                item.neighbourhood?.toLowerCase().includes((allTerms || '').toLowerCase()) ||
                item.property_type?.toLowerCase().includes((allTerms || '').toLowerCase())
            );
            break;
        default:
            searchTerm = allTerms;
            results = airbnbData.filter(item =>
                item.NAME?.toLowerCase().includes((allTerms || '').toLowerCase()) ||
                item.neighbourhood?.toLowerCase().includes((allTerms || '').toLowerCase())
            );
    }

    results = results.slice(0, 100);

    res.render('searchResults', {
        title: 'Search Results',
        searchType: searchType,
        searchTerm: searchTerm,
        results: results
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Error',
        message: 'Page Not Found'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;