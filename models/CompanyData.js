const mongoose = require('mongoose');

const CompanyDataSchema = new mongoose.Schema({
  marketingEarningPercentage: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('CompanyData', CompanyDataSchema);
