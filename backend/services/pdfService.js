const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFReportService {
  constructor() {
    this.doc = new PDFDocument({ margin: 50 });
  }
  
  generateReport(data, outputPath) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(outputPath);
      
      this.doc.pipe(writeStream);
      
      // Add content
      this.addHeader(data.title);
      this.addMetaData(data);
      
      if (data.sections) {
        data.sections.forEach(section => {
          this.addSection(section.title, section.content);
        });
      }
      
      if (data.tables) {
        data.tables.forEach(table => {
          this.addTable(table.headers, table.rows);
        });
      }
      
      this.addFooter();
      
      this.doc.end();
      
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    });
  }
  
  addHeader(title) {
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown();
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);
  }
  
  addMetaData(data) {
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Project Information')
      .font('Helvetica')
      .fontSize(10);
    
    if (data.region) {
      this.doc.text(`Region: ${data.region}`);
    }
    
    if (data.budget) {
      this.doc.text(`Budget: ${data.currency || '$'}${data.budget.toLocaleString()}`);
    }
    
    if (data.sites) {
      this.doc.text(`Number of Sites: ${data.sites.length}`);
    }
    
    this.doc.moveDown();
  }
  
  addSection(title, content) {
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(title)
      .moveDown(0.5);
    
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .text(content, {
        width: 500,
        align: 'left'
      })
      .moveDown();
  }
  
  addTable(headers, rows) {
    const tableTop = this.doc.y;
    const colWidth = 500 / headers.length;
    
    // Draw headers
    this.doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((header, i) => {
      this.doc.text(header, 50 + (i * colWidth), tableTop, {
        width: colWidth - 10,
        align: 'center'
      });
    });
    
    // Draw rows
    this.doc.font('Helvetica').fontSize(8);
    rows.forEach((row, rowIndex) => {
      const y = tableTop + 20 + (rowIndex * 20);
      row.forEach((cell, colIndex) => {
        this.doc.text(String(cell), 50 + (colIndex * colWidth), y, {
          width: colWidth - 10,
          align: 'center'
        });
      });
    });
    
    this.doc.moveDown(rows.length * 0.5 + 1);
  }
  
  addFooter() {
    const pageCount = this.doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      this.doc.switchToPage(i);
      
      this.doc
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          this.doc.page.height - 50,
          { align: 'center', width: 500 }
        );
    }
  }
}

module.exports = PDFReportService;