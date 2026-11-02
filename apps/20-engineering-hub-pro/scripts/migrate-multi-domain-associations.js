import 'dotenv/config';
import { connectDB, disconnectDB } from '../server/config/db.js';
import { Goal } from '../server/models/Goal.js';
import { Roadmap } from '../server/models/Roadmap.js';
import { Domain } from '../server/models/Domain.js';

async function migrate() {
  console.log('======================================================================');
  console.log('   MIGRATING GOALS & ROADMAPS TO MULTI-DOMAIN ASSOCIATIONS STRUCTURE  ');
  console.log('======================================================================\n');

  await connectDB();

  const allDomains = await Domain.find({}).lean();
  const domainById = new Map(allDomains.map(d => [String(d._id), d]));
  const domainByName = new Map(allDomains.map(d => [d.name.toLowerCase().trim(), d]));

  console.log(`Loaded ${allDomains.length} reference technical domains from database.\n`);

  // 1. Migrate Goals
  const goals = await Goal.find({});
  console.log(`Found ${goals.length} Goals to inspect...`);
  let goalsMigrated = 0;

  for (const g of goals) {
    let modified = false;

    // Check if domainAssociations is already populated
    if (!g.domainAssociations || g.domainAssociations.length === 0) {
      const associations = [];

      // Determine primary domain
      let primaryDomDoc = null;
      if (g.primaryDomain) {
        primaryDomDoc = domainById.get(String(g.primaryDomain));
      } else if (g.category) {
        primaryDomDoc = domainByName.get(g.category.toLowerCase().trim());
      }

      if (primaryDomDoc) {
        const subIds = [];
        // Check subdomainId or subdomain name
        if (g.subdomainId) {
          const match = (primaryDomDoc.fields || []).find(f => String(f._id) === String(g.subdomainId));
          if (match) subIds.push(match._id);
        } else if (g.subdomain) {
          const match = (primaryDomDoc.fields || []).find(
            f => f.name.toLowerCase().trim() === g.subdomain.toLowerCase().trim() ||
                 f.slug.toLowerCase().trim() === g.subdomain.toLowerCase().trim()
          );
          if (match) subIds.push(match._id);
        }

        associations.push({
          domainId: primaryDomDoc._id,
          subdomainIds: subIds
        });
      }

      // Add secondary domains
      if (Array.isArray(g.secondaryDomains) && g.secondaryDomains.length > 0) {
        for (const secId of g.secondaryDomains) {
          const secDoc = domainById.get(String(secId));
          if (secDoc && !associations.some(a => String(a.domainId) === String(secDoc._id))) {
            associations.push({
              domainId: secDoc._id,
              subdomainIds: []
            });
          }
        }
      }

      if (associations.length > 0) {
        g.domainAssociations = associations;
        modified = true;
      }
    } else {
      // Validate existing associations to ensure references are clean and deduplicated
      const cleanAssoc = [];
      const seen = new Set();
      for (const da of g.domainAssociations) {
        const dId = String(da.domainId?._id || da.domainId);
        if (seen.has(dId)) continue;
        seen.add(dId);
        const subIds = Array.from(new Set((da.subdomainIds || []).map(s => String(s?._id || s))));
        cleanAssoc.push({ domainId: dId, subdomainIds: subIds });
      }
      if (cleanAssoc.length !== g.domainAssociations.length) {
        g.domainAssociations = cleanAssoc;
        modified = true;
      }
    }

    if (modified) {
      await g.save();
      goalsMigrated++;
      console.log(`  ✓ Migrated Goal: "${g.title}" -> ${g.domainAssociations.length} domains`);
    }
  }

  console.log(`Goals migration complete. (${goalsMigrated}/${goals.length} updated)\n`);

  // 2. Migrate Roadmaps
  const roadmaps = await Roadmap.find({});
  console.log(`Found ${roadmaps.length} Roadmaps to inspect...`);
  let roadmapsMigrated = 0;

  for (const r of roadmaps) {
    let modified = false;

    if (!r.domainAssociations || r.domainAssociations.length === 0) {
      const associations = [];

      let primaryDomDoc = null;
      if (r.primaryDomain) {
        primaryDomDoc = domainById.get(String(r.primaryDomain));
      } else if (r.category) {
        primaryDomDoc = domainByName.get(r.category.toLowerCase().trim());
      }

      if (primaryDomDoc) {
        const subIds = [];
        if (r.subdomainId) {
          const match = (primaryDomDoc.fields || []).find(f => String(f._id) === String(r.subdomainId));
          if (match) subIds.push(match._id);
        } else if (r.subdomain) {
          const match = (primaryDomDoc.fields || []).find(
            f => f.name.toLowerCase().trim() === r.subdomain.toLowerCase().trim() ||
                 f.slug.toLowerCase().trim() === r.subdomain.toLowerCase().trim()
          );
          if (match) subIds.push(match._id);
        }

        associations.push({
          domainId: primaryDomDoc._id,
          subdomainIds: subIds
        });
      }

      if (Array.isArray(r.secondaryDomains) && r.secondaryDomains.length > 0) {
        for (const secId of r.secondaryDomains) {
          const secDoc = domainById.get(String(secId));
          if (secDoc && !associations.some(a => String(a.domainId) === String(secDoc._id))) {
            associations.push({
              domainId: secDoc._id,
              subdomainIds: []
            });
          }
        }
      }

      if (associations.length > 0) {
        r.domainAssociations = associations;
        modified = true;
      }
    } else {
      const cleanAssoc = [];
      const seen = new Set();
      for (const da of r.domainAssociations) {
        const dId = String(da.domainId?._id || da.domainId);
        if (seen.has(dId)) continue;
        seen.add(dId);
        const subIds = Array.from(new Set((da.subdomainIds || []).map(s => String(s?._id || s))));
        cleanAssoc.push({ domainId: dId, subdomainIds: subIds });
      }
      if (cleanAssoc.length !== r.domainAssociations.length) {
        r.domainAssociations = cleanAssoc;
        modified = true;
      }
    }

    if (modified) {
      await r.save();
      roadmapsMigrated++;
      console.log(`  ✓ Migrated Roadmap: "${r.title}" -> ${r.domainAssociations.length} domains`);
    }
  }

  console.log(`Roadmaps migration complete. (${roadmapsMigrated}/${roadmaps.length} updated)\n`);

  await disconnectDB();
  console.log('✅ Migration process finished successfully.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
