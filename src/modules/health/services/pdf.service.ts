// ============================================
// SORIVA HEALTH - PDF SERVICE
// Path: src/modules/health/services/pdf.service.ts
// Purpose: Generate doctor summary PDFs
// ============================================

import PDFDocument from 'pdfkit';
import { HealthReport, HealthBiomarker, HealthOrganBreakdown } from '@prisma/client';
import { cloudinaryService } from './cloudinary.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DoctorSummaryInput {
  report: HealthReport & {
    biomarkers: HealthBiomarker[];
    organBreakdowns: HealthOrganBreakdown[];
  };
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorName?: string;
  hospitalName?: string;
  visitDate?: Date;
  notes?: string;
}

export interface PDFGenerationResult {
  buffer: Buffer;
  url?: string;
  publicId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLORS & STYLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COLORS = {
  PRIMARY: '#6366F1',      // Indigo
  SECONDARY: '#8B5CF6',    // Purple
  SUCCESS: '#10B981',      // Green
  WARNING: '#F59E0B',      // Amber
  DANGER: '#EF4444',       // Red
  TEXT_DARK: '#1F2937',    // Gray 800
  TEXT_LIGHT: '#6B7280',   // Gray 500
  BORDER: '#E5E7EB',       // Gray 200
  BG_LIGHT: '#F9FAFB',     // Gray 50
};

const RISK_COLORS: Record<string, string> = {
  NORMAL: COLORS.SUCCESS,
  LOW: '#22C55E',
  MODERATE: COLORS.WARNING,
  HIGH: '#F97316',
  CRITICAL: COLORS.DANGER,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PDF SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PDFService {
  /**
   * Generate doctor summary PDF
   */
  async generateDoctorSummary(input: DoctorSummaryInput): Promise<PDFGenerationResult> {
    const buffer = await this.createPDFBuffer(input);

    // Upload to Cloudinary
    let url: string | undefined;
    let publicId: string | undefined;

    try {
      const uploadResult = await cloudinaryService.uploadSummaryPDF(
        buffer,
        input.report.userId,
        input.report.id
      );
      url = uploadResult.secureUrl;
      publicId = uploadResult.publicId;
    } catch (error) {
      console.error('[PDF] Cloudinary upload failed:', error);
    }

    return { buffer, url, publicId };
  }

  /**
   * Create PDF buffer
   */
  private createPDFBuffer(input: DoctorSummaryInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: `Health Summary - ${input.patientName}`,
            Author: 'Soriva Health',
            Subject: 'Medical Report Summary',
            Creator: 'Soriva Health Platform',
          },
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generate PDF content
        this.addHeader(doc, input);
        this.addPatientInfo(doc, input);
        this.addHealthScore(doc, input.report);
        this.addKeyFindings(doc, input.report);
        this.addBiomarkers(doc, input.report.biomarkers);
        this.addOrganBreakdowns(doc, input.report.organBreakdowns);
        this.addRecommendations(doc, input.report);
        this.addFooter(doc, input);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header with Soriva branding
   */
  private addHeader(doc: PDFKit.PDFDocument, input: DoctorSummaryInput): void {
    // Brand name
    doc
      .fontSize(24)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('SORIVA', 50, 50)
      .fontSize(10)
      .fillColor(COLORS.SECONDARY)
      .text('HEALTH', 130, 55);

    // Title
    doc
      .fontSize(18)
      .fillColor(COLORS.TEXT_DARK)
      .font('Helvetica-Bold')
      .text('Health Report Summary', 50, 90);

    // Report date
    const reportDate = input.report.reportDate?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) || 'N/A';

    doc
      .fontSize(10)
      .fillColor(COLORS.TEXT_LIGHT)
      .font('Helvetica')
      .text(`Report Date: ${reportDate}`, 50, 115);

    // Divider
    doc
      .strokeColor(COLORS.BORDER)
      .lineWidth(1)
      .moveTo(50, 135)
      .lineTo(545, 135)
      .stroke();

    doc.moveDown(2);
  }

  /**
   * Add patient information section
   */
  private addPatientInfo(doc: PDFKit.PDFDocument, input: DoctorSummaryInput): void {
    const y = 150;

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('Patient Information', 50, y);

    const infoY = y + 20;

    // Left column
    doc
      .fontSize(10)
      .fillColor(COLORS.TEXT_LIGHT)
      .font('Helvetica')
      .text('Name:', 50, infoY)
      .fillColor(COLORS.TEXT_DARK)
      .font('Helvetica-Bold')
      .text(input.patientName, 100, infoY);

    if (input.patientAge) {
      doc
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('Age:', 50, infoY + 15)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(`${input.patientAge} years`, 100, infoY + 15);
    }

    if (input.patientGender) {
      doc
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('Gender:', 50, infoY + 30)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(input.patientGender, 100, infoY + 30);
    }

    // Right column
    if (input.doctorName) {
      doc
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('Doctor:', 300, infoY)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(input.doctorName, 350, infoY);
    }

    if (input.hospitalName) {
      doc
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('Hospital:', 300, infoY + 15)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(input.hospitalName, 350, infoY + 15);
    }

    if (input.visitDate) {
      const visitStr = input.visitDate.toLocaleDateString('en-IN');
      doc
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('Visit Date:', 300, infoY + 30)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(visitStr, 360, infoY + 30);
    }

    doc.moveDown(4);
  }

  /**
   * Add health score section
   */
  private addHealthScore(doc: PDFKit.PDFDocument, report: HealthReport): void {
    const y = 230;
    const score = report.healthScore || 0;
    const riskLevel = report.overallRiskLevel || 'NORMAL';
    const riskColor = RISK_COLORS[riskLevel] || COLORS.SUCCESS;

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('Health Score', 50, y);

    // Score box
    doc
      .roundedRect(50, y + 20, 100, 60, 8)
      .fillAndStroke(COLORS.BG_LIGHT, COLORS.BORDER);

    doc
      .fontSize(28)
      .fillColor(riskColor)
      .font('Helvetica-Bold')
      .text(`${score}`, 70, y + 35, { width: 60, align: 'center' });

    doc
      .fontSize(10)
      .fillColor(COLORS.TEXT_LIGHT)
      .font('Helvetica')
      .text('out of 100', 70, y + 65, { width: 60, align: 'center' });

    // Risk level badge
    doc
      .roundedRect(170, y + 35, 100, 25, 4)
      .fill(riskColor);

    doc
      .fontSize(10)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text(riskLevel, 170, y + 42, { width: 100, align: 'center' });

    // Score interpretation
    const interpretation = this.getScoreInterpretation(score);
    doc
      .fontSize(10)
      .fillColor(COLORS.TEXT_DARK)
      .font('Helvetica')
      .text(interpretation, 290, y + 30, { width: 250 });

    doc.moveDown(5);
  }

  /**
   * Add key findings section
   */
  private addKeyFindings(doc: PDFKit.PDFDocument, report: HealthReport): void {
    const y = 330;
    const findings = report.keyFindings || [];

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('Key Findings', 50, y);

    if (findings.length === 0) {
      doc
        .fontSize(10)
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica')
        .text('No significant findings.', 50, y + 20);
    } else {
      let currentY = y + 20;
      findings.forEach((finding, index) => {
        doc
          .fontSize(10)
          .fillColor(COLORS.TEXT_DARK)
          .font('Helvetica')
          .text(`• ${finding}`, 60, currentY, { width: 480 });
        currentY += 15;
      });
    }

    doc.moveDown(2);
  }

  /**
   * Add biomarkers table
   */
  private addBiomarkers(doc: PDFKit.PDFDocument, biomarkers: HealthBiomarker[]): void {
    if (biomarkers.length === 0) return;

    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    const y = doc.y + 20;

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('Biomarkers', 50, y);

    // Table header
    const tableY = y + 25;
    doc
      .rect(50, tableY, 495, 20)
      .fill(COLORS.BG_LIGHT);

    doc
      .fontSize(9)
      .fillColor(COLORS.TEXT_DARK)
      .font('Helvetica-Bold')
      .text('Parameter', 55, tableY + 5)
      .text('Value', 200, tableY + 5)
      .text('Unit', 280, tableY + 5)
      .text('Reference', 350, tableY + 5)
      .text('Status', 470, tableY + 5);

    // Table rows
    let rowY = tableY + 25;
    const maxRows = Math.min(biomarkers.length, 10); // Limit to 10 rows

    for (let i = 0; i < maxRows; i++) {
      const bio = biomarkers[i];
      const statusColor = RISK_COLORS[bio.status] || COLORS.TEXT_DARK;

      doc
        .fontSize(9)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica')
        .text(bio.name.substring(0, 25), 55, rowY)
        .text(String(bio.value), 200, rowY)
        .text(bio.unit || '-', 280, rowY)
        .text(bio.refRange || '-', 350, rowY)        .fillColor(statusColor)
        .font('Helvetica-Bold')
        .text(bio.status, 470, rowY);

      rowY += 18;
    }

    if (biomarkers.length > 10) {
      doc
        .fontSize(8)
        .fillColor(COLORS.TEXT_LIGHT)
        .font('Helvetica-Oblique')
        .text(`... and ${biomarkers.length - 10} more biomarkers`, 55, rowY);
    }

    doc.moveDown(3);
  }

  /**
   * Add organ breakdowns
   */
  private addOrganBreakdowns(doc: PDFKit.PDFDocument, breakdowns: HealthOrganBreakdown[]): void {
    if (breakdowns.length === 0) return;

    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    const y = doc.y + 10;

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('System-wise Analysis', 50, y);

    let currentY = y + 25;

    breakdowns.slice(0, 6).forEach((breakdown) => {
      const riskColor = RISK_COLORS[breakdown.riskLevel] || COLORS.SUCCESS;

      doc
        .fontSize(10)
        .fillColor(COLORS.TEXT_DARK)
        .font('Helvetica-Bold')
        .text(breakdown.organSystem.replace(/_/g, ' '), 60, currentY);

      doc
        .fontSize(9)
        .fillColor(riskColor)
        .text(`Score: ${breakdown.healthScore} | ${breakdown.riskLevel}`, 200, currentY);

      if (breakdown.status) {
        doc
          .fontSize(9)
          .fillColor(COLORS.TEXT_LIGHT)
          .font('Helvetica')
          .text(breakdown.status, 60, currentY + 12, { width: 480 });
        currentY += 30;
      } else {
        currentY += 18;
      }
    });

    doc.moveDown(2);
  }

  /**
   * Add recommendations section
   */
  private addRecommendations(doc: PDFKit.PDFDocument, report: HealthReport): void {
    const recommendations = report.recommendations || [];

    if (recommendations.length === 0) return;

    // Check if we need a new page
    if (doc.y > 680) {
      doc.addPage();
    }

    const y = doc.y + 10;

    doc
      .fontSize(12)
      .fillColor(COLORS.PRIMARY)
      .font('Helvetica-Bold')
      .text('Recommendations', 50, y);

    let currentY = y + 20;

    recommendations.slice(0, 5).forEach((rec, index) => {
      doc
        .fontSize(10)
        .fillColor(COLORS.SUCCESS)
        .font('Helvetica')
        .text(`${index + 1}.`, 55, currentY)
        .fillColor(COLORS.TEXT_DARK)
        .text(rec, 70, currentY, { width: 470 });

      currentY += 18;
    });
  }

  /**
   * Add footer
   */
  private addFooter(doc: PDFKit.PDFDocument, input: DoctorSummaryInput): void {
    const pageHeight = doc.page.height;

    // Disclaimer
    doc
      .fontSize(8)
      .fillColor(COLORS.TEXT_LIGHT)
      .font('Helvetica-Oblique')
      .text(
        'Disclaimer: This report is generated by Soriva Health AI and is for informational purposes only. ' +
        'It does not constitute medical advice. Please consult a qualified healthcare professional for diagnosis and treatment.',
        50,
        pageHeight - 80,
        { width: 495, align: 'center' }
      );

    // Footer line
    doc
      .strokeColor(COLORS.BORDER)
      .lineWidth(0.5)
      .moveTo(50, pageHeight - 50)
      .lineTo(545, pageHeight - 50)
      .stroke();

    // Generated info
    const generatedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    doc
      .fontSize(8)
      .fillColor(COLORS.TEXT_LIGHT)
      .font('Helvetica')
      .text(`Generated by Soriva Health on ${generatedDate}`, 50, pageHeight - 40, {
        width: 495,
        align: 'center',
      });
  }

  /**
   * Get score interpretation text
   */
  private getScoreInterpretation(score: number): string {
    if (score >= 90) return 'Excellent! Your health indicators are within optimal ranges.';
    if (score >= 75) return 'Good health status with minor areas for improvement.';
    if (score >= 60) return 'Fair health status. Some areas need attention.';
    if (score >= 40) return 'Health needs improvement. Consider consulting a doctor.';
    return 'Critical attention required. Please consult a healthcare professional immediately.';
  }
}

// Export singleton instance
export const pdfService = new PDFService();