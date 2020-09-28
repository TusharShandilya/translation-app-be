// const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
}

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      const error = new Error("Not Authenticated");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    decodedToken = await verify(token);

    if (!decodedToken) {
      const error = new Error("Not Authenticated");
      error.statusCode = 401;
      throw error;
    }

    req.decodedToken = decodedToken;
    next();
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.get("Authorization");

//   if (!authHeader) {
//     const error = new Error("Not Authenticated");
//     error.statusCode = 401;
//     throw error;
//   }

//   const token = authHeader.split(" ")[1];
//   let decodedToken;

//   try {
//     decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     err.statusCode = 500;
//     throw err;
//   }

//   if (!decodedToken) {
//     const error = new Error("Not Authenticated");
//     error.statusCode = 401;
//     throw error;
//   }

//   req.userId = decodedToken.userId;
//   next()
// };
