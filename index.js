const express = require('express')
const bodyParser = require("body-parser")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const swaggerFile = require('./swagger_output.json')
const cors = require('cors')
const cookieParser = require("cookie-parser");
const app = express();
const mongoose = require('mongoose');

mongoose.set('strictPopulate', false);
const config = require('config');
const port = config.get('server.port');

app.use(
  cors({
    credentials: true,
  })
);

mongoose.connect("mongodb+srv://admin:SnookerPocket123@snookerpocket.95d24mm.mongodb.net/SPdb")
const db = mongoose.connection
db.on("error", (error) => console.error(error))
db.once("open", () => console.log("Connected to DB"))

app.use(cookieParser());

app.use(express.json())

const seizoenenRoute = require('./routes/seizoenen')
app.use('/api/seizoenen', seizoenenRoute)
const speeldagenRoute = require('./routes/speeldagen')
app.use('/api/speeldagen', speeldagenRoute)
const userRoute = require('./routes/users')
app.use('/api/users', userRoute)
const wedstrijdenRoute = require('./routes/wedstrijden')
app.use('/api/wedstrijden', wedstrijdenRoute)
const speeldagVotesRoute = require('./routes/speeldagVotes')
app.use('/api/speeldagVotes', speeldagVotesRoute)
const wedstrijdVotesRoute = require('./routes/wedstrijdVotes')
app.use('/api/wedstrijdVotes', wedstrijdVotesRoute)
const authRoute = require('./routes/auth')
app.use('/api/auth', authRoute)


const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "SnookerPocket API with Swagger",
      version: "0.1.0",
      description:
        "api description",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Vives",
        url: "https://vives.be",
        email: "info@vives.be",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile)
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = port;