import pdfParse from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  if (!buffer) {
    throw new Error("PDF file buffer is required.");
  }

  const pdfData = await pdfParse(buffer);
  return pdfData.text?.trim() || "";
};
