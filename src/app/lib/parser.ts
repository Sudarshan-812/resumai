// src/app/lib/parser.ts
// server-only
import pdfPkg from 'pdf-parse';

// pdf-parse v2 may export a default; v1 exports the function directly.
// Normalize to a callable function:
const pdf: (data: Buffer) => Promise<{ text: string }> = (pdfPkg as any)?.default ?? (pdfPkg as any);

export const parseResume = async (file: File) => {
  try {
    console.log('parseResume: starting', file?.name, file?.size);
    const arrayBuffer = await file.arrayBuffer();
    console.log('arrayBuffer.byteLength:', arrayBuffer.byteLength);

    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer length:', buffer.length);

    if (typeof pdf !== 'function') {
      throw new Error('pdf-parse is not callable. Export shape: ' + JSON.stringify(Object.keys(pdfPkg || {})));
    }

    const data = await pdf(buffer);
    console.log('pdf-parse returned text length:', (data?.text || '').length);

    const cleanText = (data.text || '')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/ {2,}/g, ' ')
      .trim();

    return cleanText;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};
