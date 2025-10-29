const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('✅ ITE5315 Assignment 2 - Basic Test Working!');
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test route working', status: 'success' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;