/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { DiagnosticDocument, PanelDiagnosticDocument } from './PDFDocument';

export default function PDFDownloadButton({ sessionData, evaluations, history, report, transcript }: any) {
  const isPanel = !!report;

  const doc = isPanel 
    ? <PanelDiagnosticDocument report={report} transcript={transcript} />
    : <DiagnosticDocument sessionData={sessionData} evaluations={evaluations} history={history} />;
  
  const fileName = isPanel
    ? `Panel_Interview_Report.pdf`
    : `${sessionData?.name?.replace(/ /g, '_') || 'Candidate'}_Diagnostics.pdf`;

  return (
    <PDFDownloadLink
      document={doc}
      fileName={fileName}
      className="premium-btn inline-flex items-center"
    >
      {({ loading }) =>
        loading ? 'Compiling PDF Data...' : <><Download className="w-5 h-5 mr-2" /> Download Diagnostic Report</>
      }
    </PDFDownloadLink>
  );
}
