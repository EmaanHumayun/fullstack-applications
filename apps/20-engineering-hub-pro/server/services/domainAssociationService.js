import mongoose from 'mongoose';
import { Domain } from '../models/Domain.js';

/**
 * Validates domain associations:
 * 1. Ensures domain exists.
 * 2. Ensures subdomains exist and belong to the parent domain.
 * 3. Deduplicates domain IDs and subdomain IDs.
 * 4. Supports domains with zero subdomains.
 */
export async function validateDomainAssociations(associations) {
  if (!associations || !Array.isArray(associations)) {
    return { valid: true, sanitized: [] };
  }

  const sanitized = [];
  const seenDomainIds = new Set();

  for (const item of associations) {
    if (!item) continue;
    const rawDomainId = item.domainId?._id || item.domainId;
    if (!rawDomainId) continue;

    const domIdStr = String(rawDomainId).trim();
    if (!mongoose.Types.ObjectId.isValid(domIdStr)) {
      return { valid: false, error: `Invalid domain ID: ${domIdStr}` };
    }

    if (seenDomainIds.has(domIdStr)) {
      // Duplicate domain association; skip duplicate
      continue;
    }
    seenDomainIds.add(domIdStr);

    const domainDoc = await Domain.findById(domIdStr).lean();
    if (!domainDoc) {
      return { valid: false, error: `Domain with ID ${domIdStr} does not exist.` };
    }

    const availableFieldMap = new Map();
    (domainDoc.fields || []).forEach(f => {
      availableFieldMap.set(String(f._id), f);
    });

    const validSubIds = [];
    const seenSubIds = new Set();
    const rawSubIds = Array.isArray(item.subdomainIds) ? item.subdomainIds : [];

    for (const sub of rawSubIds) {
      if (!sub) continue;
      const subIdStr = String(sub?._id || sub).trim();
      if (!mongoose.Types.ObjectId.isValid(subIdStr)) {
        return { valid: false, error: `Invalid subdomain ID: ${subIdStr}` };
      }
      if (!availableFieldMap.has(subIdStr)) {
        return {
          valid: false,
          error: `Subdomain ID ${subIdStr} does not belong to domain "${domainDoc.name}".`
        };
      }
      if (seenSubIds.has(subIdStr)) {
        continue;
      }
      seenSubIds.add(subIdStr);
      validSubIds.push(new mongoose.Types.ObjectId(subIdStr));
    }

    sanitized.push({
      domainId: new mongoose.Types.ObjectId(domIdStr),
      subdomainIds: validSubIds
    });
  }

  return { valid: true, sanitized };
}

/**
 * Synchronizes legacy fields (primaryDomain, subdomain, subdomainId, secondaryDomains)
 * from domainAssociations for 100% backward compatibility.
 */
export async function syncLegacyFields(doc) {
  if (!doc) return;

  if (doc.domainAssociations && doc.domainAssociations.length > 0) {
    const firstAssoc = doc.domainAssociations[0];
    doc.primaryDomain = firstAssoc.domainId;
    doc.subdomainId = (firstAssoc.subdomainIds && firstAssoc.subdomainIds.length > 0)
      ? firstAssoc.subdomainIds[0]
      : null;

    // Resolve subdomain name
    if (doc.subdomainId) {
      try {
        const dom = await Domain.findById(firstAssoc.domainId).lean();
        const field = (dom?.fields || []).find(f => String(f._id) === String(doc.subdomainId));
        if (field) {
          doc.subdomain = field.name;
        }
      } catch (e) {
        // Fallback silently
      }
    } else {
      doc.subdomain = '';
    }

    // Secondary domains: subsequent associated domains
    doc.secondaryDomains = doc.domainAssociations.slice(1).map(d => d.domainId);
  } else if (doc.primaryDomain) {
    // Populate domainAssociations from legacy fields if not already populated
    doc.domainAssociations = [{
      domainId: doc.primaryDomain,
      subdomainIds: doc.subdomainId ? [doc.subdomainId] : []
    }];
    if (doc.secondaryDomains && doc.secondaryDomains.length > 0) {
      for (const secId of doc.secondaryDomains) {
        if (!doc.domainAssociations.some(d => String(d.domainId) === String(secId))) {
          doc.domainAssociations.push({
            domainId: secId,
            subdomainIds: []
          });
        }
      }
    }
  }
}

/**
 * Enriches populated domainAssociations with human-readable subdomain details.
 * Avoids extra database queries because Domain already contains fields array.
 */
export function enrichDomainAssociations(doc) {
  if (!doc) return doc;
  const isMongooseDoc = typeof doc.toObject === 'function';
  const obj = isMongooseDoc ? doc.toObject({ virtuals: true }) : { ...doc };

  if (Array.isArray(obj.domainAssociations)) {
    obj.domainAssociations = obj.domainAssociations.map(item => {
      const dom = item.domainId;
      if (!dom || typeof dom !== 'object') {
        return item;
      }
      const selectedSubIds = new Set((item.subdomainIds || []).map(id => String(id?._id || id)));
      const matchedFields = (dom.fields || []).filter(f => selectedSubIds.has(String(f._id)));

      return {
        domainId: {
          _id: dom._id,
          name: dom.name,
          slug: dom.slug,
          icon: dom.icon || 'layers',
          accentColor: dom.accentColor || '#bb9457'
        },
        subdomainIds: item.subdomainIds || [],
        subdomains: matchedFields.map(s => ({
          _id: s._id,
          name: s.name,
          slug: s.slug,
          icon: s.icon || 'code'
        }))
      };
    });
  }

  return obj;
}
