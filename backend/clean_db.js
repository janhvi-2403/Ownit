const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ownit').then(async () => {
  const Credential = mongoose.model('Credential', new mongoose.Schema({ type: String, documentUrl: String }, { strict: false }));
  
  await Credential.deleteMany({}); // Wipe the entire pipeline of dummy data
  
  console.log('MongoDB successfully purged of all mocked Credentials.');
  process.exit(0);
}).catch(console.error);
