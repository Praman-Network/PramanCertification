import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { checkRequestAdminAuth } from '@/lib/auth';
import { generateOneCertificate } from '@/lib/cert-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const isAuth = await checkRequestAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let internList: Array<{
      name: string;
      email?: string;
      role: string;
      startDate: string;
      endDate: string;
    }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No CSV file provided in upload' }, { status: 400 });
      }

      const fileText = await file.text();
      const records = parse(fileText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      internList = records.map((r: any) => ({
        name: r.name || r.Name || '',
        email: r.email || r.Email || '',
        role: r.role || r.Role || '',
        startDate: r.startDate || r.start_date || r.StartDate || '',
        endDate: r.endDate || r.end_date || r.EndDate || '',
      }));
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      if (Array.isArray(json.interns)) {
        internList = json.interns;
      } else {
        return NextResponse.json({ error: 'Invalid JSON payload. Expected { interns: [...] }' }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (!internList || internList.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV/input' }, { status: 400 });
    }

    const results: Array<{
      row: number;
      name: string;
      certNumber: string;
      qrDataUrl: string;
      pdfUrl: string;
    }> = [];

    const errors: Array<{
      row: number;
      name: string;
      error: string;
    }> = [];

    for (let i = 0; i < internList.length; i++) {
      const intern = internList[i];
      try {
        const res = await generateOneCertificate({
          name: intern.name,
          email: intern.email,
          role: intern.role,
          startDate: intern.startDate,
          endDate: intern.endDate,
        });
        results.push({
          row: i + 1,
          name: intern.name,
          ...res,
        });
      } catch (err: any) {
        errors.push({
          row: i + 1,
          name: intern.name || `Row ${i + 1}`,
          error: err.message || 'Validation or generation error',
        });
      }
    }

    return NextResponse.json(
      {
        message: `Processed ${internList.length} rows (${results.length} succeeded, ${errors.length} failed)`,
        succeeded: results.length,
        failed: errors.length,
        results,
        errors,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Bulk generation error:', error);
    return NextResponse.json({ error: 'Bulk generation failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
