import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Theme } from '../server/models/Theme.js';
import { PALETTES } from '../src/lib/palettes.js';

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);

  console.log(`Syncing ${PALETTES.length} palettes to MongoDB Atlas...`);

  // Check which theme is currently active if any
  const existingActive = await Theme.findOne({ isActive: true });
  const activeId = existingActive?.themeId || 'editorial-sage';

  // Upsert all 8 palettes
  for (const p of PALETTES) {
    const isThisActive = p.themeId === activeId || (!existingActive && p.themeId === 'editorial-sage');
    await Theme.findOneAndUpdate(
      { themeId: p.themeId },
      {
        themeId: p.themeId,
        name: p.name,
        mode: p.mode,
        description: p.description,
        raw: p.raw,
        colors: p.colors,
        isPreset: true,
        isActive: isThisActive,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Synced palette: ${p.name} [${p.mode.toUpperCase()}]${isThisActive ? ' (ACTIVE)' : ''}`);
  }

  // Remove legacy preset themes (theme-a, theme-b, theme-c)
  await Theme.deleteMany({ themeId: { $in: ['theme-a', 'theme-b', 'theme-c'] } });

  // Ensure exactly one theme is active (defaulting to editorial-sage)
  const activeCount = await Theme.countDocuments({ isActive: true });
  if (activeCount === 0 || !(await Theme.findOne({ isActive: true }))) {
    await Theme.updateMany({}, { isActive: false });
    await Theme.findOneAndUpdate({ themeId: 'editorial-sage' }, { isActive: true });
  }

  const allThemes = await Theme.find().sort({ name: 1 });
  console.log(`\nSuccessfully verified ${allThemes.length} exact palettes in database:`);
  allThemes.forEach(t => console.log(` - ${t.name} (${t.themeId}): ${t.mode} | Active: ${t.isActive}`));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Failed to sync palettes:', err);
  process.exit(1);
});
