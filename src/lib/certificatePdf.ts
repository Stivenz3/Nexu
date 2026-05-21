import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function downloadCertificatePdf(
  elementId: string,
  fileName: string
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('No se encontró el documento del certificado para exportar.')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 8
  const maxWidth = pageWidth - margin * 2
  const maxHeight = pageHeight - margin * 2

  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
  const renderWidth = imgWidth * ratio
  const renderHeight = imgHeight * ratio
  const x = (pageWidth - renderWidth) / 2
  const y = (pageHeight - renderHeight) / 2

  pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight)
  pdf.save(fileName)
}
