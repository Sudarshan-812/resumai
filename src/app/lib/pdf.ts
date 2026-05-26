interface PDFTextItem {
  str: string;
  transform: number[];
}

interface PDFPageData {
  getTextContent: () => Promise<{ items: PDFTextItem[] }>;
}

export const render_page = (pageData: PDFPageData) => {
  return pageData
    .getTextContent()
    .then(({ items }) => {
      let lastY: number | null = null;
      let text = "";
      for (const item of items) {
        const y = item.transform[5];
        if (lastY !== y && lastY !== null) text += "\n";
        lastY = y;
        text += item.str;
      }
      return text;
    })
    .catch(() => "");
};
