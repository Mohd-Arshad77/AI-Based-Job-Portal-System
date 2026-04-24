import pdfParse from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  if (!buffer) {
    throw new Error("PDF file buffer is required.");
  }

  const pdfData = await pdfParse(buffer);

  if (pdfData && pdfData.text) {
    return pdfData.text.trim();
  } else {
    return ""; 
  }
};