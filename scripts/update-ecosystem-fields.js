import 'dotenv/config';
import mongoose from 'mongoose';

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection('projects');

  await col.updateMany(
    { slug: { $in: ['devops-engineering-bootcamp', 'devops-practice-labs', 'cloud-infrastructure-iac', 'devops-assignments-challenges'] } },
    { $set: { ecosystem: 'DevOps & Cloud Infrastructure Track' } }
  );

  await col.updateMany(
    { slug: { $in: ['fullstack-applications', 'engineering-hub-pro', 'fullstack-cloud-native-app', '50-javascript-projects'] } },
    { $set: { ecosystem: 'Full-Stack Applications Portfolio' } }
  );

  await col.updateMany(
    { isArchived: { $ne: true } },
    { $set: { isArchived: false } }
  );

  console.log('[UPDATE] Successfully set ecosystem fields and normalized isArchived.');
  await mongoose.disconnect();
}

update().catch(console.error);
