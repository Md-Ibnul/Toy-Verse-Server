const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.Port || 5000;

// middleware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send("Toys store is open....")
});


app.listen(port, () => {
    console.log(`Toys Store is running on port: ${port}`);
})