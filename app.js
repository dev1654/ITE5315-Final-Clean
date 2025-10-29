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

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Handlebars
app.engine('hbs', engine({
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
        },
        eq: function (a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'hbs');

// Sample data - HARDCODED (guaranteed to work on Vercel)
const airbnbData = [
    {
        "id": "1001254",
        "NAME": "Clean & quiet apt home by the park",
        "host id": "80014485718",
        "host_identity_verified": "unconfirmed",
        "host name": "Madaline",
        "neighbourhood group": "Brooklyn",
        "neighbourhood": "Kensington",
        "lat": "40.64749",
        "long": "-73.97237",
        "country": "United States",
        "country code": "US",
        "instant_bookable": "FALSE",
        "cancellation_policy": "strict",
        "room type": "Private room",
        "Construction year": "2020",
        "price": "$966",
        "service fee": "$193",
        "minimum nights": "10",
        "number of reviews": "9",
        "last review": "10/19/2021",
        "reviews per month": "0.21",
        "review rate number": "4",
        "calculated host listings count": "6",
        "availability 365": "286",
        "house_rules": "Clean up and treat the home the way you'd like your home to be treated. No smoking.",
        "license": "",
        "property_type": "loft",
        "thumbnail": "https://picsum.photos/seed/1001254/400/300",
        "images": [
            "https://picsum.photos/seed/1001254a/600/400",
            "https://picsum.photos/seed/1001254b/600/400",
            "https://picsum.photos/seed/1001254c/600/400"
        ]
    },
    {
        "id": "1001255",
        "NAME": "Bright & Sunny Downtown Apartment",
        "host id": "80014485719",
        "host_identity_verified": "verified",
        "host name": "John Smith",
        "neighbourhood group": "Manhattan",
        "neighbourhood": "SoHo",
        "lat": "40.72349",
        "long": "-74.00237",
        "country": "United States",
        "country code": "US",
        "instant_bookable": "TRUE",
        "cancellation_policy": "flexible",
        "room type": "Entire home/apt",
        "Construction year": "2019",
        "price": "$245",
        "service fee": "$49",
        "minimum nights": "2",
        "number of reviews": "47",
        "last review": "11/15/2021",
        "reviews per month": "3.2",
        "review rate number": "5",
        "calculated host listings count": "2",
        "availability 365": "128",
        "house_rules": "No parties or events. Quiet hours from 10pm to 8am.",
        "license": "12345-ABC",
        "property_type": "apartment",
        "thumbnail": "https://picsum.photos/seed/1001255/400/300",
        "images": [
            "https://picsum.photos/seed/1001255a/600/400",
            "https://picsum.photos/seed/1001255b/600/400"
        ]
    },
    {
        "id": "1001256",
        "NAME": "Cozy Studio Near Central Park",
        "host id": "80014485720",
        "host_identity_verified": "verified",
        "host name": "Sarah Johnson",
        "neighbourhood group": "Manhattan",
        "neighbourhood": "Upper West Side",
        "lat": "40.78549",
        "long": "-73.97237",
        "country": "United States",
        "country code": "US",
        "instant_bookable": "FALSE",
        "cancellation_policy": "moderate",
        "room type": "Private room",
        "Construction year": "2018",
        "price": "$189",
        "service fee": "$38",
        "minimum nights": "3",
        "number of reviews": "23",
        "last review": "12/01/2021",
        "reviews per month": "1.8",
        "review rate number": "4",
        "calculated host listings count": "1",
        "availability 365": "95",
        "house_rules": "No smoking. Pets allowed with prior approval.",
        "license": "",
        "property_type": "studio",
        "thumbnail": "https://picsum.photos/seed/1001256/400/300",
        "images": [
            "https://picsum.photos/seed/1001256a/600/400",
            "https://picsum.photos/seed/1001256b/600/400",
            "https://picsum.photos/seed/1001256c/600/400"
        ]
    }
];

console.log(`✅ Loaded ${airbnbData.length} sample properties`);

// ===== ROUTES =====

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Airbnb Property Explorer' });
});

// View all data route
app.get('/viewData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 100);
    res.render('viewData', {
        title: 'All Airbnb Properties',
        data: dataToShow
    });
});

// Clean data route (remove empty names)
app.get('/viewData/clean', (req, res) => {
    const cleanData = airbnbData.filter(item =>
        item.NAME && item.NAME.trim() !== ''
    );
    res.render('viewData', {
        title: 'Cleaned Airbnb Data',
        data: cleanData
    });
});

// Price range search form
app.get('/viewData/price', (req, res) => {
    res.render('priceSearch', {
        title: 'Search by Price Range'
    });
});

// Price search results
app.post('/viewData/price/results', (req, res) => {
    const minPrice = parseFloat(req.body.minPrice) || 0;
    const maxPrice = parseFloat(req.body.maxPrice) || 1000;

    const results = airbnbData.filter(item => {
        const priceStr = item.price?.toString().replace('$', '').trim();
        const price = parseFloat(priceStr) || 0;
        return price >= minPrice && price <= maxPrice;
    });

    res.render('priceResults', {
        title: 'Price Range Results',
        results: results,
        minPrice: minPrice,
        maxPrice: maxPrice
    });
});

// Assignment 1 routes
app.get('/allData', (req, res) => {
    res.render('allData', {
        title: 'All Data - Assignment 1',
        data: airbnbData
    });
});

// Search routes
app.get('/search/propertyLine', (req, res) => {
    res.render('searchForm', {
        title: 'Search Properties'
    });
});

// Search results
app.get('/search/results', (req, res) => {
    const {
        searchType,
        name,
        id,
        neighbourhood,
        property_type,
        allTerms
    } = req.query;

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

// Start server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});

// Export for Vercel
module.exports = app;