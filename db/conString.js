require('dotenv').config()

// CONNECTION STRING FOR ORACLE DB
module.exports = {
  1: {
    user: process.env.PDPECCS_DB_USER,
    password: process.env.PDPECCS_DB_PASS,
    connectionString: process.env.CONTROLS_URL,
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
  2: {
    user: process.env.PURDCS_DB_USER,
    password: process.env.PURDCS_DB_PASS,
    connectionString: process.env.PURDCS_CONTROLS_URL,
    poolMax: 5,
    poolMin: 5,
    poolIncrement: 0,
  },
};
