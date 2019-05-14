const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const {dialogflow, Image} = require('actions-on-google');
const prettyMs = require('pretty-ms');
let app = express();
const dialog = dialogflow({
    debug:true
})

let now, depart;

// Middleware

function angers() {

    return new Promise((resolve, reject) => {
        console.log('Requested');

        // Angers Roseraie

        let uri = 'https://data.angers.fr/api/records/1.0/search/?dataset=bus-tram-circulation-passages&lang=fr&rows=300&sort=-arrivee&facet=mnemoligne&facet=nomligne&facet=dest&facet=mnemoarret&facet=nomarret&facet=numarret&facet=fiable&refine.nomarret=PLACE+MOLIERE&refine.mnemoligne=A&refine.nomligne=ARDENNE+%3C%3E+ROSERAIE&refine.numarret=2492&refine.fiable=F&timezone=Europe%2FParis';

        let nextTram = null;
        let nextNextTram = null;

        request(uri, {json:true}, (err, response, body) => {

            if (err)
                reject(err);

            console.log("First");

            now = new Date();

            //console.log(response);
            //console.log(body);

            let tram = body.records;

            for (let i in tram) {
                arrivee = new Date(tram[i].fields.arrivee);

                if (arrivee > now && nextTram === null) {
                    nextTram = arrivee - now;
                } else if (arrivee > now && nextTram !== null) {
                    if (arrivee - nextTram > 120000) {
                        nextNextTram = arrivee - now;
                        break;
                    }
                }
            }

            if (nextTram <= 60 * 1000 * 3) 
                resolve('Le prochain tram vers le centre passe dans ' + (Math.trunc(nextTram / 60000)) + ' minutes et ' + (Math.trunc(nextTram % 60000 / 1000)) + ' secondes, le suivant dans ' + (Math.trunc(nextNextTram / 60000)) + ' minutes.');
            else 
                resolve('Le prochain tram vers le centre passe dans ' + (Math.trunc(nextTram / 60000)) + ' minutes, le suivant dans ' + (Math.trunc(nextNextTram / 60000)) + ' minutes.');

        });

    });

}

function ESEO() {

    return new Promise((resolve, reject) => {
        console.log('Requested');

        // Angers Roseraie

        let uri = 'https://data.angers.fr/api/records/1.0/search/?dataset=bus-tram-circulation-passages&lang=fr&rows=300&sort=-arrivee&facet=mnemoligne&facet=nomligne&facet=dest&facet=mnemoarret&facet=nomarret&facet=numarret&facet=fiable&refine.nomarret=PLACE+MOLIERE&refine.mnemoligne=A&refine.nomligne=ARDENNE+%3C%3E+ROSERAIE&refine.numarret=5543&refine.fiable=F&timezone=Europe%2FParis';

        let nextTram = null;
        let nextNextTram = null;

        request(uri, {json:true}, (err, response, body) => {

            if (err)
                reject(err);

            console.log("First");

            now = new Date();

            //console.log(response);
            //console.log(body);

            let tram = body.records;

            for (let i in tram) {
                arrivee = new Date(tram[i].fields.arrivee);

                if (arrivee > now && nextTram === null) {
                    nextTram = arrivee - now;
                } else if (arrivee > now && nextTram !== null) {
                    if (arrivee - nextTram > 120000) {
                        nextNextTram = arrivee - now;
                        break;
                    }
                }
            }

            if (nextTram <= 60 * 1000 * 3) 
                resolve('Le prochain tram vers l\'ESEO passe dans ' + (Math.trunc(nextTram / 60000)) + ' minutes et ' + (Math.trunc(nextTram % 60000 / 1000)) + ' secondes, le suivant dans ' + (Math.trunc(nextNextTram / 60000)) + ' minutes.');
            else 
                resolve('Le prochain tram vers l\'ESEO passe dans ' + (Math.trunc(nextTram / 60000)) + ' minutes, le suivant dans ' + (Math.trunc(nextNextTram / 60000)) + ' minutes.');

        });

    });

}

dialog.intent('Home', (conv) => {
    conv.ask('Où voulez-vous aller ?');
});

dialog.intent('Centre', (conv) => {
    return angers().then(res => {
        console.log(res);
        conv.close(res);
    });
});

dialog.intent('ESEO', (conv) => {
    return ESEO().then(res => {
        console.log(res);
        conv.close(res);
    });
});


dialog.catch((conv, error) => {
    console.error(error);
    conv.ask('Désolé, une erreur s\'est produite. Pouvez-vous répéter ?');
});

dialog.fallback((conv) => {
    conv.ask('Je n\'ai pas compris... Pouvez-vous répéter ?');
});

express().use(bodyParser.json(), dialog).listen(8001);