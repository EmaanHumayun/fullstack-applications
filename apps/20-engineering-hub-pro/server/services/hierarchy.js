import mongoose from 'mongoose';
import { Project } from '../models/Project.js';

export const slugify = s =>
  String(s || 'item')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'item';

export async function generateUniqueSlug(title, excludeId = null) {
  let base = slugify(title);
  let slug = base;
  let n = 2;
  while (await Project.exists({ _id: { $ne: excludeId || null }, slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/**
 * Traverses parent chain to ensure setting newParentId does not create a cycle.
 * @param {string|ObjectId} itemId - The ID of the item being moved/updated
 * @param {string|ObjectId|null} newParentId - The intended new parent ID
 * @returns {Promise<boolean>} - True if a cycle would be created, false otherwise
 */
export async function willCreateCycle(itemId, newParentId) {
  if (!newParentId || !itemId) return false;
  if (String(itemId) === String(newParentId)) return true;

  let currentId = newParentId;
  const visited = new Set([String(itemId)]);

  while (currentId) {
    if (visited.has(String(currentId))) {
      return true;
    }
    visited.add(String(currentId));

    const parentDoc = await Project.findById(currentId).select('parentId').lean();
    if (!parentDoc || !parentDoc.parentId) {
      break;
    }
    currentId = parentDoc.parentId;
  }

  return false;
}

/**
 * Builds a hierarchical tree from a flat list of projects/folders.
 */
export function buildProjectTree(projects = []) {
  const map = new Map();
  const roots = [];

  // Create node wrappers with empty children
  for (const p of projects) {
    const obj = p.toObject ? p.toObject() : { ...p };
    obj.children = [];
    map.set(String(obj._id), obj);
  }

  // Assemble parent-child tree
  for (const obj of map.values()) {
    if (obj.parentId && map.has(String(obj.parentId))) {
      const parent = map.get(String(obj.parentId));
      parent.children.push(obj);
    } else {
      roots.push(obj);
    }
  }

  // Sort children by order, then title
  function sortNodes(nodes) {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(roots);
  return { roots, flat: projects, total: projects.length };
}

/**
 * Collects all descendant IDs for an item recursively.
 */
export async function collectDescendantIds(parentId) {
  const descendants = [];
  const queue = [String(parentId)];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Project.find({ parentId: currentId }, '_id').lean();
    for (const child of children) {
      const childId = String(child._id);
      descendants.push(childId);
      queue.push(childId);
    }
  }

  return descendants;
}
