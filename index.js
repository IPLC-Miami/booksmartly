const path = require('path');
const dotenv = require('dotenv');

// Centralized .env configuration
// This will load the .env file's variables into process.env
// It's configured to not throw an error if the .env file is missing
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Register all Mongoose models before any other modules are loaded
// This prevents MissingSchemaError in Jest/Playwright test environments
require("./models/addon");
require("./models/appointment");
require("./models/client");
require("./models/consentform");
require("./models/employee");
require("./models/myroutine");
require("./models/notification");
require("./models/personalevent");
require("./models/treatment");

const express = require("express");
const compression = require("compression");
const { ApolloServer } = require("apollo-server-express");
const schema = require("./schema/schema");
const pubsub = require("./backend/services/pubsub");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Appointment = require("./models/appointment");
const Client = require("./models/client");
const Employee = require("./models/employee");
const Notification = require("./models/notification");
const createNotificationFunction = require("./schema/mutations/notifications/createNotificationFunction");
const jwt = require("jsonwebtoken");
const createTokens = require("./createTokens");
const createAdminTokens = require("./createAdminTokens");
const passport = require("passport");
const parseUrl = require("parseurl");
const getMainImage = require("./getMainImage");
const cron = require("node-cron");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { ApiError, Environment } = require("square");
const SquareClient = require("square").Client;
const setSecurityHeaders = require("./backend/middleware/securityHeaders");

// Used to normalize phone numbers for use by Twilio
const phone = require("phone");

// Fix Puppeteer memory leak issue
process.setMaxListeners(Infinity);

const app = express();

app.use(setSecurityHeaders);
app.use(cookieParser());

// Compress all responses
app.use(compression());

// Prevent request entity too large errors
app.use(express.json({ limit: "50mb" }));

// Cross-Origin Requests
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_CLIENT_URL
        : "http://localhost:3000",
    credentials: true,
  })
);

const port = process.env.PORT || 4000;

// Allow 200 responses, but not 304 not modified
app.disable("etag");

app.post("/api/customers", (req, res) => {
  res.setHeader(
    "Authorization",
    `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`
  );

  const requestParams = req.body;

  const client = new SquareClient({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  });

  const { customersApi } = client;

  const idempotencyKey = uuidv4();

  const createCustomer = async () => {
    const requestBody = {
      idempotencyKey: idempotencyKey,
      givenName: requestParams.given_name,
      familyName: requestParams.family_name,
      emailAddress: requestParams.email_address,
      phoneNumber: requestParams.phone_number,
    };

    try {
      let { result } = await customersApi.createCustomer(requestBody);
      console.log(
        "API called successfully. Customer created successfully Returned data: " +
          result
      );
      res.send(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Errors: ", error.errors);
        res.send(error.errors);
      } else {
        console.log("Unexpected Error: ", res.send(error));
      }
    }
  };

  createCustomer();
});

app.get("/smsresponse", async (req, res) => {
  const twiml = new MessagingResponse();

  const allApps = await Appointment.find({});
  const clientApps = allApps.filter(
    (appointment) => phone(appointment.client.phoneNumber)[0] === req.query.From
  );

  const upcomingClientApps = clientApps.filter((appointment) => {
    const date = moment(
      appointment.date +
        " " +
        appointment.startTime +
        " " +
        appointment.morningOrEvening,
      "MMMM D, YYYY h:mm A"
    );

    const now = moment();

    // Show upcoming unconfirmed appointments
    return date > now && !appointment.confirmed;
  });

  if (
    req.query.Body === "Y" ||
    req.query.Body === "y" ||
    req.query.Body === "Yes" ||
    req.query.Body === "YES" ||
    req.query.Body === "yes"
  ) {
    upcomingClientApps.forEach(async (item) => {
      let filter = {
        _id: item._id,
      };

      const update = {
        confirmed: true,
      };

      if (!item.confirmed) {
        const appointment = await Appointment.findOneAndUpdate(filter, update, {
          new: true,
        });

        const newNotification = new Notification({
          _id: new mongoose.Types.ObjectId(),
          new: true,
          type: "confirmAppointment",
          date: item.date,
          time: item.startTime + " " + item.morningOrEvening,
          associatedClientFirstName: item.client.firstName,
          associatedClientLastName: item.client.lastName,
          originalAssociatedStaffFirstName: item.esthetician.split(" ")[0],
          originalAssociatedStaffLastName: item.esthetician.split(" ")[1],
          createdByFirstName: item.client.firstName,
          createdByLastName: item.client.lastName,
          createdAt: Date.now(),
        });

        const updateNotifications = (staff) =>
          createNotificationFunction(newNotification, staff);

        (
          await Employee.find({
            employeeRole: "Admin",
            firstName: {
              $ne: item.esthetician.split(" ")[0],
            },
            lastName: { $ne: item.esthetician.split(" ")[1] },
          })
        ).forEach((currentEmployee) => {
          if (currentEmployee) {
            const notificationsObj = updateNotifications(currentEmployee);
            currentEmployee.notifications = notificationsObj.notifications;

            currentEmployee.save();
          }
        });

        const updatedEmployee = await Employee.findOne(
          {
            firstName: item.esthetician.split(" ")[0],
            lastName: item.esthetician.split(" ")[1],
          },
          (err, currentEmployee) => {
            if (currentEmployee) {
              const notificationsObj = updateNotifications(currentEmployee);
              currentEmployee.notifications = notificationsObj.notifications;

              currentEmployee.save();
            }
          }
        );

        updatedEmployee.save();
        appointment.save();
      }
    });

    if (upcomingClientApps.length === 1) {
      twiml.message("Thank you, your appointment has been confirmed!");
    } else if (upcomingClientApps.length > 1) {
      twiml.message("Thank you, your appointments have been confirmed!");
    } else {
      return null;
    }
  } else {
    return null;
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

require("./cronJobs/smsReminder.js");

app.post("/api/customers/card", (req, res) => {
  res.setHeader(
    "Authorization",
    `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`
  );
  const requestParams = req.body;

  const client = new SquareClient({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  });

  const { customersApi } = client;

  const idempotencyKey = uuidv4();

  const customerId = requestParams.customerId;

  const createCard = async () => {
    const requestBody = {
      idempotencyKey: idempotencyKey,
      cardNonce: requestParams.card_nonce,
      billingAddress: requestParams.billing_address,
      cardholderName: requestParams.cardholder_name,
      verificationToken: requestParams.verification_token,
    };

    try {
      let { result } = await customersApi.createCustomerCard(
        customerId,
        requestBody
      );
      console.log(
        "API called successfully. Customer card created successfully. Returned data: " +
          result
      );
      res.send(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Errors: ", error.errors);
        res.send({ error: error.errors });
      } else {
        console.log("Unexpected Error: ", res.send(error));
      }
    }
  };

  createCard();
});

app.post("/api/customers/delete_card", (req, res) => {
  res.setHeader(
    "Authorization",
    `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`
  );
  const requestParams = req.body;

  const client = new SquareClient({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  });

  const { customersApi } = client;

  const customerId = requestParams.customerId;
  const cardId = requestParams.cardId;

  const deleteCard = async () => {
    try {
      let { result } = await customersApi.deleteCustomerCard(
        customerId,
        cardId
      );
      console.log("API called successfully. Returned data: " + result);
      res.send(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Errors: ", error.errors);
        res.send(error.errors);
      } else {
        console.log("Unexpected Error: ", res.send(error));
      }
    }
  };

  deleteCard();
});

app.post("/api/retrieve_customer", (req, res) => {
  res.setHeader(
    "Authorization",
    `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`
  );

  const requestParams = req.body;

  const client = new SquareClient({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  });

  const { customersApi } = client;

  const customerId = requestParams.data.squareCustomerId;

  const getCustomer = async () => {
    try {
      let { result } = await customersApi.retrieveCustomer(customerId);
      console.log("API called successfully. Returned data: " + result);
      res.send(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Errors: ", error.errors);
        res.send(error.errors);
      } else {
        console.log("Unexpected Error: ", res.send(error));
      }
    }
  };

  getCustomer();
});

app.post("/api/delete_customer", (req, res) => {
  res.setHeader(
    "Authorization",
    `Bearer ${process.env.SQUARE_SANDBOX_ACCESS_TOKEN}`
  );
  const requestParams = req.body;

  const client = new SquareClient({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  });

  const { customersApi } = client;

  const customerId = requestParams.data.squareCustomerId;

  const removeCustomer = async () => {
    try {
      let { result } = await customersApi.deleteCustomer(customerId);
      console.log("API called successfully. Returned data: " + result);
      res.send(result);
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Errors: ", error.errors);
        res.send(error.errors);
      } else {
        console.log("Unexpected Error: ", res.send(error));
      }
    }
  };

  removeCustomer();
});

app.use(async (req, res, next) => {
  let requestURL = req.originalUrl;
  let parsedURL = parseUrl(req).pathname;

  let urlArr = requestURL.split("");
  urlArr.splice(0, 1);
  let shortenedURL = urlArr.join("");

  let pathName = req.path.slice(1);

  let closingIndex;

  if (pathName.includes("https://")) {
    let url = pathName.slice(9);
    closingIndex = url.indexOf("/") + 10;
  } else if (pathName.includes("http://")) {
    let url = pathName.slice(8);
    closingIndex = url.indexOf("/") + 9;
  }

  const baseURL = req.path.slice(1, closingIndex);

  if (
    req.path.split("http://").length > 1 ||
    req.path.split("http://").join("").split("https://").length > 1
  ) {
    if (res.statusCode === 200) {
      let mainImage = await getMainImage(parsedURL, shortenedURL, baseURL)
        .then((data) => {
          return data;
        })
        .catch((err) => console.log(err));

      res.status(200).send({
        url: shortenedURL,
        image: mainImage,
      });
    } else {
      app.get(req.url, async (req, res) => {
        if (res.statusCode === 301) {
          let mainImage = await getMainImage(
            parsedURL,
            shortenedURL,
            baseURL
          ).then((data) => {
            return data;
          });

          return res.status(301).send({ url: shortenedURL, image: mainImage });
        } else if (res.statusCode === 302) {
          let mainImage = await getMainImage(
            parsedURL,
            shortenedURL,
            baseURL
          ).then((data) => {
            return data;
          });

          return res.status(302).send({ url: shortenedURL, image: mainImage });
        } else if (res.statusCode === 304) {
          let mainImage = await getMainImage(
            parsedURL,
            shortenedURL,
            baseURL
          ).then((data) => {
            return data;
          });

          return res.status(304).send({ url: shortenedURL, image: mainImage });
        }
      });
    }
    return next();
  }

  return next();
});


const server = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    return {
      req,
      res,
      pubsub,
    };
  },
  playground: process.env.NODE_ENV === "production" ? false : true,
});


// Set guest consent form cookie upon accessing link from appointment email
app.get("/api/:id/consentform", async (req, res) => {
  const accessToken = req.cookies["access-token"];
  const refreshToken = req.cookies["refresh-token"];
  const dummyToken = req.cookies["dummy-token"];

  const client = await Client.findOne({ _id: req.params.id });

  if (client) {
    const generateGuestConsentFormAccessToken = (client) => {
      const token = jwt.sign(
        {
          id: req.params.id,
          auth: true,
        },
        process.env.JWT_SECRET_KEY_ACCESS,
        { expiresIn: "7d" }
      );
      return token;
    };

    const guestConsentFormAccessToken =
      generateGuestConsentFormAccessToken(client);

    if (!accessToken && !refreshToken && !dummyToken) {
      // Set Guest Consent Form Cookie
      res.cookie(
        "guest-consent-form-access-token",
        guestConsentFormAccessToken,
        {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          secure: process.env.NODE_ENV === "production" ? true : false,
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_CLIENT_ROOT
              : "localhost",
        }
      );
    }

    res.redirect(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_CLIENT_URL
          : "http://localhost:3000"
      }/account/clientprofile/consentform/page1`
    );
  }
});


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
      if (err) {
        return next(err);
      }

      let client;

      client = await Client.findOne({ email: user.emails[0].value });

      if (!client) {
        client = await Client.create({
          _id: new mongoose.mongo.ObjectID(),
          email: user.emails[0].value,
          firstName: user.name.givenName,
          lastName: user.name.familyName,
        });
      }

      const generateDummyToken = (client) => {
        const token = jwt.sign(
          {
            id: client._id,
            picture: user.photos[0].value,
            auth: true,
          },
          process.env.JWT_SECRET_KEY_DUMMY,
          { expiresIn: "60d" }
        );
        return token;
      };

      const generateAccessToken = (client) => {
        const token = jwt.sign(
          {
            id: client._id,
            email: client.email,
            phoneNumber: client.phoneNumber,
            firstName: client.firstName,
            lastName: client.lastName,
            tokenCount: client.tokenCount,
          },
          process.env.JWT_SECRET_KEY_ACCESS,
          { expiresIn: "60d" }
        );
        return token;
      };

      const accessToken = generateAccessToken(client);
      const dummyToken = generateDummyToken(client);

      if (client) {
        req.isAuth = true;
        if (client.phoneNumber) {
          res.clearCookie("temporary-google-access-token", {
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });
          res.clearCookie("temporary-google-dummy-token", {
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });

          res.cookie("access-token", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 60,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });

          res.cookie("dummy-token", dummyToken, {
            maxAge: 1000 * 60 * 60 * 24 * 60,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production" ? true : false,
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });
        } else {
          res.cookie("temporary-google-access-token", accessToken, {
            maxAge: 1000 * 60 * 15,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });

          res.cookie("temporary-google-dummy-token", dummyToken, {
            maxAge: 1000 * 60 * 15,
            httpOnly: false,
            secure: process.env.NODE_ENV === "production" ? true : false,
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_CLIENT_ROOT
                : "localhost",
          });
        }

        res.redirect(
          `${
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_CLIENT_URL
              : "http://localhost:3000"
          }/account/clientprofile`
        );
      } else {
        req.isAuth = false;
        res.redirect(
          `${
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_CLIENT_URL
              : "http://localhost:3000"
          }/account/login`
        );
      }
    })(req, res, next);
  });
}

// Import route handlers
const authRoutes = require('./backend/routes/auth');
const squareRoutes = require('./backend/routes/square');

// Use route handlers
app.use('/api/auth', authRoutes);
app.use('/api/square', squareRoutes);

app.get("/", (req, res) => {
  res.send("The Glow Labs server is up and running!");
});

// Connect to MongoDB with Mongoose
mongoose
  .connect(
    process.env.MONGODB_URI || `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@glowlabs-qo7rk.mongodb.net/test?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

// Refresh logged-in client's tokens
app.use(async (req, res, next) => {
  const refreshToken = req.cookies["refresh-token"];
  const logoutCookie = req.cookies.logout;

  const generateDummyToken = (client) => {
    const token = jwt.sign(
      {
        id: client._id,
        auth: true,
      },
      process.env.JWT_SECRET_KEY_DUMMY,
      { expiresIn: "7d" }
    );
    return token;
  };

  if (refreshToken) {
    if (logoutCookie === undefined) {
      const refreshClient = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_KEY_REFRESH
      );

      const client = await Client.findOne({ email: refreshClient.email });

      const tokens = createTokens(client);
      res.clearCookie("access-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
      res.clearCookie("refresh-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
      res.clearCookie("dummy-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      const dummyToken = generateDummyToken(client);
      res.cookie("dummy-token", dummyToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      res.cookie("access-token", tokens.accessToken, {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      res.cookie("refresh-token", tokens.refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
    }
  }
  return next();
});

// Refresh logged-in employee's tokens
app.use(async (req, res, next) => {
  const adminRefreshToken = req.cookies["admin-refresh-token"];
  const logoutCookie = req.cookies.logout;

  const generateAdminDummyToken = (employee) => {
    const token = jwt.sign(
      {
        id: employee._id,
        employeeRole: employee.employeeRole,
        auth: true,
      },
      process.env.JWT_SECRET_KEY_DUMMY,
      { expiresIn: "7d" }
    );
    return token;
  };

  if (adminRefreshToken) {
    if (logoutCookie === undefined) {
      const refreshAdmin = jwt.verify(
        adminRefreshToken,
        process.env.JWT_SECRET_KEY_REFRESH
      );

      const employee = await Employee.findOne({
        email: refreshAdmin.email,
      });

      const tokens = createAdminTokens(employee);
      res.clearCookie("admin-access-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
      res.clearCookie("admin-refresh-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
      res.clearCookie("admin-dummy-token", {
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      const adminDummyToken = generateAdminDummyToken(employee);
      res.cookie("admin-dummy-token", adminDummyToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      res.cookie("admin-access-token", tokens.accessToken, {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });

      res.cookie("admin-refresh-token", tokens.refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_CLIENT_ROOT
            : "localhost",
      });
    }
  }
  return next();
});

const httpServer = http.createServer(app);

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  httpServer.listen(port, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    );
  });
}

startServer();