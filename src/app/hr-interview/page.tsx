"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const HRInterviewComponent = dynamic(
  () => import('./HRInterviewComponent'),
  { ssr: false }
);

export default function HRInterviewPage() {
  return <HRInterviewComponent />;
}
