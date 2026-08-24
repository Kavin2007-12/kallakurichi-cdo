import { generateQRCodeMatrix } from './qrcode';
import { getCurrentLanguage } from './lang';

const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If photo failed to load, fallback to tn_logo
      if (src !== '/tn_logo.png') {
        const fallback = new Image();
        fallback.crossOrigin = 'anonymous';
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => resolve(null);
        fallback.src = '/tn_logo.png';
      } else {
        resolve(null);
      }
    };
    img.src = src;
  });
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawHeader(ctx, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(width - radius, 0);
  ctx.quadraticCurveTo(width, 0, width, radius);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
}

function drawFooterStripe(ctx, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.lineTo(width, y + height - radius);
  ctx.quadraticCurveTo(width, y + height, width - radius, y + height);
  ctx.lineTo(radius, y + height);
  ctx.quadraticCurveTo(0, y + height, 0, y + height - radius);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws an image with 'object-fit: cover' behavior inside a rounded rect
 */
function drawImageCover(ctx, img, x, y, w, h, radius = 4) {
  if (!img) return;
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const nw = img.naturalWidth || img.width || w;
  const nh = img.naturalHeight || img.height || h;
  const imgRatio = nw / nh;
  const targetRatio = w / h;

  let sw, sh, sx, sy;
  if (imgRatio > targetRatio) {
    sh = nh;
    sw = sh * targetRatio;
    sx = (nw - sw) / 2;
    sy = 0;
  } else {
    sw = nw;
    sh = sw / targetRatio;
    sx = 0;
    sy = (nh - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

/**
 * Formats standard TVK Volunteer ID Card file name:
 * Example: Gowtham-TVK-Kallakurichi-Volunteer.png
 */
export function generateCardFileName(vol) {
  const rawName = (vol?.name || 'Volunteer').trim();
  const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '').trim() || 'Volunteer';
  return `${cleanName}-TVK-Kallakurichi-Volunteer.png`;
}

function drawCenteredText(ctx, text, centerX, centerY, font, color) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, centerX - (textWidth / 2), centerY);
  ctx.restore();
}

/**
 * 100% Native 2D Canvas Exporter for TVK Volunteer ID Card
 * Pixel-for-pixel match with web preview, zero CSS bugs, instant 2.5x HD export.
 */
export async function exportVolunteerCardCanvas(vol, customFileName = null) {
  if (!vol) return false;

  const fileName = customFileName || generateCardFileName(vol);

  const isTa = getCurrentLanguage() === 'ta';
  const volName = vol.name || 'Volunteer Name';
  const volBlood = vol.bloodGroup || vol.bloodgroup || vol.blood_group || vol.blood || 'O+';
  const volAge = vol.age || vol.Age || '24';
  const volDistrict = isTa ? 'கள்ளக்குறிச்சி' : 'Kallakurichi';
  const rawConst = (vol.constituency || vol.taluk || 'Chinnasalem').toString().toLowerCase();
  
  let volConstituency = isTa ? 'சின்னசேலம்' : 'Chinnasalem';
  if (rawConst.includes('kalla') || rawConst.includes('கல்ல') || rawConst.includes('கள்ள')) {
    volConstituency = isTa ? 'கள்ளக்குறிச்சி' : 'Kallakurichi';
  } else if (rawConst.includes('ulundur') || rawConst.includes('உளுந்தூர்')) {
    volConstituency = isTa ? 'உளுந்தூர்பேட்டை' : 'Ulundurpet';
  } else if (rawConst.includes('rishi') || rawConst.includes('ரிஷி')) {
    volConstituency = isTa ? 'ரிஷிவந்தியம்' : 'Rishivandiyam';
  } else if (rawConst.includes('sankara') || rawConst.includes('சங்கரா')) {
    volConstituency = isTa ? 'சங்கராபுரம்' : 'Sankarapuram';
  }

  const volId = vol.id || 'TVK-VOL-0001';
  const volPhotoUrl = vol.image || vol.photo || '/tn_logo.png';
  const footerAddress = isTa 
    ? '📍 கள்ளக்குறிச்சி தொகுதி, தமிழ்நாடு - 606202' 
    : '📍 Kallakurichi Constituency, Tamil Nadu - 606202';

  // Card dimensions (Native: 680x390, Export: 2.5x HD = 1700x975)
  const W = 680;
  const H = 390;
  const scale = 2.5;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);

  // 1. Base Card Background (Flat Edge-to-Edge Solid Rectangle)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#E5E7EB';
  ctx.strokeRect(0, 0, W, H);

  // Ensure web fonts are fully loaded before canvas text measurement
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }

  // 2. Top Maroon Header Bar (74px height - Flat Edge-to-Edge)
  ctx.fillStyle = '#680208';
  ctx.fillRect(0, 0, W, 74);

  // Header Title: Mathematically centered Golden Tamil Title
  drawCenteredText(
    ctx, 
    'தமிழக வெற்றிக் கழகம்', 
    W / 2, 
    33, 
    'bold 23px "Mukta Malar", "Noto Sans Tamil", sans-serif', 
    '#FCCB06'
  );

  // Subtitle: Mathematically centered Gold/Cream Subtitle
  drawCenteredText(
    ctx, 
    isTa ? 'தன்னார்வலர் அடையாள அட்டை' : 'VOLUNTEER ID CARD', 
    W / 2, 
    54, 
    'bold 11px Inter, sans-serif', 
    '#FEF3C7'
  );

  // 3. Background Map Watermark (Centered with opacity)
  const mapImg = await loadImage('/tvk_map.png');
  if (mapImg) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.drawImage(mapImg, 210, 78, 260, 270);
    ctx.restore();
  }

  // 4. Left Volunteer Photo Box (36px, 96px, 118x126)
  const photoX = 36;
  const photoY = 96;
  const photoW = 118;
  const photoH = 126;

  // Photo outer border
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 8);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#680208';
  ctx.stroke();

  // Photo image with cover fit
  const volImg = await loadImage(volPhotoUrl);
  if (volImg) {
    drawImageCover(ctx, volImg, photoX + 2.5, photoY + 2.5, photoW - 5, photoH - 5, 6);
  }

  // 5. Left Standalone QR Code (Centered directly below photo with exact quiet zone)
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://tvkkallakurichi.in';
  const qrData = `${origin}/verify-volunteer?id=${encodeURIComponent(volId)}`;
  const qrMatrix = generateQRCodeMatrix(qrData);

  const qrBoxW = 92;
  const qrBoxH = 92;
  const qrBoxX = photoX + (photoW - qrBoxW) / 2; // Perfectly centered under photo
  const qrBoxY = 234;

  // White box with gray border
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 4);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#D1D5DB';
  ctx.stroke();

  // Draw QR code with ISO/IEC Quiet Zone Margin (margin = 2)
  if (qrMatrix.length > 0) {
    const margin = 2;
    const modCount = qrMatrix.length;
    const totalModules = modCount + (margin * 2);
    const innerQRSize = 84;
    const innerQRX = qrBoxX + (qrBoxW - innerQRSize) / 2;
    const innerQRY = qrBoxY + (qrBoxH - innerQRSize) / 2;
    const modSize = innerQRSize / totalModules;

    ctx.fillStyle = '#000000';
    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (qrMatrix[r][c]) {
          ctx.fillRect(
            innerQRX + (c + margin) * modSize,
            innerQRY + (r + margin) * modSize,
            modSize + 0.3,
            modSize + 0.3
          );
        }
      }
    }
  }

  // 6. Details Table (Aligned with web layout)
  const tableX = 200;
  const colonX = 336;
  const valueX = 350;
  const rowStartY = 118;
  const rowGap = 27;

  const rows = [
    { label: isTa ? 'பெயர்' : 'Name', value: volName },
    { label: isTa ? 'இரத்த வகை / வயது' : 'Blood Group / Age', value: `${volBlood} / ${volAge ? `${volAge} ${isTa ? 'ஆண்டுகள்' : 'Yrs'}` : 'N/A'}` },
    { label: isTa ? 'மாவட்டம்' : 'District', value: volDistrict },
    { label: isTa ? 'தொகுதி' : 'Constituency', value: volConstituency },
    { label: isTa ? 'உறுப்பினர் எண்' : 'Member ID', value: volId }
  ];

  rows.forEach((row, i) => {
    const currentY = rowStartY + i * rowGap;

    // Label
    ctx.fillStyle = '#42221D';
    ctx.font = '700 13px "Mukta Malar", "Noto Sans Tamil", Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.label, tableX, currentY);

    // Colon
    ctx.fillText(':', colonX, currentY);

    // Value
    ctx.fillStyle = '#151515';
    ctx.font = '700 15px "Mukta Malar", "Noto Sans Tamil", Inter, sans-serif';
    ctx.fillText(row.value, valueX, currentY);
  });

  // 7. Right Leader Cutout Image (Natural Aspect Ratio - ZERO STRETCH)
  const leaderImg = await loadImage('/tvk_card_leader.png');
  if (leaderImg) {
    const naturalH = 235;
    const nw = leaderImg.naturalWidth || 400;
    const nh = leaderImg.naturalHeight || 428;
    const naturalW = (nw / nh) * naturalH;
    const leaderX = W - naturalW + 4; // Right edge aligned with +4px bleed
    const leaderY = 376 - naturalH; // Bottom touching the footer stripe at 376px
    ctx.drawImage(leaderImg, leaderX, leaderY, naturalW, naturalH);
  }

  // 8. Centered Footer Address Bar
  drawCenteredText(
    ctx, 
    footerAddress, 
    W / 2, 
    362, 
    'bold 11px "Mukta Malar", "Noto Sans Tamil", Inter, sans-serif', 
    '#42221D'
  );

  // 9. Bottom Maroon & Golden Stripe (Flat Edge-to-Edge)
  ctx.fillStyle = '#680208';
  ctx.fillRect(0, 376, W, 14);
  ctx.fillStyle = '#FCCB06';
  ctx.fillRect(0, 381, W, 4);

  ctx.restore();

  // Instant PNG Download
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) document.body.removeChild(link);
  }, 500);

  return true;
}
