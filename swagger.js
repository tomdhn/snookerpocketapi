const swaggerAutogen = require('swagger-autogen')()
//import { port } from '.'

const outputFile = './swagger_output.json'
const endpointsFiles = ['./index.js']
const doc = {
    info: {
        title: "SnookerPocket API with Swagger",
        description: "api description",
    },
    host: `localhost:3001`,
    basePath: "/",
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: "Seizoen"
        }
    ],
    definitions: {
        AddSeizoen: {
            bevriesKlassement: false,
            startdatum: "2024-03-22",
            seizoenBeeindigd: false
        },
        PutSpeeldagvote: {
            user: "ABC123",
            jokerGebruikt: false,
            SchifingsvraagAntwoord: 12,
            WedstrijdVotes: [
                {
                    wedstrijd: "1AB",
                    vote: "1"
                }
            ]
        }
    }
}

swaggerAutogen(outputFile, endpointsFiles, doc)