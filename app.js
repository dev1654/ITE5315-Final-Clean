const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// SIMPLE Handlebars configuration
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', '.hbs');

// Test if partials work
console.log('Views path:', path.join(__dirname, 'views'));
console.log('Partials path:', path.join(__dirname, 'views/partials'));

// Sample data
const airbnbData = [
    {
        "id": "1001254",
        "NAME": "Clean & quiet apt home by the park",
        "neighbourhood": "Kensington",
        "room type": "Private room",
        "price": "$966",
        "review rate number": "4",
        "thumbnail": "https://picsum.photos/200/150"
    }
];

// Test route - NO views
app.get('/test', (req, res) => {
    res.send('✅ Basic Express working!');
});

// Home route - SIMPLE without partials
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

// Simple data route - NO partials
app.get('/data', (req, res) => {
    res.render('viewData', {
        title: 'Properties',
        data: airbnbData
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;