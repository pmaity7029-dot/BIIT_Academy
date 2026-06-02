import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
  FiAward,
  FiEdit3,
  FiPlus,
  FiPrinter,
  FiSave,
  FiSearch,
  FiTrash2
} from 'react-icons/fi';
import dayjs from 'dayjs';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { ShimmerTable } from '../components/ShimmerLoading.jsx';
import React from 'react';
import logo from "../images/logo.png";
import nsdc from "../images/nsdc.jpeg";
import pcms from "../images/pcms.png";
import aim from "../images/aim.jpg";
import add from "../images/add.png";

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const CERTIFICATE_ASSETS = {
  mainLogo: logo, // Line 30
  training: add,
  planning: pcms,
  education: aim,
  nsdc: nsdc
};

const defaultModules = [
  { no: '1.', title: 'Computer fundamental, Basic Hardware, Operating system and hardware', fullMarks: '150', marksObtain: '97' },
  { no: '2.', title: 'MS Office (Word, Excel, PowerPoint)', fullMarks: '100', marksObtain: '70' },
  { no: '3.', title: 'Internet and E-mail', fullMarks: '50', marksObtain: '30' },
  { no: '4.', title: 'Project work and Practical', fullMarks: '200', marksObtain: '150' }
];

const getMarksNumber = (value) => {
  const match = String(value ?? '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const formatMarksNumber = (value) => {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(/\.?0+$/, '');
};

const cloneModuleRows = (rows = []) =>
  rows.map((row, index) => ({
    no: row?.no || `${index + 1}.`,
    title: row?.title || '',
    fullMarks: row?.fullMarks ?? '',
    marksObtain: row?.marksObtain ?? ''
  }));

const calculateMarksSummary = (rows = []) => {
  const totalFullMarks = rows.reduce(
    (sum, row) => sum + getMarksNumber(row.fullMarks),
    0
  );
  const totalMarksObtain = rows.reduce(
    (sum, row) => sum + getMarksNumber(row.marksObtain),
    0
  );

  return {
    totalFullMarks: formatMarksNumber(totalFullMarks),
    totalMarksObtain: formatMarksNumber(totalMarksObtain),
    percentage: totalFullMarks > 0
      ? formatMarksNumber((totalMarksObtain / totalFullMarks) * 100)
      : '0'
  };
};

const withCalculatedMarks = (certificate) => {
  const moduleRows = cloneModuleRows(certificate.moduleRows?.length ? certificate.moduleRows : defaultModules);

  return {
    ...certificate,
    moduleRows,
    ...calculateMarksSummary(moduleRows)
  };
};

const makeDummyCertificate = () =>
  withCalculatedMarks({
    certificateNo: 'Auto Generate',
    student: '',
    studentName: 'BISWAJIT HAZRA',
    fatherName: 'Manik Hazra',
    gender: 'Male',
    regNo: 'BIIT0120265902',
    birthDateText: '03 April 2004',
    courseTitle: 'Frontend Web Development',
    duration: '6 Months / 120 hrs',
    grade: 'A',
    moduleRows: cloneModuleRows(defaultModules),
    issueDate: dayjs(),
    issueDateText: dayjs().format('DD/MM/YY'),
    instituteName: 'Bengal Institute of IT & Technology',
    officeAddress: 'H.O. & Reg. Office : Midnapore, West Bengal',
    website: 'www.biitedu.in'
  });

const getRelation = (gender) => {
  if (gender === 'Male') return 'Son';
  if (gender === 'Female') return 'Daughter';
  return 'Student';
};

const getCertificateData = (certificate) => {
  const student = certificate?.student;

  if (!certificate) return makeDummyCertificate();

  return withCalculatedMarks({
    _id: certificate._id,
    certificateNo: certificate.certificateNo || 'Auto Generate',
    student: student?._id || certificate.student || '',
    studentName: certificate.studentName || student?.name || 'Student Name',
    fatherName: certificate.fatherName || student?.fatherName || 'Father Name',
    gender: certificate.gender || student?.gender || 'Male',
    regNo: certificate.regNo || student?.regNo || 'BIIT0120265902',
    birthDateText:
      certificate.birthDateText ||
      (student?.dob ? dayjs(student.dob).format('DD MMMM YYYY') : '03 April 2004'),
    courseTitle: certificate.courseTitle || 'Frontend Web Development',
    duration: certificate.duration || certificate.remarks || '6 Months / 120 hrs',
    grade: certificate.grade || 'A',
    moduleRows: certificate.moduleRows?.length ? certificate.moduleRows : defaultModules,
    issueDate: certificate.issueDate ? dayjs(certificate.issueDate) : dayjs(),
    issueDateText:
      certificate.issueDateText ||
      (certificate.issueDate ? dayjs(certificate.issueDate).format('DD/MM/YY') : dayjs().format('DD/MM/YY')),
    instituteName: certificate.instituteName || 'Bengal Institute of IT & Technology',
    officeAddress: certificate.officeAddress || 'H.O. & Reg. Office : Midnapore, West Bengal',
    website: certificate.website || 'www.biit.in'
  });
};

const CERTIFICATE_STYLES = `
  .classic-certificate-wrap {
    position: relative;
    z-index: 0;
    isolation: isolate;
    width: 100%;
    overflow-x: auto;
    padding: 14px 0;
  }

  .classic-certificate {
    position: relative;
    z-index: 0;
    isolation: isolate;
    width: 1122px;
    height: 794px;
    margin: 0 auto;
    overflow: hidden;
    border: 2px solid #7d5a1d;
    color: #050505;
    background:
      radial-gradient(circle at 51% 48%, rgba(255, 253, 237, 0.98) 0%, rgba(255, 246, 202, 0.98) 38%, rgba(237, 204, 102, 0.96) 68%, #c89231 100%);
    font-family: Georgia, "Times New Roman", serif;
    box-shadow: 0 24px 70px rgba(80, 45, 0, 0.22);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .classic-certificate,
  .classic-certificate * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Single clean tiled watermark layer. Removed the second/right watermark layer
     because it was overlapping and becoming dark in print/PDF. */
  .classic-bg-pattern {
    position: absolute;
    top: -150px;
    left: 112px;
    z-index: 1;
    width: 1120px;
    height: 1040px;
    display: grid;
    grid-template-columns: repeat(3, 360px);
    grid-auto-rows: 27px;
    column-gap: 16px;
    row-gap: 0;
    overflow: hidden;
    transform: rotate(-13deg);
    transform-origin: center;
    opacity: 0.16;
    color: #9b741e;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 20px;
    line-height: 1;
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
  }

  .classic-bg-pattern span {
    display: block;
  }

  .classic-left-curve {
    position: absolute;
    left: -168px;
    top: -74px;
    z-index: 2;
    width: 420px;
    height: 950px;
    border-radius: 0 58% 58% 0;
    background:
      linear-gradient(105deg, #8a651f 0%, #a87a23 43%, #c59636 55%, rgba(255, 229, 150, 0.42) 61%, rgba(255,255,255,0) 72%);
    box-shadow: 24px 0 0 rgba(140, 102, 24, 0.18);
    transform: rotate(7deg);
    pointer-events: none;
  }

  .classic-left-curve::after {
    content: '';
    position: absolute;
    right: 56px;
    top: 0;
    width: 28px;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 223, 128, 0.28);
  }

  .classic-logo-watermark {
    position: absolute;
    z-index: 3;
    left: 438px;
    top: 278px;
    width: 255px;
    opacity: 0.035;
    filter: grayscale(10%);
    pointer-events: none;
  }

  .classic-layer {
    position: relative;
    z-index: 20;
    width: 100%;
    height: 100%;
    padding: 24px 30px 0;
  }

  .classic-logo {
    position: absolute;
    left: 22px;
    top: 82px;
    z-index: 25;
    width: 175px;
    height: 166px;
    display: grid;
    place-items: center;
  }

  .classic-logo img {
    width: 178px;
    height: 158px;
    object-fit: contain;
    filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.28));
  }

  .classic-top {
    padding-left: 170px;
    text-align: center;
  }

  .classic-institute {
    margin: 0;
    color: #ffffff;
    font-size: 43px;
    line-height: 0.98;
    font-variant: small-caps;
    letter-spacing: 1.3px;
    text-shadow: 2px 3px 4px rgba(0,0,0,0.58);
  }

  .classic-subtitle {
    margin: 8px 0 0;
    color: #1a1a1a;
    font-family: Arial, sans-serif;
    font-size: 20px;
    line-height: 1.08;
    font-weight: 500;
  }

  .classic-foundation {
    margin: 4px 0 0;
    color: #9f2727;
    font-family: Arial, sans-serif;
    font-size: 21px;
    line-height: 1.08;
    font-weight: 800;
  }

  .classic-ribbon {
    position: relative;
    width: 600px;
    height: 58px;
    margin: 9px auto 5px;
    display: grid;
    place-items: center;
    border: 3px solid #b98d2e;
    border-radius: 16px;
    background:
      linear-gradient(90deg, #71110d 0%, #ad251d 20%, #6b0c08 50%, #d74832 82%, #70100e 100%);
    color: #ffffff;
    font-size: 37px;
    font-style: italic;
    font-weight: 900;
    line-height: 1;
    text-shadow: 2px 3px 3px rgba(0,0,0,0.64);
    box-shadow: 0 5px 10px rgba(0,0,0,0.36);
  }

  .classic-reg-row {
    display: flex;
    justify-content: center;
    gap: 118px;
    color: #1b2b70;
    font-size: 16px;
    font-weight: 800;
  }

  .classic-body {
    position: relative;
    z-index: 22;
    margin-top: 50px;
    padding-left: 86px;
    padding-right: 28px;
  }

  .classic-main-text {
    margin: 0 0 13px;
    color: #000;
    font-size: 18px;
    line-height: 1.36;
    font-weight: 800;
    text-align: left;
    text-shadow: 0 1px 0 rgba(255,255,255,0.55);
  }

  .classic-highlight {
    display: inline;
    padding: 0 4px;
    background: #fff200;
    color: #000;
    font-weight: 900;
  }

  .classic-content-row {
    display: grid;
    grid-template-columns: 390px 1fr;
    gap: 100px;
    align-items: end;
    margin-top: 8px;
  }

  .classic-accreditation-panel {
    width: 282px;
    margin-left: 0;
  }

  .classic-accreditation-title,
  .classic-accreditation-label,
  .classic-initiative-label,
  .classic-partner-label {
    color: #c91d1d;
    font-size: 12px;
    font-weight: 900;
    line-height: 1;
  }

  .classic-accreditation-label,
  .classic-initiative-label,
  .classic-partner-label {
    color: #111;
    font-size: 14px;
    font-weight: 700;
    margin: 7px 0 2px;
  }

  .classic-partner-label {
    font-size: 15px;
    margin-top: 1px;
  }

  .classic-training-img {
    width: 142px;
    height: 48px;
    object-fit: contain;
    display: block;
  }

  .classic-accreditation-grid {
    display: grid;
    grid-template-columns: 122px 158px;
    gap: 7px 10px;
    align-items: center;
  }

  .classic-cert-img-box {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: 1px solid rgba(70, 55, 28, 0.65);
    background: rgba(255, 255, 255, 0.78);
  }

  .classic-cert-img-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  .classic-cert-img-box.tall {
    height: 58px;
  }

  .classic-cert-img-box.nsdc {
    height: 58px;
    width: 158px;
  }

  .classic-signatures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 30px;
    padding-right: 4px;
    color: #111;
    font-size: 16px;
    font-weight: 900;
    text-align: center;
  }

  .classic-signatures span {
    border-top: 1px solid rgba(0,0,0,0.25);
    padding-top: 5px;
  }

  .classic-module-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255,255,255,0.86);
    color: #000;
    font-size: 14px;
    line-height: 1.05;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }

  .classic-module-table th,
  .classic-module-table td {
    border: 1px solid #000;
    padding: 5px 7px;
    vertical-align: middle;
  }

  .classic-module-table th {
    background: rgba(255,255,255,0.95);
    font-weight: 900;
    text-align: center;
  }

  .classic-module-table td:first-child {
    width: 28px;
    font-weight: 900;
    text-align: center;
  }

  .classic-module-table td:nth-child(3),
  .classic-module-table td:nth-child(4) {
    width: 74px;
    text-align: center;
  }

  .classic-total-row td {
    background: rgba(255,255,255,0.96);
    font-size: 16px;
    font-weight: 900;
  }

  .classic-issue {
    margin-top: 22px;
    color: #111;
    font-size: 16px;
    font-weight: 900;
    text-align: center;
  }

  .classic-footer-strip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 34px;
    z-index: 30;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    background: #a9791f;
    color: #ffffff;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .classic-grade-note {
    position: absolute;
    left: 58px;
    right: 290px;
    bottom: 8px;
    z-index: 30;
    color: #df1f1f;
    font-family: Arial, sans-serif;
    font-size: 13px;
    font-weight: 800;
    background: rgba(255, 255, 225, 0.72);
  }

  .classic-verify-note {
    position: absolute;
    right: 12px;
    bottom: 8px;
    z-index: 30;
    color: #4a3a1b;
    font-family: Arial, sans-serif;
    font-size: 10px;
    font-weight: 800;
  }

  .editable-cert-field {
    min-width: 22px;
    display: inline-block;
    border-radius: 4px;
    outline: 2px dashed rgba(20, 63, 117, 0.55);
    outline-offset: 2px;
    cursor: text;
  }

  .editable-cert-field:focus {
    background: #fff6a3;
    outline: 2px solid #143f75;
  }

  .certificate-editor-grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 18px;
  }

  .certificate-editor-form {
    max-height: 76vh;
    overflow: auto;
    padding-right: 6px;
  }

  .editor-field-label {
    display: block;
    margin: 12px 0 5px;
    color: #53647d;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .editor-hint {
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 1px dashed #d4af37;
    border-radius: 12px;
    background: #fffbea;
    color: #6b560f;
    font-size: 13px;
    font-weight: 700;
  }

  .module-editor-row {
    display: grid;
    grid-template-columns: 46px 1fr 70px 70px 36px;
    gap: 6px;
    margin-bottom: 8px;
  }

  @media (max-width: 1200px) {
    .classic-certificate {
      transform: scale(0.84);
      transform-origin: top left;
      margin-bottom: -115px;
    }

    .classic-certificate-wrap {
      height: 690px;
    }

    .certificate-editor-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const printStyles = `
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html,
  body {
    width: 297mm;
    height: 210mm;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    background: #ffffff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-stage {
    width: 297mm;
    height: 210mm;
    display: grid;
    place-items: center;
    background: #ffffff;
  }

  .classic-certificate-wrap {
    width: 297mm !important;
    height: 210mm !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .classic-certificate {
    width: 297mm !important;
    height: 210mm !important;
    margin: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .editable-cert-field {
    outline: 0 !important;
  }
`;

const renderBgText = (prefix) =>
  Array.from({ length: 126 }, (_, index) => (
    <span key={`${prefix}-${index}`}>Bengal Institute of IT &amp; Technology</span>
  ));

function EditableField({ value, editable, className = '', onChange }) {
  if (!editable) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      className={`editable-cert-field ${className}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => onChange(event.currentTarget.textContent)}
    >
      {value}
    </span>
  );
}

const ClassicCertificate = React.forwardRef(function ClassicCertificate(
  { data, editable = false, onEditField, onEditModule },
  ref
) {
  const edit = (field) => (value) => onEditField?.(field, value);

  return (
    <div ref={ref} className="classic-certificate">
      <div className="classic-bg-pattern">{renderBgText('main')}</div>
      <div className="classic-left-curve" />
      <img src={CERTIFICATE_ASSETS.mainLogo} alt="BIIT watermark" className="classic-logo-watermark" />

      <div className="classic-layer">
        <div className="classic-logo">
          <img src={CERTIFICATE_ASSETS.mainLogo} alt="BIIT logo" />
        </div>

        <div className="classic-top">
          <h1 className="classic-institute">
            <EditableField value={data.instituteName} editable={editable} onChange={edit('instituteName')} />
          </h1>

          <div className="classic-subtitle">
            Reg. Under Ministry of Human Resource Development (MHRD), Govt. of India
          </div>

          <div className="classic-foundation">
            A Unit of Bengal Institute Educational Foundation
            <span> (An autonomous Institute) </span>
          </div>

          <div className="classic-foundation">ISO : 9001 : 2008 Certified</div>

          <div className="classic-ribbon">Certificate of Completion</div>

          <div className="classic-reg-row">
            <span>
              Reg. no.{' '}
              <EditableField value={data.regNo} editable={editable} onChange={edit('regNo')} />
            </span>
            <span>Certificate. no. {data.certificateNo}</span>
          </div>
        </div>

        <div className="classic-body">
          <p className="classic-main-text">
            This certificate is awarded to{' '}
            <EditableField
              value={data.studentName}
              editable={editable}
              className="classic-highlight"
              onChange={edit('studentName')}
            />
            , {getRelation(data.gender)} of{' '}
            <EditableField
              value={data.fatherName}
              editable={editable}
              className="classic-highlight"
              onChange={edit('fatherName')}
            />
            , date of birth{' '}
            <EditableField
              value={data.birthDateText}
              editable={editable}
              className="classic-highlight"
              onChange={edit('birthDateText')}
            />
            , on completion of{' '}
            <EditableField
              value={data.courseTitle}
              editable={editable}
              className="classic-highlight"
              onChange={edit('courseTitle')}
            />{' '}
            duration of{' '}
            <EditableField
              value={data.duration}
              editable={editable}
              className="classic-highlight"
              onChange={edit('duration')}
            />{' '}
            with grade{' '}
            <EditableField
              value={data.grade}
              editable={editable}
              className="classic-highlight"
              onChange={edit('grade')}
            />
            .
          </p>

          <div className="classic-content-row">
            <div>
              <div className="classic-accreditation-panel">
                <div className="classic-accreditation-title">Training Institute</div>
                <img src={CERTIFICATE_ASSETS.training} alt="BIIT Kalagachia" className="classic-training-img" />

                <div className="classic-accreditation-label">Accreditation of</div>
                <div className="classic-accreditation-grid">
                  <div className="classic-cert-img-box tall">
                    <img src={CERTIFICATE_ASSETS.planning} alt="Planning Commission Government of India" />
                  </div>
                  <div />

                  <div>
                    <div className="classic-initiative-label">An Initiative of</div>
                    <div className="classic-cert-img-box tall">
                      <img src={CERTIFICATE_ASSETS.education} alt="Education and Training" />
                    </div>
                  </div>

                  <div>
                    <div className="classic-partner-label">In partnership with</div>
                    <div className="classic-cert-img-box nsdc">
                      <img src={CERTIFICATE_ASSETS.nsdc} alt="NSDC Skill Development" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="classic-signatures">
                <span>Register</span>
                <span>Chairman</span>
                <span>LTP Director</span>
              </div>
            </div>

            <div>
              <table className="classic-module-table">
                <thead>
                  <tr>
                    <th colSpan="2">Module Details</th>
                    <th>Full<br />Marks</th>
                    <th>Marks<br />Obtain</th>
                  </tr>
                </thead>
                <tbody>
                  {data.moduleRows.map((row, index) => (
                    <tr key={`${row.no}-${index}`}>
                      <td>
                        <EditableField
                          value={row.no}
                          editable={editable}
                          onChange={(value) => onEditModule?.(index, 'no', value)}
                        />
                      </td>
                      <td>
                        <EditableField
                          value={row.title}
                          editable={editable}
                          onChange={(value) => onEditModule?.(index, 'title', value)}
                        />
                      </td>
                      <td>
                        <EditableField
                          value={row.fullMarks}
                          editable={editable}
                          onChange={(value) => onEditModule?.(index, 'fullMarks', value)}
                        />
                      </td>
                      <td>
                        <EditableField
                          value={row.marksObtain}
                          editable={editable}
                          onChange={(value) => onEditModule?.(index, 'marksObtain', value)}
                        />
                      </td>
                    </tr>
                  ))}

                  <tr className="classic-total-row">
                    <td colSpan="2">
                      Percentage : {data.percentage} % &nbsp;&nbsp; Grade :{' '}
                      <EditableField
                        value={data.grade}
                        editable={editable}
                        onChange={edit('grade')}
                      />
                    </td>
                    <td>Total {data.totalFullMarks}</td>
                    <td>Obtained {data.totalMarksObtain}</td>
                  </tr>
                </tbody>
              </table>

              <div className="classic-issue">
                <EditableField
                  value={data.issueDateText}
                  editable={editable}
                  onChange={edit('issueDateText')}
                />
                <br />
                Date of Issue
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="classic-footer-strip">
        <span>
          <EditableField
            value={data.officeAddress}
            editable={editable}
            onChange={edit('officeAddress')}
          />
        </span>
        <span>
          <EditableField value={data.website} editable={editable} onChange={edit('website')} />
        </span>
      </div>

      <div className="classic-grade-note">
        Grade: A+ (90% &amp; above), A (70%-89%), B+ (60%-69%), B (50%-59%), C (40%-49%)
      </div>

      <div className="classic-verify-note">
        To verify this certificate please visit our office.
      </div>
    </div>
  );
});

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editor, setEditor] = useState(makeDummyCertificate());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const certRef = useRef(null);
  const editorCertRef = useRef(null);

  const load = async (searchValue = search) => {
    setLoading(true);

    try {
      const [certificateRes, studentRes] = await Promise.all([
        api.get('/certificates', { params: searchValue ? { search: searchValue } : {} }),
        api.get('/students')
      ]);

      setCertificates(certificateRes.data);
      setStudents(studentRes.data);

      if (!selected && certificateRes.data[0]) {
        setSelected(certificateRes.data[0]);
      }

      return certificateRes.data;
    } catch (error) {
      message.error('Certificate data loading failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const updateEditor = (field, value) => {
    setEditor((prev) => ({ ...prev, [field]: value }));
  };

  const updateModule = (index, field, value) => {
    setEditor((prev) => {
      const moduleRows = prev.moduleRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      );

      return withCalculatedMarks({ ...prev, moduleRows });
    });
  };

  const addModuleRow = () => {
    setEditor((prev) => {
      const moduleRows = [
        ...prev.moduleRows,
        {
          no: `${prev.moduleRows.length + 1}.`,
          title: 'New Module',
          fullMarks: '100',
          marksObtain: '80'
        }
      ];

      return withCalculatedMarks({ ...prev, moduleRows });
    });
  };

  const removeModuleRow = (index) => {
    setEditor((prev) => {
      const moduleRows = prev.moduleRows.filter((_, rowIndex) => rowIndex !== index);

      return withCalculatedMarks({ ...prev, moduleRows });
    });
  };

  const openNewEditor = () => {
    setEditingId(null);
    setEditor(makeDummyCertificate());
    setEditorOpen(true);
  };

  const openEditorFromCertificate = (certificate) => {
    setEditingId(certificate._id);
    setEditor(getCertificateData(certificate));
    setEditorOpen(true);
  };

  const selectStudentForEditor = (studentId) => {
    const student = students.find((item) => item._id === studentId);

    setEditor((prev) => ({
      ...prev,
      student: studentId || '',
      studentName: student?.name || prev.studentName,
      fatherName: student?.fatherName || prev.fatherName,
      gender: student?.gender || prev.gender,
      regNo: student?.regNo || prev.regNo,
      birthDateText: student?.dob ? dayjs(student.dob).format('DD MMMM YYYY') : prev.birthDateText
    }));
  };

  const buildPayload = () => {
    const calculatedEditor = withCalculatedMarks(editor);

    const payload = {
      ...calculatedEditor,
      issueDate: calculatedEditor.issueDate?.toISOString
        ? calculatedEditor.issueDate.toISOString()
        : dayjs().toISOString(),
      remarks: calculatedEditor.duration,
      moduleRows: calculatedEditor.moduleRows.map((row) => ({
        no: row.no || '',
        title: row.title || '',
        fullMarks: row.fullMarks || '',
        marksObtain: row.marksObtain || ''
      }))
    };

    delete payload._id;
    delete payload.certificateNo;

    if (!payload.student) {
      delete payload.student;
    }

    return payload;
  };

  const saveCertificate = async () => {
    if (!editor.studentName?.trim()) {
      message.error('Student name is required');
      return;
    }

    if (!editor.courseTitle?.trim()) {
      message.error('Course title is required');
      return;
    }

    try {
      const payload = buildPayload();

      const { data } = editingId
        ? await api.put(`/certificates/${editingId}`, payload)
        : await api.post('/certificates', payload);

      message.success(editingId ? 'Certificate updated' : 'Certificate generated');

      setSelected(data);
      setEditorOpen(false);
      setSearch('');
      await load('');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Certificate save failed');
    }
  };

  const deleteCertificate = async (certificate) => {
    try {
      await api.delete(`/certificates/${certificate._id}`);
      message.success('Certificate deleted');

      if (selected?._id === certificate._id) {
        setSelected(null);
      }

      await load(search);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Certificate delete failed');
    }
  };

const printCertificate = async (targetRef = certRef) => {
  if (!targetRef.current) return;

  const exportWrapper = document.createElement('div');

  exportWrapper.style.cssText = `
    position: fixed;
    left: -100000px;
    top: 0;
    width: 1122px;
    height: 794px;
    background: #ffffff;
    overflow: hidden;
    z-index: -9999;
    opacity: 1;
    pointer-events: none;
  `;

  exportWrapper.innerHTML = `
    <style>
      ${CERTIFICATE_STYLES}

      .classic-certificate-wrap {
        width: 1122px !important;
        height: 794px !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        background: #ffffff !important;
      }

      .classic-certificate {
        width: 1122px !important;
        height: 794px !important;
        margin: 0 !important;
        border: 0 !important;
        box-shadow: none !important;
        transform: none !important;
      }

      .editable-cert-field {
        outline: 0 !important;
      }
    </style>

    <div class="classic-certificate-wrap">
      ${targetRef.current.outerHTML}
    </div>
  `;

  document.body.appendChild(exportWrapper);

  try {
    const certificateNode = exportWrapper.querySelector('.classic-certificate');

    const images = Array.from(exportWrapper.querySelectorAll('img'));

    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(certificateNode, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1122,
      height: 794,
      windowWidth: 1400,
      windowHeight: 900,
      scrollX: 0,
      scrollY: 0
    });

    const imageData = canvas.toDataURL('image/jpeg', 1.0);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    pdf.addImage(imageData, 'JPEG', 0, 0, 297, 210);

    const studentName =
      certificateNode.querySelector('.classic-highlight')?.textContent?.trim() || 'Student';

    const safeName = studentName.replace(/[^a-z0-9]/gi, '_');

    pdf.save(`BIIT_Certificate_${safeName}.pdf`);
  } catch (error) {
    console.error(error);
    message.error('PDF generate failed. Please try again.');
  } finally {
    document.body.removeChild(exportWrapper);
  }
};

const columns = [
  { title: 'Certificate No.', dataIndex: 'certificateNo', width: 180 },
  {
    title: 'Student',
    width: 230,
    render: (_, row) => {
      const data = getCertificateData(row);

      return (
        <div>
          <strong>{data.studentName}</strong>
          <br />
          <span className="muted-text">{data.regNo}</span>
        </div>
      );
    }
  },
  { title: 'Course', dataIndex: 'courseTitle', width: 330 },
  {
    title: 'Grade',
    dataIndex: 'grade',
    width: 90,
    render: (grade) => <Tag color="gold">{grade}</Tag>
  },
  {
    title: 'Issue Date',
    dataIndex: 'issueDate',
    width: 145,
    render: (date) => dayjs(date).format('DD MMM YYYY')
  },
  {
    title: 'Action',
    width: 245,
    render: (_, row) => (
      <Space>
        <Button icon={<FiAward />} onClick={() => setSelected(row)}>
          Preview
        </Button>

        <Button icon={<FiEdit3 />} onClick={() => openEditorFromCertificate(row)}>
          Edit
        </Button>

        <Popconfirm
          title="Delete this certificate?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteCertificate(row)}
        >
          <Button danger icon={<FiTrash2 />} />
        </Popconfirm>
      </Space>
    )
  }
];

  const selectedData = selected ? getCertificateData(selected) : null;

  return (
    <div>
      <style>{CERTIFICATE_STYLES}</style>

      <PageHeader
        icon={<FiAward />}
        title="Certificates"
        subtitle="Generate, click, edit, print, and save classic BIIT certificates"
        actionText="Generate Certificate"
        actionIcon={<FiPlus />}
        onAction={openNewEditor}
      />

      {selectedData && (
        <Card className="content-card" bordered={false}>
          <div className="section-toolbar">
            <strong>Certificate Preview — {selectedData.certificateNo}</strong>

            <Space wrap>
              <Button
                icon={<FiEdit3 />}
                onClick={() => openEditorFromCertificate(selected)}
              >
                Edit This Certificate
              </Button>

              <Button
                type="primary"
                icon={<FiPrinter />}
                onClick={() => printCertificate(certRef)}
              >
                Print / Save PDF
              </Button>
            </Space>
          </div>

          <div
            className="classic-certificate-wrap"
            title="Double click certificate to edit"
            onDoubleClick={() => openEditorFromCertificate(selected)}
          >
            <ClassicCertificate ref={certRef} data={selectedData} />
          </div>
        </Card>
      )}

      <Card
        className="content-card"
        bordered={false}
        title="Certificate Records"
      >
        <div className="section-toolbar compact-toolbar">
          <Space wrap>
            <Input.Search
              allowClear
              enterButton={<FiSearch />}
              placeholder="Search certificate, student, reg no, course..."
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                load(value);
              }}
              onSearch={(value) => {
                setSearch(value);
                load(value);
              }}
              className="live-search-input"
              style={{ width: 340 }}
            />

            <Button
              onClick={() => {
                setSearch("");
                load("");
              }}
            >
              Reset
            </Button>
          </Space>
        </div>

        {loading ? (
          <ShimmerTable columns={6} rows={7} />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={certificates}
            scroll={{ x: "max-content" }}
            tableLayout="auto"
            onRow={(record) => ({
              onClick: () => setSelected(record),
              onDoubleClick: () => openEditorFromCertificate(record),
            })}
          />
        )}
      </Card>

      <Modal
        title={
          editingId
            ? "Edit Certificate Like Document"
            : "Generate Dummy Certificate"
        }
        open={editorOpen}
        onCancel={() => setEditorOpen(false)}
        width="96vw"
        style={{ top: 18 }}
        footer={[
          <Button key="cancel" onClick={() => setEditorOpen(false)}>
            Cancel
          </Button>,
          // <Button
          //   key="print"
          //   icon={<FiPrinter />}
          //   onClick={() => printCertificate(editorCertRef)}
          // >
          //   Print Preview
          // </Button>,
          <Button
            key="save"
            type="primary"
            icon={<FiSave />}
            onClick={saveCertificate}
          >
            {editingId ? "Update Certificate" : "Save Certificate"}
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="certificate-editor-grid">
          <div className="certificate-editor-form">
            <label className="editor-field-label">
              Select Existing Student Optional
            </label>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Optional: select student"
              value={editor.student || undefined}
              onChange={(value) => selectStudentForEditor(value || "")}
              options={students.map((student) => ({
                value: student._id,
                label: `${student.name} - ${student.regNo}`,
              }))}
              style={{ width: "100%" }}
            />

            <label className="editor-field-label">Student Name</label>
            <Input
              value={editor.studentName}
              onChange={(event) =>
                updateEditor("studentName", event.target.value)
              }
            />

            <label className="editor-field-label">Father Name</label>
            <Input
              value={editor.fatherName}
              onChange={(event) =>
                updateEditor("fatherName", event.target.value)
              }
            />

            <label className="editor-field-label">Gender</label>
            <Select
              value={editor.gender}
              onChange={(value) => updateEditor("gender", value)}
              options={[
                { value: "Male" },
                { value: "Female" },
                { value: "Other" },
              ]}
              style={{ width: "100%" }}
            />

            <label className="editor-field-label">Reg No</label>
            <Input
              value={editor.regNo}
              onChange={(event) => updateEditor("regNo", event.target.value)}
            />

            <label className="editor-field-label">Date of Birth Text</label>
            <Input
              value={editor.birthDateText}
              onChange={(event) =>
                updateEditor("birthDateText", event.target.value)
              }
            />

            <label className="editor-field-label">Course Title</label>
            <Input
              value={editor.courseTitle}
              onChange={(event) =>
                updateEditor("courseTitle", event.target.value)
              }
            />

            <label className="editor-field-label">Duration / Hours</label>
            <Input
              value={editor.duration}
              onChange={(event) => updateEditor("duration", event.target.value)}
            />

            <label className="editor-field-label">Grade</label>
            <Select
              value={editor.grade}
              onChange={(value) => updateEditor("grade", value)}
              options={[
                { value: "A+" },
                { value: "A" },
                { value: "B+" },
                { value: "B" },
                { value: "C" },
              ]}
              style={{ width: "100%" }}
            />

            <label className="editor-field-label">Issue Date</label>
            <DatePicker
              className="full-width"
              value={editor.issueDate}
              format="DD MMM YYYY"
              onChange={(value) => {
                updateEditor("issueDate", value || dayjs());
                updateEditor(
                  "issueDateText",
                  (value || dayjs()).format("DD/MM/YY"),
                );
              }}
            />

            <label className="editor-field-label">Issue Date Text</label>
            <Input
              value={editor.issueDateText}
              onChange={(event) =>
                updateEditor("issueDateText", event.target.value)
              }
            />

            <label className="editor-field-label">Percentage Auto Calculated</label>
            <Input value={`${editor.percentage}%`} readOnly />

            <label className="editor-field-label">Total Full Marks Auto Calculated</label>
            <Input value={editor.totalFullMarks} readOnly />

            <label className="editor-field-label">Total Marks Obtain Auto Calculated</label>
            <Input value={editor.totalMarksObtain} readOnly />

            <label className="editor-field-label">Institute Name</label>
            <Input
              value={editor.instituteName}
              onChange={(event) =>
                updateEditor("instituteName", event.target.value)
              }
            />

            <label className="editor-field-label">Office Address</label>
            <Input
              value={editor.officeAddress}
              onChange={(event) =>
                updateEditor("officeAddress", event.target.value)
              }
            />

            <label className="editor-field-label">Website</label>
            <Input
              value={editor.website}
              onChange={(event) => updateEditor("website", event.target.value)}
            />

            <label className="editor-field-label">Module Details</label>
            {editor.moduleRows.map((row, index) => (
              <div className="module-editor-row" key={`${row.no}-${index}`}>
                <Input
                  value={row.no}
                  onChange={(event) =>
                    updateModule(index, "no", event.target.value)
                  }
                />
                <Input
                  value={row.title}
                  onChange={(event) =>
                    updateModule(index, "title", event.target.value)
                  }
                />
                <Input
                  value={row.fullMarks}
                  onChange={(event) =>
                    updateModule(index, "fullMarks", event.target.value)
                  }
                />
                <Input
                  value={row.marksObtain}
                  onChange={(event) =>
                    updateModule(index, "marksObtain", event.target.value)
                  }
                />
                <Button
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => removeModuleRow(index)}
                />
              </div>
            ))}

            <Button block onClick={addModuleRow}>
              Add Module Row
            </Button>
          </div>

          <div className="classic-certificate-wrap">
            <ClassicCertificate
              ref={editorCertRef}
              data={editor}
              editable
              onEditField={updateEditor}
              onEditModule={updateModule}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}