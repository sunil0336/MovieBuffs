// utils/generateOTP.js
module.exports = () => Math.floor(100000 + Math.random() * 900000).toString();
