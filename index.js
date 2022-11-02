const cheerio = require('cheerio');
const cron = require('node-cron');
const express = require('express');
const getAxios = require('./getAxios')();

const app = express();
const port = process.env.PORT || 5050
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require('twilio')(accountSid, authToken);

const arrayProducts = [];
const targetProductDescription = process.env.NIKE_JEYSEY_DESCRIPTION;

async function scrapProduct() {
    try {
        console.log('scrap product started...');

        const response = await getAxios.get();

        console.log('scrap product finished...');

        const $ = cheerio.load(response.data);
        const products = $(".ProductCardstyled__ProductCardContainer-sc-1t3m0gl-5");

        products.each(function () {
            description = $(this).find(".Typographystyled__StyledParagraph-sc-1h4c8w0-2").first().text();
            arrayProducts.push(description);
        });

        if (arrayProducts.includes(targetProductDescription)) {
            sendWhatsAppMessage(targetProductDescription + " está disponível carai!!!");
        }
    } catch (error) {
        console.log(error);
    }
}

function sendWhatsAppMessage(message) {
    client.messages
        .create({
            to: 'whatsapp:+5514996689857',
            from: "whatsapp:+14155238886",
            body: message,
        })
        .then((message) => console.log("The message was sent at: " + getBrazilianTime()))
        .catch(err => console.error(err));
}

function getBrazilianTime() {
    let option = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }
    return new Date().toLocaleDateString('pt-br', option);
}

/** Express functions  */
app.get('/', (req, res) => {
    res.send('Bot is running to sent you a message when your jersey is available');

    /** Scheduled task to be run on the server every 5 min. */
    cron.schedule('*/3 * * * *', function () {
        scrapProduct();
    });

    /** Check if the server is still running every 1 hour.*/
    cron.schedule("0 */1 * * *", () => {
        sendWhatsAppMessage('Bot still is running');
        console.log("Bot still is running");
    });

    console.log("cron called");
});

app.listen(port, function (err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on https://localhost:" + port);
});
