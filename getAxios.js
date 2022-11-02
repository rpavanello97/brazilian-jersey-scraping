const axios = require('axios');
const https = require('https');
const url = process.env.NIKE_PRODUCTS_URL;

let instance;

module.exports = function (context) {
    if (!instance) {
        /** Creating axios instance */
        instance = axios.create({
            baseURL: url,
            timeout: 420000,
            httpsAgent: new https.Agent({ keepAlive: true }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return instance;
}