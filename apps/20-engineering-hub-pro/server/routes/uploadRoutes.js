import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { uploadMiddleware, uploadFileToStorage } from '../services/storage.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

router.post('/', auth, requireEditorOrAbove, uploadMiddleware.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Choose an image or PDF file under 10 MB.' });
    }

    const result = await uploadFileToStorage(req.file);

    await recordAuditEvent({
      action: 'FILE_UPLOAD',
      targetResource: 'Storage',
      targetId: result.storageKey,
      details: {
        filename: result.filename,
        provider: result.provider,
        size: result.size,
        mimetype: result.mimetype
      },
      req
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
