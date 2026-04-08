import pdfPkg from 'pdf-parse';

const pdf: (data: Buffer) => Promise<{ text: string }> = (pdfPkg as any)?.default ?? (pdfPkg as any);

export const parseResume = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (typeof pdf !== 'function') {
      throw new Error('pdf-parse is not callable.');
    }

    const data = await pdf(buffer);

    const cleanText = (data.text || '')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/ {2,}/g, ' ')
      .trim();

    return cleanText;
  } catch (error) {
    throw error;
  }
};
