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
const { body, validationResult } = require('express-validator');

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
        },
        // Step 10: Custom helper for empty names
        replaceEmptyName: function(name) {
            if (!name || name.toString().trim() === '') {
                return '<span style="color: red; font-weight: bold;">N/A</span>';
            }
            return name;
        },
        // Helper to highlight empty rows
        highlightEmpty: function(value, options) {
            if (!value || value.toString().trim() === '') {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
}));
app.set('view engine', 'hbs');

// Load sample data (1000 records)
const airbnbData = require('./airbnb_data.json');
console.log(`✅ Loaded ${airbnbData.length} records from sample data`);

// ===== ROUTES =====

// Home route
app.get('/', (req, res) => {
    res.render('index', { title: 'Airbnb Property Explorer' });
});

// Step 8: View all data route
app.get('/viewData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 100);
    res.render('viewData', {
        title: 'All Airbnb Properties',
        data: dataToShow
    });
});

// Step 9: Clean data route (remove empty names)
app.get('/viewData/clean', (req, res) => {
    const cleanData = airbnbData.filter(item =>
        item.NAME && item.NAME.trim() !== ''
    ).slice(0, 100);

    res.render('viewData', {
        title: 'Cleaned Airbnb Data - No Empty Names',
        data: cleanData
    });
});

// Step 10: Data with custom helper applied
app.get('/viewData/helper', (req, res) => {
    const dataToShow = airbnbData.slice(0, 100);
    res.render('viewDataWithHelper', {
        title: 'Data with Custom Helper Applied',
        data: dataToShow
    });
});

// Step 11: Price range search form
app.get('/viewData/price', (req, res) => {
    res.render('priceSearch', {
        title: 'Search by Price Range'
    });
});

// Step 11: Price search results with validation
app.post('/viewData/price/results',
    [
        // Form validation
        body('minPrice')
            .isFloat({ min: 0 })
            .withMessage('Minimum price must be a positive number')
            .trim()
            .escape(),
        body('maxPrice')
            .isFloat({ min: 0 })
            .withMessage('Maximum price must be a positive number')
            .custom((value, { req }) => {
                if (parseFloat(value) < parseFloat(req.body.minPrice)) {
                    throw new Error('Maximum price must be greater than minimum price');
                }
                return true;
            })
            .trim()
            .escape()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('priceSearch', {
                title: 'Search by Price Range',
                errors: errors.array(),
                formData: req.body
            });
        }

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
    }
);

// Assignment 1 routes
app.get('/allData', (req, res) => {
    const dataToShow = airbnbData.slice(0, 50);
    res.render('allData', {
        title: 'All Data - Assignment 1',
        data: dataToShow
    });
});

// Search routes
app.get('/search/propertyLine', (req, res) => {
    res.render('searchForm', {
        title: 'Search Properties'
    });
});

// Search results with basic validation
app.post('/search/results',  // Changed from app.get to app.post
    [
        body('id')
            .if(body('searchType').equals('id'))
            .isNumeric()
            .withMessage('Property ID must be a number')
            .trim()
            .escape()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('searchForm', {
                title: 'Search Properties',
                errors: errors.array(),
                formData: req.body  // Changed from req.query to req.body
            });
        }

        const {
            searchType,
            name,
            id,
            neighbourhood,
            property_type,
            allTerms
        } = req.body;

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
                    item.property_type?.toLowerCase().includes((allTerms || '').toLowerCase()) ||
                    item['room type']?.toLowerCase().includes((allTerms || '').toLowerCase()) ||
                    item['host name']?.toLowerCase().includes((allTerms || '').toLowerCase())
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
    }
);

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