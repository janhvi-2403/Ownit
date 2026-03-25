const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ownit').then(async () => {
  const Credential = mongoose.model('Credential', new mongoose.Schema({ type: String, documentUrl: String }, { strict: false }));
  
  const result = await Credential.updateMany(
    { documentUrl: { $regex: '^ipfs://' } },
    { $set: { documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' } }
  );
  
  console.log('Migrated old document URLs: ' + result.modifiedCount);
  process.exit(0);
}).catch(console.error);
