const fs = require('fs');
const path = require('path');
const SitePhoto = require('../models/SitePhoto');

exports.generate3DLayout = async (req, res) => {
  try {
    const { location, project_id, site_id } = req.body;
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const files = req.files || [];
    const outDir = path.join(__dirname, '..', 'uploads', 'visualization');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const saved = [];
    for (const f of files) {
      const dest = path.join(outDir, `${Date.now()}-${f.originalname}`);
      fs.copyFileSync(f.path, dest);
      const fileMeta = {
        original_name: f.originalname,
        filename: path.basename(dest),
        size: f.size,
        mime_type: f.mimetype,
        path: dest,
      };
      saved.push(fileMeta);
      try {
        fs.unlinkSync(f.path);
      } catch (_) {}
      if (project_id && site_id && req.userId) {
        await SitePhoto.create({
          project_id,
          site_id,
          filename: fileMeta.filename,
          original_filename: fileMeta.original_name,
          filepath: fileMeta.filename,
          file_size: fileMeta.size,
          mime_type: fileMeta.mime_type,
          uploaded_by: req.userId,
        });
      }
    }

    const previewUrl = saved.length
      ? `/uploads/visualization/${saved[0].filename}`
      : null;

    res.json({
      status: 'queued',
      location,
      project_id: project_id || null,
      site_id: site_id || null,
      image_count: saved.length,
      images: saved.map(({ original_name, filename, size, mime_type }) => ({
        original_name,
        filename,
        size,
        mime_type,
      })),
      layout_preview_url: previewUrl,
      message: 'Visualization request accepted',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
