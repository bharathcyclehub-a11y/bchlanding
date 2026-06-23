/**
 * Viper pre-booking PDF receipt / pay slip.
 *
 * Generated client-side with jsPDF (lazy-loaded only when the customer taps
 * "Download Receipt", so it never weighs down the landing page). Branded with
 * the BCH logo + business details, with the random booking ID prominent.
 *
 * Note: jsPDF's default Helvetica has no ₹ glyph, so amounts use "Rs.".
 */

const BRAND = {
  name: 'Bharath Cycle Hub',
  address: 'Chikka Bommasandra, Yelahanka, Bengaluru, Karnataka 560064',
  phone: '+91 88920 31480',
  email: 'bharathcyclehub@gmail.com',
  logo: '/BCHwebsitelogo.png',
  watermark: '/bchvideowatermarkredandwhite.png',
  red: [220, 38, 38],
  dark: [26, 26, 26],
  gray: [110, 110, 110],
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * @param {Object} info
 * @param {string} info.bookingId   e.g. "VPR-7K3F-9QXM"
 * @param {string} [info.paymentId] Razorpay payment id
 * @param {string} info.name        customer name
 * @param {string} [info.childName] rider/child name
 * @param {string} info.buyingFor   'child' | 'self'
 * @param {number} [info.amount]    rupees (default 999)
 * @param {string} [info.dateStr]   formatted date
 */
export async function downloadViperReceipt(info) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const cx = W / 2;
  const amount = info.amount || 999;
  const dateStr = info.dateStr || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Top accent bar
  doc.setFillColor(...BRAND.red);
  doc.rect(0, 0, W, 6, 'F');

  // Faint centered background watermark — drawn first so content sits on top
  try {
    const wm = await loadImage(BRAND.watermark);
    const wmW = 115;
    const wmH = wmW * (wm.naturalHeight / wm.naturalWidth);
    doc.setGState(new doc.GState({ opacity: 0.06 }));
    doc.addImage(wm, 'PNG', cx - wmW / 2, 150 - wmH / 2, wmW, wmH);
    doc.setGState(new doc.GState({ opacity: 1 }));
  } catch { /* watermark optional */ }

  // Logo (centered) — skip gracefully if it fails to load
  let y = 16;
  try {
    const img = await loadImage(BRAND.logo);
    const maxW = 55;
    const h = maxW * (img.naturalHeight / img.naturalWidth);
    doc.addImage(img, 'PNG', cx - maxW / 2, y, maxW, h);
    y += h + 4;
  } catch {
    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...BRAND.dark);
    doc.text(BRAND.name.toUpperCase(), cx, y + 6, { align: 'center' });
    y += 14;
  }

  // Business details
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...BRAND.gray);
  doc.text(BRAND.address, cx, y, { align: 'center' }); y += 4.5;
  doc.text(`${BRAND.phone}  |  ${BRAND.email}`, cx, y, { align: 'center' }); y += 8;

  // Title
  doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(...BRAND.red);
  doc.text('PRE-BOOKING CONFIRMATION', cx, y, { align: 'center' }); y += 3;
  doc.setDrawColor(...BRAND.red).setLineWidth(0.5);
  doc.line(cx - 45, y, cx + 45, y); y += 11;

  // "Confirmed" seal — proper vector check icon (not an emoji)
  doc.setFillColor(34, 197, 94);
  doc.circle(cx, y, 6, 'F');
  doc.setDrawColor(255, 255, 255).setLineWidth(1.2);
  doc.line(cx - 2.6, y + 0.2, cx - 0.6, y + 2.4);
  doc.line(cx - 0.6, y + 2.4, cx + 3, y - 2.6);
  y += 13;

  // Booking ID highlight box
  const boxX = 20, boxW = W - 40;
  doc.setFillColor(248, 248, 248).setDrawColor(225, 225, 225).setLineWidth(0.3);
  doc.roundedRect(boxX, y, boxW, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...BRAND.gray);
  doc.text('BOOKING ID', cx, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...BRAND.dark);
  doc.text(info.bookingId || '—', cx, y + 14, { align: 'center' });
  y += 26;

  // Detail rows
  const rider = info.buyingFor === 'child' && info.childName ? info.childName : null;
  const rows = [
    ['Product', 'EMotorad Viper (Kids E-Cycle)'],
    ['Customer', info.name + (rider ? `   (Rider: ${rider})` : '')],
    ['Amount paid', `Rs. ${amount}   -   PAID`],
    ['Payment ref', info.paymentId || '-'],
    ['Date', dateStr],
    ['Expected delivery', 'by 31 July 2026'],
  ];
  doc.setLineWidth(0.2).setDrawColor(230, 230, 230);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...BRAND.gray);
    doc.text(label, boxX, y);
    doc.setFont('helvetica', 'bold').setTextColor(...BRAND.dark);
    doc.text(String(value), W - 20, y, { align: 'right' });
    y += 4;
    doc.line(boxX, y, W - 20, y);
    y += 5.5;
  });

  y += 4;
  // Reservation note
  doc.setFont('helvetica', 'italic').setFontSize(9.5).setTextColor(...BRAND.dark);
  doc.text('Reserved as part of the limited batch.', cx, y, { align: 'center' }); y += 5;
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...BRAND.gray);
  doc.text('The Rs. 999 reservation is a refundable token, adjusted against the final price.', cx, y, { align: 'center' });

  // Footer
  doc.setDrawColor(225, 225, 225).setLineWidth(0.3);
  doc.line(20, 270, W - 20, 270);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...BRAND.red);
  doc.text('Thank you for choosing Bharath Cycle Hub', cx, 277, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...BRAND.gray);
  doc.text('This is a system-generated reservation receipt.', cx, 282, { align: 'center' });

  doc.save(`BCH-Viper-${info.bookingId || 'receipt'}.pdf`);
}
