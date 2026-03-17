import fs from 'fs';

// Helper: build accordion table from items [{label, content}]
function buildAccordion(items) {
  const rows = [`| Accordion | |`, `| --- | --- |`];
  for (const item of items) {
    const cell = item.content.replace(/\|/g, '\\|');
    rows.push(`| ${item.label} | ${cell} |`);
  }
  return rows.join('\n');
}

// Helper: join lines as <br>-separated content, stripping leading "- "
function joinAsBr(lines) {
  return lines.map(l => l.replace(/^- /, '').trim()).filter(Boolean).join('<br>');
}

// ========================================
// 1. control-center-terms-and-conditions
// ========================================
{
  const file = '/workspace/content/en-us/about/legal/control-center-terms-and-conditions.md';
  const content = fs.readFileSync(file, 'utf8');

  const links = [
    '[General Control Center Terms and Conditions](/en-us/about/legal/general-control-center-terms-and-conditions.html)',
    '[API Developer Center Terms of Use](/en-us/about/legal/api-developer-terms-and-conditions.html)',
    '[Disconnect Terms and Conditions](/en-us/about/legal/disconnect-terms-and-conditions.html)',
  ];

  const accordion = buildAccordion([{
    label: 'Find the relevant Terms below',
    content: links.join('<br>'),
  }]);

  const newContent = content.replace(
    /- \[General Control Center.*?\n- \[API Developer.*?\n- \[Disconnect Terms.*?\n/s,
    accordion + '\n'
  );

  fs.writeFileSync(file, newContent, 'utf8');
  console.log('OK: control-center-terms-and-conditions.md');
}

// ========================================
// 2. terms-of-use-apac
// ========================================
{
  const file = '/workspace/content/en-us/about/legal/terms-of-use-apac.md';
  const content = fs.readFileSync(file, 'utf8');

  const links = [
    '[Terms of Use (India)](/en-us/about/legal/terms-of-use-india.html)',
    '[Terms of Use (Singapore)](/en-us/about/legal/terms-of-use-singapore.html)',
    '[Terms of Use (Philippines)](/en-us/about/legal/terms-of-use-philippines.html)',
  ];

  const accordion = buildAccordion([{
    label: 'Terms of Use',
    content: links.join('<br>'),
  }]);

  const newContent = content.replace(
    /- \[Terms of Use \(India\).*?\n- \[Terms of Use \(Singapore\).*?\n- \[Terms of Use \(Philippines\).*?\n/s,
    accordion + '\n'
  );

  fs.writeFileSync(file, newContent, 'utf8');
  console.log('OK: terms-of-use-apac.md');
}

// ========================================
// 3. compliance-and-audit (6 accordion items)
// ========================================
{
  const file = '/workspace/content/en-us/about/legal/trust-center/security-and-compliance/compliance-and-audit.md';
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  // Build structure: intro paragraph (line 11), then 6 sections of content
  // The intro is line index 10 (## Compliance & Audit) and line index 11 (paragraph)
  // Content sections identified by content patterns:

  // HIPAA: lines 13-21
  const hipaaContent = [
    'There is no official federal certification required to prove an organization is HIPAA compliant. Lumen‑covered entities and business associates can self‑certify their compliance, which means certifying that they comply with HIPAA regulations.',
    '<br><br>Lumen uses an external auditor to perform an assessment and evaluate our HIPAA compliance on certain products and services. The assessment was performed against the HIPAA Security Rules and Breach Notification requirements.',
    '<br><br>For compliance‑related inquiries, please contact your authorized Lumen representative. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page',
    '<br><br>- HIPAA Contact Center Services (CCS) Report – Lumen',
    '<br>- HIPAA Hosted Collaboration Solution (HCS) System Report – Lumen',
    '<br>- HIPAA Technology Solution Services Report – Lumen.',
  ].join('');

  // ISO: lines 23-25
  const isoContent = [
    '**ISO 27001:** International standard that provides a model for establishing, implementing, operating, monitoring, reviewing, maintaining, and improving an Information Security Management System (ISMS).',
    '<br><br>[ISO 27001 Certificate – Lumen](https://assets.lumen.com/is/content/Lumen/iso27001-certificate-lumen?Creativeid=b54bb9d7-6311-4aac-acac-84580992d059)',
  ].join('');

  // NIST: lines 27-29
  const nistContent = [
    'For compliance‑related inquiries, please contact your authorized Lumen representative. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page.',
    '<br><br>- NIST Federal Controls Assessment Confirmation Letter – Lumen',
  ].join('');

  // PCI: lines 31-41
  const pciContent = [
    'Lumen provides services to many level 1 and level 2 merchants, credit card processing companies and other parties who must demonstrate PCI compliance in environments that utilize Lumen services. Our customers have used third‑party qualified security assessors (QSAs) to examine their PCI compliance leveraging Lumen services. These QSAs, in turn, have submitted Reports on Compliance (ROCs) that attest to our customers\' adherence to the PCI‑DSS. Customers leveraging our existing certifications will benefit by reducing the duration and cost of their PCI audits.',
    '<br><br>Requestors may visit the Visa Global Registry of Service Providers at usa.visa.com or contact their authorized Lumen representative for confirmation of registration. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page.',
    '<br><br>For compliance‑related inquiries, please contact your authorized Lumen representative. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page',
    '<br><br>- Lumen Colocation Services PCI‑DSS ROC Letter and AOC',
    '<br>- Lumen Contact Center Solutions (CCS) PCI‑DSS ROC Letter and AOC',
    '<br>- Lumen iQ Private Port (iQPP) PCI‑DSS ROC Letter and AOC',
    '<br>- Lumen Managed Firewall and NIDS PCI‑DSS ROC Letter and AOC',
    '<br>- Lumen Managed Services Administration PCI‑DSS ROC Letter and AOC',
  ].join('');

  // SIG: lines 43-47
  const sigContent = [
    'Lumen utilizes and provides a standard response tool known as the Standardized Information Gathering (SIG) tool. The SIG questionnaire is a compilation of answers to industry information security questions which provide an insight as to how information technology and data security risks are managed across a broad spectrum of risk control areas within Lumen. As such, it addresses risk controls across 16 different risk areas. The robust set of questions contained in the SIG is reviewed and updated annually. Updates and revisions are based on referenced industry standards (FFIEC, ISO, COBIT, and PCI). New risk areas are added on a regular basis, with cloud services and mobile device security as examples of some of the more recent additions.',
    '<br><br>For compliance‑related inquiries, please contact your authorized Lumen representative. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page',
    '<br><br>- Lumen Standardized Information Gathering (SIG) tool',
  ].join('');

  // SOC: lines 49-61
  const socContent = [
    'The Lumen SOC 1 program is designed to provide customer assurance regarding controls at Lumen relevant to customers\' internal controls over financial reporting. The SOC 2 program provides customer assurance of the Lumen controls supporting the AICPA Trust Services criteria relevant to security, availability, and confidentiality (where applicable).',
    '<br><br>The SOC 1 and SOC 2 reports were prepared using the SSAE 18 Standard (Standards for Attestation Engagements No. 18) for U.S. customers and the equivalent international standards (International Standards for Assurance Engagements No. 3402 for the SOC 1 report) to meet a broad base of customer needs.',
    '<br><br>For compliance‑related inquiries, please contact your authorized Lumen representative. If you are unaware of who your representative is, please visit our [Contact Us](/en-us/contact-us.html) page',
    '<br><br>- SOC 1 Type 2 Lumen Adaptive Network Security Report',
    '<br>- SOC 1 Type 2 Lumen Colocation North America and APAC Report',
    '<br>- SOC 1 Type 2 Lumen Technology Solution Services Report',
    '<br>- SOC 2 Type 2 Lumen Adaptive Network Security Report',
    '<br>- SOC 2 Type 2 Lumen Colocation Services Report',
    '<br>- SOC 2 Type 2 Lumen Edge Compute Platform Report',
    '<br>- SOC 2 Type 2 Lumen Technology Solution Services Report',
  ].join('');

  const accordion = buildAccordion([
    { label: 'Health Insurance Portability and Accountability Act of 1996 (HIPAA)', content: hipaaContent },
    { label: 'International Organization for Standardization (ISO)', content: isoContent },
    { label: 'National Institute of Standards and Technology (NIST)', content: nistContent },
    { label: 'Payment Card Industry (PCI) Compliance', content: pciContent },
    { label: 'Standardized Information Gathering Tool (SIG)', content: sigContent },
    { label: 'System and Organization Controls (SOC)', content: socContent },
  ]);

  // Rebuild the file: keep header (lines 0-11), replace content (12-62) with accordion, keep footer (63+)
  const header = lines.slice(0, 12).join('\n');
  const footer = lines.slice(62).join('\n');

  const newContent = header + '\n\n' + accordion + '\n\n' + footer;
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('OK: compliance-and-audit.md (6 accordion items)');
}

// ========================================
// 4. legacy-company-documents (tabs + accordions)
// ========================================
{
  const file = '/workspace/content/en-us/about/legal/legacy-company-documents.md';
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  // Global Crossing has 2 accordion groups:
  // Group 1: Agreements (lines 17-18, 2 links)
  const gcAgreements = [
    '[General Terms and Conditions](https://assets.lumen.com/is/content/Lumen/gc-general-terms-conditions-apr-2011?Creativeid=c36f6935-866e-443e-8971-bcb93513c6ce)',
    '[Retail Customer Agreement](https://assets.lumen.com/is/content/Lumen/gc-retail-customer-agreement-may-2011?Creativeid=bf52d14d-d25b-4025-a9d1-73d372e1edcb)',
  ];

  // Group 2: SLAs (lines 20-77, many links)
  const gcSlaLinks = [];
  for (let i = 19; i <= 76; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('- ')) {
      gcSlaLinks.push(line.replace(/^- /, ''));
    }
  }

  const gcAccordion = buildAccordion([
    { label: 'Agreements', content: gcAgreements.join('<br>') },
    { label: 'Service Level Agreements (services ordered after April 1, 2003)', content: gcSlaLinks.join('<br>') },
  ]);

  // Savvis: lines 79-92
  const savvisColocation = [];
  for (let i = 80; i <= 82; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('- ')) savvisColocation.push(line.replace(/^- /, ''));
  }
  const savvisCdn = [];
  for (let i = 84; i <= 84; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('- ')) savvisCdn.push(line.replace(/^- /, ''));
  }
  const savvisNetwork = [];
  for (let i = 86; i <= 91; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('- ')) savvisNetwork.push(line.replace(/^- /, ''));
  }

  const savvisAccordion = buildAccordion([
    { label: 'Savvis Service Guides (End of Sale)', content: [...savvisColocation, ...savvisCdn, ...savvisNetwork].join('<br>') },
  ]);

  // Time Warner: lines 94-106
  const twLinks = [];
  for (let i = 95; i <= 105; i++) {
    const line = lines[i]?.trim();
    if (line && line.startsWith('- ')) twLinks.push(line.replace(/^- /, ''));
  }

  const twAccordion = buildAccordion([
    { label: 'Time Warner Documents', content: twLinks.join('<br>') },
  ]);

  // Rebuild the file
  const header = lines.slice(0, 16).join('\n'); // Through numbered list
  const footer = lines.slice(107).join('\n'); // Section Metadata onward

  const newContent = [
    header,
    '',
    '**Global Crossing**',
    '',
    gcAccordion,
    '',
    '**Savvis**',
    '',
    savvisAccordion,
    '',
    '**Time Warner**',
    '',
    twAccordion,
    '',
    footer,
  ].join('\n');

  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`OK: legacy-company-documents.md (GC: ${gcAgreements.length}+${gcSlaLinks.length} links, Savvis: ${savvisColocation.length + savvisCdn.length + savvisNetwork.length} links, TW: ${twLinks.length} links)`);
}

console.log('\nAll 4 pages updated with accordion blocks.');
