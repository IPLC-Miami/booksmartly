const express = require('express');
const router = express.Router();

// #################################################################################################
// #
// #   THIS ENTIRE ROUTE FILE IS A LEGACY COMPONENT FROM THE OLD SUPABASE STACK.
// #
// #   IT HAS BEEN TEMPORARILY STUBBED OUT TO ALLOW THE BACKEND TO START.
// #
// #   THE LOGIC HERE NEEDS TO BE RE-IMPLEMENTED USING THE NEW MERN STACK
// #   (MongoDB/Mongoose, Express, React, Node.js) AND THE NEW AUTHENTICATION SYSTEM.
// #
// #################################################################################################

const placeholderResponse = (req, res) => {
  res.status(501).json({
    message: "Not Implemented",
    note: "This endpoint is pending migration from the legacy Supabase architecture.",
  });
};

router.post('/availability', placeholderResponse);
router.get('/availability/:clinicianId', placeholderResponse);
router.get('/slots/:clinicianId', placeholderResponse);
router.post('/book', placeholderResponse);
router.put('/update/:appointmentId', placeholderResponse);


module.exports = router;