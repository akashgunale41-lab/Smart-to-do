// One-time script: Run this to make yourself admin
// Usage: node scripts/makeAdmin.js your@email.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2]; // Pass email as command line argument

if (!email) {
  console.error('❌ Please provide an email: node scripts/makeAdmin.js your@email.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Success! "${user.name}" (${user.email}) is now an ADMIN.`);
    console.log('👉 Log out and log back in to activate admin privileges.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
