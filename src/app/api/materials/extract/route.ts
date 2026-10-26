import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name || 'document.pdf';

    // 1. Text/Markdown handling
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || file.type.startsWith('text/')) {
      const text = buffer.toString('utf-8');
      return NextResponse.json({
        success: true,
        text,
        pages: [{ text, num: 1 }],
        totalPages: 1,
      });
    }

    // 2. Real PDF parsing via PDFParse
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();

      const rawPages = (result as any).pages || [];
      const pages = rawPages.map((p: any) => ({
        text: p.text || '',
        num: p.num || 1,
      }));

      const fullText = (result as any).text || pages.map((p: any) => p.text).join('\n\n');

      return NextResponse.json({
        success: true,
        text: fullText,
        pages: pages.length > 0 ? pages : [{ text: fullText, num: 1 }],
        totalPages: (result as any).total || pages.length || 1,
      });
    } catch (pdfErr: any) {
      console.warn('PDFParse extraction error, falling back to stream decoding:', pdfErr);
      // Fallback: extract printable strings from buffer
      const rawString = buffer.toString('binary');
      const textMatches = rawString.match(/[A-Za-z0-9\s.,!?:;\-()'"\/]{4,}/g);
      const extractedFallback = textMatches ? textMatches.join(' ').slice(0, 5000) : '';

      return NextResponse.json({
        success: true,
        text: extractedFallback,
        pages: [{ text: extractedFallback, num: 1 }],
        totalPages: 1,
      });
    }
  } catch (err: any) {
    console.error('API Extract Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to extract text from document' },
      { status: 500 }
    );
  }
}
