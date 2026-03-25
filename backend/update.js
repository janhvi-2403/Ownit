const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ownit').then(async () => {
  const Credential = mongoose.model('Credential', new mongoose.Schema({ type: String, authorityId: mongoose.Schema.Types.ObjectId, status: String }, { strict: false }));
  
  const result = await Credential.updateMany(
    { status: 'PENDING' },
    { $set: { authorityId: new mongoose.Types.ObjectId('69c3c32490cbe09261bf19e2') } }
  );
  
  console.log('Migrated credentials to PES MODERN: ' + result.modifiedCount);
  process.exit(0);
}).catch(console.error);
