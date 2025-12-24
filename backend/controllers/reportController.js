const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const Project = require('../models/Project');
const PDFReportService = require('../services/pdfService');

exports.generate = async (req, res) => {
  try {
    const { title, report_type, project_id, parameters, sections, tables_data } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const report = new Report({
      title,
      report_type: report_type || 'Custom',
      project_id: project_id || undefined,
      project_name: req.body.project_name || undefined,
      parameters: parameters || {},
      sections: sections || [],
      tables_data: tables_data || [],
      created_by: req.userId,
      status: 'generating',
      generation_progress: 0,
    });
    await report.save();
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const fileName = `${report._id}.pdf`;
    const outputPath = path.join(reportsDir, fileName);
    const pdfService = new PDFReportService();
    const payload = {
      title,
      region: parameters?.region,
      budget: parameters?.budget,
      sites: parameters?.sites || [],
      sections: (sections || []).map(s => ({ title: s.title, content: s.content || '' })),
      tables: (tables_data || []).map(t => ({ headers: t.headers || [], rows: t.rows || [] })),
    };
    await pdfService.generateReport(payload, outputPath);
    const stats = fs.statSync(outputPath);
    report.file_path = outputPath;
    report.file_size = stats.size;
    report.file_format = 'pdf';
    report.status = 'completed';
    report.generation_progress = 100;
    report.generated_at = new Date();
    await report.save();
    if (project_id) {
      await Project.findByIdAndUpdate(project_id, {
        $push: {
          reports: {
            report_type: report.report_type,
            generated_at: report.generated_at,
            filepath: outputPath,
            parameters: report.parameters,
          },
        },
      });
    }
    res.json({ id: report._id, download_url: `/api/reports/download/${report._id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    if (!report.file_path || !fs.existsSync(report.file_path)) {
      return res.status(404).json({ error: 'Report file not found' });
    }
    report.downloaded_count = (report.downloaded_count || 0) + 1;
    report.viewed_at = new Date();
    await report.save();
    res.download(report.file_path, path.basename(report.file_path));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
