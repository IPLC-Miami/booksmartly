const r = require('express').Router();
r.use((_, res) => res.status(501).send('Not implemented – Supabase route'));
module.exports = r;
