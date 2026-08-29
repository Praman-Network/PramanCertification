import QRCode from 'qrcode';

export async function generateQrForCertificate(certNumber: string): Promise<{ verifyUrl: string; dataUrl: string }> {
  const baseUrl = process.env.VERIFY_BASE_URL || 'http://localhost:3000/verify';
  const verifyUrl = `${baseUrl}?certId=${encodeURIComponent(certNumber)}`;
  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 320,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return { verifyUrl, dataUrl };
}
