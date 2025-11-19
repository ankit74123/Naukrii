import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Generate applications report PDF
// @route   GET /api/reports/applications/pdf
// @access  Private (Employer)
export const generateApplicationsReportPDF = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user.id })
      .populate('applicant', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=applications-report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Applications Report', { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(12).text(`Total Applications: ${applications.length}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Applications list
    applications.forEach((app, index) => {
      doc.fontSize(10);
      doc.text(`${index + 1}. ${app.applicant.name}`);
      doc.text(`   Job: ${app.job.title}`);
      doc.text(`   Status: ${app.status}`);
      doc.text(`   Applied: ${app.createdAt.toLocaleDateString()}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export applications to Excel
// @route   GET /api/reports/applications/excel
// @access  Private (Employer)
export const exportApplicationsToExcel = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user.id })
      .populate('applicant', 'name email phone')
      .populate('job', 'title category')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    // Define columns
    worksheet.columns = [
      { header: 'Applicant Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Job Title', key: 'job', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Applied Date', key: 'appliedDate', width: 15 },
    ];

    // Add data
    applications.forEach(app => {
      worksheet.addRow({
        name: app.applicant.name,
        email: app.applicant.email,
        phone: app.applicant.phone,
        job: app.job.title,
        category: app.job.category,
        status: app.status,
        appliedDate: app.createdAt.toLocaleDateString(),
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applications-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Generate jobs report
// @route   GET /api/reports/jobs/excel
// @access  Private (Employer/Admin)
export const exportJobsToExcel = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { employer: req.user.id };
    const jobs = await Job.find(query)
      .populate('employer', 'name companyName')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    worksheet.columns = [
      { header: 'Job Title', key: 'title', width: 30 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Job Type', key: 'jobType', width: 15 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Salary Range', key: 'salary', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Posted Date', key: 'postedDate', width: 15 },
    ];

    jobs.forEach(job => {
      worksheet.addRow({
        title: job.title,
        company: job.company,
        category: job.category,
        jobType: job.jobType,
        location: `${job.location.city}, ${job.location.state}`,
        salary: `${job.salary?.min || 0} - ${job.salary?.max || 0}`,
        status: job.status,
        postedDate: job.createdAt.toLocaleDateString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
