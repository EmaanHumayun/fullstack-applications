import express from 'express';
import { connectDB } from '../config/db.js';
import { SocialLink } from '../models/SocialLink.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

function normalizePlatformUrl(platform, rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return '';
  let formattedUrl = rawUrl.trim();
  const normPlatform = (platform || 'custom').toLowerCase().trim();

  if (normPlatform === 'email' && !formattedUrl.startsWith('mailto:')) {
    formattedUrl = `mailto:${formattedUrl}`;
  } else if (normPlatform === 'whatsapp' && !formattedUrl.startsWith('http')) {
    const cleanPhone = formattedUrl.replace(/[^\d]/g, '');
    formattedUrl = `https://wa.me/${cleanPhone}`;
  } else if (normPlatform === 'telegram' && !formattedUrl.startsWith('http')) {
    const cleanHandle = formattedUrl.replace(/^@/, '').trim();
    formattedUrl = `https://t.me/${cleanHandle}`;
  } else if (normPlatform === 'tiktok' && !formattedUrl.startsWith('http')) {
    const cleanHandle = formattedUrl.replace(/^@/, '').trim();
    formattedUrl = `https://www.tiktok.com/@${cleanHandle}`;
  } else if ((normPlatform === 'twitter' || normPlatform === 'x') && !formattedUrl.startsWith('http')) {
    const cleanHandle = formattedUrl.replace(/^@/, '').trim();
    formattedUrl = `https://x.com/${cleanHandle}`;
  } else if (normPlatform === 'github' && !formattedUrl.startsWith('http')) {
    const cleanHandle = formattedUrl.replace(/^@/, '').trim();
    formattedUrl = `https://github.com/${cleanHandle}`;
  } else if (normPlatform === 'linkedin' && !formattedUrl.startsWith('http')) {
    const cleanHandle = formattedUrl.replace(/^@/, '').trim();
    formattedUrl = `https://linkedin.com/in/${cleanHandle}`;
  } else if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('mailto:')) {
    formattedUrl = `https://${formattedUrl.replace(/^\/+/, '')}`;
  }

  return formattedUrl;
}

// List Social Links
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const isAll = req.query.all === 'true' && isPrivileged;
    const isArchived = req.query.archived === 'true';

    const query = {};
    if (isArchived) {
      query.isArchived = true;
    } else if (isAll) {
      query.isArchived = false;
    } else {
      query.isEnabled = true;
      query.isArchived = false;
    }

    if (req.query.placement) {
      query.placement = req.query.placement;
    }

    const links = await SocialLink.find(query).sort({ order: 1, createdAt: 1 });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

// Create Social Link
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { platform, customPlatformName, label, url, username, icon, order, isEnabled, placement } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'URL / destination is required.' });
    }

    const normPlatform = (platform || 'custom').toLowerCase().trim();
    const formattedUrl = normalizePlatformUrl(normPlatform, url);

    const finalLabel = label?.trim() || customPlatformName?.trim() || (normPlatform.charAt(0).toUpperCase() + normPlatform.slice(1)) || 'Link';

    const link = await SocialLink.create({
      platform: normPlatform,
      customPlatformName: customPlatformName?.trim() || '',
      label: finalLabel,
      url: formattedUrl,
      username: username?.trim() || '',
      icon: icon?.trim() || normPlatform || 'globe',
      order: typeof order === 'number' ? order : 0,
      isEnabled: isEnabled !== false,
      placement: Array.isArray(placement) ? placement : ['hero', 'footer', 'contact'],
      isArchived: false,
      archivedAt: null
    });

    await recordAuditEvent({
      action: 'SOCIAL_LINK_CREATE',
      targetResource: 'SocialLink',
      targetId: String(link._id),
      details: { platform: link.platform, label: link.label },
      req
    });

    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

// Update Social Link
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { platform, customPlatformName, label, url, username, icon, order, isEnabled, placement, isArchived } = req.body;

    const link = await SocialLink.findById(id);
    if (!link) return res.status(404).json({ message: 'Link not found.' });

    if (platform) link.platform = platform.toLowerCase().trim();
    if (customPlatformName !== undefined) link.customPlatformName = customPlatformName.trim();
    if (label) link.label = label.trim();
    if (url) {
      link.url = normalizePlatformUrl(link.platform, url);
    }
    if (username !== undefined) link.username = username;
    if (icon) link.icon = icon;
    if (typeof order === 'number') link.order = order;
    if (isEnabled !== undefined) link.isEnabled = isEnabled;
    if (Array.isArray(placement)) link.placement = placement;
    if (isArchived !== undefined) {
      link.isArchived = isArchived;
      link.archivedAt = isArchived ? new Date() : null;
    }

    await link.save();

    await recordAuditEvent({
      action: 'SOCIAL_LINK_UPDATE',
      targetResource: 'SocialLink',
      targetId: String(link._id),
      details: { platform: link.platform, label: link.label, isArchived: link.isArchived },
      req
    });

    res.json(link);
  } catch (err) {
    next(err);
  }
});

// Reorder Links (Supports both orderedIds array and items array)
router.put('/reorder/batch', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { orderedIds, items } = req.body;

    if (Array.isArray(orderedIds)) {
      await Promise.all(
        orderedIds.map((id, index) =>
          SocialLink.findByIdAndUpdate(id, { order: index + 1 })
        )
      );
    } else if (Array.isArray(items)) {
      await Promise.all(
        items.map((item, index) => {
          const id = item._id || item.id;
          const order = typeof item.order === 'number' ? item.order : index + 1;
          return SocialLink.findByIdAndUpdate(id, { order });
        })
      );
    }

    const updated = await SocialLink.find({ isArchived: false }).sort({ order: 1 });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete Social Link (Supports ?permanent=true for hard delete, otherwise soft-delete)
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const isPermanent = req.query.permanent === 'true';
    const link = await SocialLink.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found.' });

    if (isPermanent) {
      await SocialLink.findByIdAndDelete(req.params.id);
    } else {
      link.isArchived = true;
      link.archivedAt = new Date();
      await link.save();
    }

    await recordAuditEvent({
      action: isPermanent ? 'SOCIAL_LINK_DELETE_PERMANENT' : 'SOCIAL_LINK_ARCHIVE',
      targetResource: 'SocialLink',
      targetId: String(link._id),
      details: { platform: link.platform, label: link.label, isPermanent },
      req
    });

    res.json({ ok: true, message: isPermanent ? 'Link deleted permanently' : 'Link moved to archive' });
  } catch (err) {
    next(err);
  }
});

export default router;
