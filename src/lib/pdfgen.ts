import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export interface GeneratePdfOptions {
  certNumber: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  qrDataUrl: string;
}

function formatMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// In-memory caches for maximum performance
let cachedBaseTemplateBytes: Uint8Array | null = null;
let fontCinzelBoldBytes: Buffer | null = null;
let fontCinzelDecoBytes: Buffer | null = null;
let fontMontserratRegularBytes: Buffer | null = null;
let fontMontserratBoldBytes: Buffer | null = null;
let fontMontserratMediumBytes: Buffer | null = null;

function loadFonts() {
  if (!fontCinzelBoldBytes) {
    const fontDir = path.join(process.cwd(), 'public', 'fonts');
    fontCinzelBoldBytes = fs.readFileSync(path.join(fontDir, 'Cinzel-Bold.ttf'));
    fontCinzelDecoBytes = fs.readFileSync(path.join(fontDir, 'CinzelDecorative-Bold.ttf'));
    fontMontserratRegularBytes = fs.readFileSync(path.join(fontDir, 'Montserrat-Regular.ttf'));
    fontMontserratBoldBytes = fs.readFileSync(path.join(fontDir, 'Montserrat-Bold.ttf'));
    fontMontserratMediumBytes = fs.readFileSync(path.join(fontDir, 'Montserrat-Medium.ttf'));
  }
}

/**
 * Builds or retrieves the pre-rendered high-resolution base PDF template.
 * Caches all static logos, layout lines, and static headings to avoid re-rendering
 * heavy bitmap assets repeatedly.
 */
async function getBaseTemplatePdf(): Promise<Uint8Array> {
  if (cachedBaseTemplateBytes) {
    return cachedBaseTemplateBytes;
  }

  loadFonts();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Standard A4 Landscape: 842 x 595 points
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const fontCinzelBold = await pdfDoc.embedFont(fontCinzelBoldBytes!);
  const fontMontserratBold = await pdfDoc.embedFont(fontMontserratBoldBytes!);
  const fontMontserratMedium = await pdfDoc.embedFont(fontMontserratMediumBytes!);

  // Asset paths
  const assetsDir = path.join(process.cwd(), 'public', 'certificate-assets');
  const templatePath = path.join(assetsDir, 'template.png');
  const startupPath = path.join(assetsDir, 'startupindia.png');
  const pramanPath = path.join(assetsDir, 'praman-black.png');
  const msmePath = path.join(assetsDir, 'msme.png');
  const signaturePath = path.join(assetsDir, 'signature.png');
  const trademarkPath = path.join(assetsDir, 'trademark.png');

  // 1. Master Blank Canvas Background Layer
  if (fs.existsSync(templatePath)) {
    const templateBytes = fs.readFileSync(templatePath);
    const templateImage = await pdfDoc.embedPng(templateBytes);
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  // 2. Top Header Logos
  // (A) #startupindia (Left)
  if (fs.existsSync(startupPath)) {
    const siBytes = fs.readFileSync(startupPath);
    const siImage = await pdfDoc.embedPng(siBytes);
    const siW = 144;
    const siH = (siW / siImage.width) * siImage.height;
    page.drawImage(siImage, {
      x: 100,
      y: height - 105,
      width: siW,
      height: siH,
    });
  }

  // (B) Authentic Real Black PRAMAN Logo (Center)
  if (fs.existsSync(pramanPath)) {
    const pramanBytes = fs.readFileSync(pramanPath);
    const pramanImage = await pdfDoc.embedPng(pramanBytes);
    const pramanW = 158;
    const pramanH = (pramanW / pramanImage.width) * pramanImage.height;
    page.drawImage(pramanImage, {
      x: (width - pramanW) / 2,
      y: height - 104,
      width: pramanW,
      height: pramanH,
    });
  }

  // (C) MSME Logo (Right)
  if (fs.existsSync(msmePath)) {
    const msmeBytes = fs.readFileSync(msmePath);
    const msmeImage = await pdfDoc.embedPng(msmeBytes);
    const msmeW = 131;
    const msmeH = (msmeW / msmeImage.width) * msmeImage.height;
    page.drawImage(msmeImage, {
      x: width - 100 - msmeW,
      y: height - 108,
      width: msmeW,
      height: msmeH,
    });
  }

  // 3. Main Headings
  // Title: CERTIFICATE in Cinzel Bold
  const mainTitle = 'CERTIFICATE';
  const mainTitleSize = 39;
  const mainTitleWidth = fontCinzelBold.widthOfTextAtSize(mainTitle, mainTitleSize);
  page.drawText(mainTitle, {
    x: (width - mainTitleWidth) / 2,
    y: height - 156,
    size: mainTitleSize,
    font: fontCinzelBold,
    color: rgb(0.04, 0.18, 0.2),
  });

  // Subtitle: OF COMPLETION in Montserrat Bold
  const subTitle = 'OF COMPLETION';
  const subTitleSize = 14.5;
  const subTitleWidth = fontMontserratBold.widthOfTextAtSize(subTitle, subTitleSize);
  page.drawText(subTitle, {
    x: (width - subTitleWidth) / 2,
    y: height - 181,
    size: subTitleSize,
    font: fontMontserratBold,
    color: rgb(0.1, 0.2, 0.23),
  });

  // Intro: This certificate is proudly presented to
  const introText = 'This certificate is proudly presented to';
  const introSize = 11;
  const introWidth = fontMontserratMedium.widthOfTextAtSize(introText, introSize);
  page.drawText(introText, {
    x: (width - introWidth) / 2,
    y: height - 208,
    size: introSize,
    font: fontMontserratMedium,
    color: rgb(0.28, 0.38, 0.4),
  });

  // 4. Founder Signature in Bottom Center
  if (fs.existsSync(signaturePath)) {
    const sigBytes = fs.readFileSync(signaturePath);
    const sigImage = await pdfDoc.embedPng(sigBytes);
    const sigWidth = 124;
    const sigHeight = (sigWidth / sigImage.width) * sigImage.height;
    const sigX = (width - sigWidth) / 2;
    page.drawImage(sigImage, {
      x: sigX,
      y: 104,
      width: sigWidth,
      height: sigHeight,
    });
  }

  // Founder underline & title
  const sigLineWidth = 160;
  const sigLineX = (width - sigLineWidth) / 2;
  page.drawLine({
    start: { x: sigLineX, y: 98 },
    end: { x: sigLineX + sigLineWidth, y: 98 },
    thickness: 1,
    color: rgb(0.62, 0.74, 0.77),
  });

  const signerName = 'Rahul Chaudhary';
  const signerNameWidth = fontMontserratBold.widthOfTextAtSize(signerName, 12);
  page.drawText(signerName, {
    x: (width - signerNameWidth) / 2,
    y: 82,
    size: 12,
    font: fontMontserratBold,
    color: rgb(0.1, 0.34, 0.42),
  });

  const signerRole = 'Founder';
  const signerRoleWidth = fontMontserratMedium.widthOfTextAtSize(signerRole, 9);
  page.drawText(signerRole, {
    x: (width - signerRoleWidth) / 2,
    y: 68,
    size: 9,
    font: fontMontserratMedium,
    color: rgb(0.32, 0.42, 0.45),
  });

  // 5. Enlarged Praman Trademark Seal at Bottom Right
  if (fs.existsSync(trademarkPath)) {
    const tmBytes = fs.readFileSync(trademarkPath);
    const tmImage = await pdfDoc.embedPng(tmBytes);
    const tmSize = 106;
    const tmX = width - 100 - tmSize;
    page.drawImage(tmImage, {
      x: tmX,
      y: 56,
      width: tmSize,
      height: tmSize,
    });
  }

  cachedBaseTemplateBytes = await pdfDoc.save({ useObjectStreams: false });
  return cachedBaseTemplateBytes;
}

export async function generateCertificatePdf({
  certNumber,
  name,
  role,
  startDate,
  endDate,
  issueDate,
  qrDataUrl,
}: GeneratePdfOptions): Promise<Uint8Array> {
  const baseTemplateBytes = await getBaseTemplatePdf();

  // Fast clone of the base document in memory
  const pdfDoc = await PDFDocument.load(baseTemplateBytes);
  pdfDoc.registerFontkit(fontkit);

  loadFonts();
  const fontName = await pdfDoc.embedFont(fontCinzelDecoBytes!, { subset: true });
  const fontMontserratBold = await pdfDoc.embedFont(fontMontserratBoldBytes!, { subset: true });
  const fontMontserratMedium = await pdfDoc.embedFont(fontMontserratMediumBytes!, { subset: true });

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // 1. Certificate ID at Top-Left
  const certIdPrefix = 'Certificate ID: ';
  const certIdTotal = `${certIdPrefix}${certNumber}`;
  page.drawText(certIdTotal, {
    x: 100,
    y: height - 66,
    size: 9.5,
    font: fontMontserratBold,
    color: rgb(0.04, 0.22, 0.24),
  });

  // 2. Candidate Name in Cinzel Decorative
  const candidateName = name.trim();
  const nameSize = 46;
  const nameWidth = fontName.widthOfTextAtSize(candidateName, nameSize);
  page.drawText(candidateName, {
    x: (width - nameWidth) / 2,
    y: height - 275,
    size: nameSize,
    font: fontName,
    color: rgb(0.16, 0.46, 0.54),
  });

  // 3. Body Description in Montserrat
  const part1 = 'For successfully completing the "';
  const part2 = role;
  const part3 = ' at ';
  const part4 = 'Praman Network';
  const part5 = '"';

  const sz1 = 12;
  const w1 = fontMontserratMedium.widthOfTextAtSize(part1, sz1);
  const w2 = fontMontserratBold.widthOfTextAtSize(part2, sz1);
  const w3 = fontMontserratMedium.widthOfTextAtSize(part3, sz1);
  const w4 = fontMontserratBold.widthOfTextAtSize(part4, sz1);
  const w5 = fontMontserratMedium.widthOfTextAtSize(part5, sz1);
  const totalLine1Width = w1 + w2 + w3 + w4 + w5;

  let curX = (width - totalLine1Width) / 2;
  const line1Y = height - 338;

  page.drawText(part1, { x: curX, y: line1Y, size: sz1, font: fontMontserratMedium, color: rgb(0.1, 0.16, 0.18) });
  curX += w1;
  page.drawText(part2, { x: curX, y: line1Y, size: sz1, font: fontMontserratBold, color: rgb(0.05, 0.1, 0.12) });
  curX += w2;
  page.drawText(part3, { x: curX, y: line1Y, size: sz1, font: fontMontserratMedium, color: rgb(0.1, 0.16, 0.18) });
  curX += w3;
  page.drawText(part4, { x: curX, y: line1Y, size: sz1, font: fontMontserratBold, color: rgb(0.05, 0.1, 0.12) });
  curX += w4;
  page.drawText(part5, { x: curX, y: line1Y, size: sz1, font: fontMontserratMedium, color: rgb(0.1, 0.16, 0.18) });

  const startFmt = formatMonthYear(startDate);
  const endFmt = formatMonthYear(endDate);
  const dateRangeStr = startFmt && endFmt ? `${startFmt} and ${endFmt}` : `${startDate} to ${endDate}`;

  const bodyLine2 = `held between ${dateRangeStr}. Your effort during the internship have not only`;
  const body2Width = fontMontserratMedium.widthOfTextAtSize(bodyLine2, 11);
  page.drawText(bodyLine2, {
    x: (width - body2Width) / 2,
    y: height - 359,
    size: 11,
    font: fontMontserratMedium,
    color: rgb(0.14, 0.22, 0.24),
  });

  const bodyLine3 = 'contributed to our success but also reflected your readiness for greater responsibilities.';
  const body3Width = fontMontserratMedium.widthOfTextAtSize(bodyLine3, 11);
  page.drawText(bodyLine3, {
    x: (width - body3Width) / 2,
    y: height - 377,
    size: 11,
    font: fontMontserratMedium,
    color: rgb(0.14, 0.22, 0.24),
  });

  // 4. Date of Issue
  const formattedIssueDate = formatFullDate(issueDate) || issueDate;
  const dateLine = `Date: ${formattedIssueDate}`;
  const dateWidth = fontMontserratBold.widthOfTextAtSize(dateLine, 12.5);
  page.drawText(dateLine, {
    x: (width - dateWidth) / 2,
    y: height - 416,
    size: 12.5,
    font: fontMontserratBold,
    color: rgb(0.05, 0.1, 0.12),
  });

  // 5. QR Code
  if (qrDataUrl) {
    try {
      const qrBase64 = qrDataUrl.includes(',') ? qrDataUrl.split(',')[1] : qrDataUrl;
      const qrImageBytes = Buffer.from(qrBase64, 'base64');
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      const qrSize = 68;
      const qrX = 100;
      const qrY = 74;

      page.drawRectangle({
        x: qrX - 4,
        y: qrY - 4,
        width: qrSize + 8,
        height: qrSize + 8,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.8, 0.88, 0.9),
        borderWidth: 1,
      });

      page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });

      const qrCaption = 'Scan to verify';
      const capWidth = fontMontserratBold.widthOfTextAtSize(qrCaption, 7.5);
      page.drawText(qrCaption, {
        x: qrX + (qrSize - capWidth) / 2,
        y: qrY - 13,
        size: 7.5,
        font: fontMontserratBold,
        color: rgb(0.14, 0.36, 0.42),
      });
    } catch (e) {
      console.error('Failed to embed QR image in PDF:', e);
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  // Cache generated PDF to disk asynchronously
  try {
    const outDir = path.join(process.cwd(), 'generated');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, `${certNumber}.pdf`);
    fs.writeFileSync(outPath, pdfBytes);
  } catch (err) {
    console.error('Failed to write PDF to disk:', err);
  }

  return pdfBytes;
}
