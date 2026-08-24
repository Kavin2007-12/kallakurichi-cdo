import html2canvas from 'html2canvas';

/**
 * Converts an image element or URL to a base64 Data URL
 * to ensure 100% untainted, CORS-safe canvas export.
 */
const convertImgToDataUrl = async (imgEl) => {
  if (!imgEl || !imgEl.src || imgEl.src.startsWith('data:')) return;

  // Try Canvas draw first
  try {
    if (imgEl.complete && imgEl.naturalWidth > 0) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgEl.naturalWidth;
      tempCanvas.height = imgEl.naturalHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/png');
      if (dataUrl && dataUrl.length > 200) {
        imgEl.src = dataUrl;
        return;
      }
    }
  } catch (e) {
    // Canvas tainted on drawImage, proceed to fetch
  }

  // Fallback: Fetch as Blob and convert to Base64
  try {
    const res = await fetch(imgEl.src, { mode: 'cors' });
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    if (dataUrl) {
      imgEl.src = dataUrl;
    }
  } catch (err) {
    console.warn('Image to Base64 conversion fallback failed:', imgEl.src, err);
  }
};

/**
 * Removes modern CSS color functions like oklch(...) from cloned stylesheets
 * which causes html2canvas to throw 'unsupported color function "oklch"'.
 */
const sanitizeOklchInDoc = (clonedDoc) => {
  try {
    const dummy = document.createElement('canvas');
    const ctx = dummy.getContext('2d');

    const replaceOklch = (text) => {
      if (!text || typeof text !== 'string' || !text.includes('oklch')) return text;
      return text.replace(/oklch\([^)]+\)/g, (match) => {
        try {
          ctx.fillStyle = match;
          return ctx.fillStyle || '#000000';
        } catch (e) {
          return '#000000';
        }
      });
    };

    // 1. Sanitize all <style> tags
    const styles = clonedDoc.querySelectorAll('style');
    for (const style of styles) {
      if (style.textContent && style.textContent.includes('oklch')) {
        style.textContent = replaceOklch(style.textContent);
      }
    }

    // 2. Sanitize all inline styles on all elements
    const elements = clonedDoc.querySelectorAll('*');
    for (const el of elements) {
      const inline = el.getAttribute('style');
      if (inline && inline.includes('oklch')) {
        el.setAttribute('style', replaceOklch(inline));
      }
    }
  } catch (e) {
    console.warn('Style sanitization warning:', e);
  }
};

const triggerDownload = (dataUrl, fileName) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
  }, 500);
};

/**
 * Bulletproof ID Card PNG Exporter
 */
export const downloadCardImage = async (cardElementOrId, fileName = 'TVK_Volunteer_ID_Card.png') => {
  let targetEl = typeof cardElementOrId === 'string' 
    ? document.getElementById(cardElementOrId) 
    : cardElementOrId;

  if (!targetEl) {
    throw new Error('Card DOM element was not found on screen');
  }

  // Find inner card container (680x390)
  const innerCard = targetEl.querySelector('.rounded-\\[32px\\]') || targetEl.firstElementChild || targetEl;

  if (!innerCard) {
    throw new Error('Inner card layout container not found');
  }

  // Clone into clean DOM container to safely convert images to base64
  const clone = innerCard.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.width = '680px';
  clone.style.height = '390px';
  clone.style.zIndex = '999999';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';

  // Add behind a white backdrop overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = '#FFFFFF';
  overlay.style.zIndex = '999998';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  document.body.appendChild(overlay);
  overlay.appendChild(clone);

  try {
    // 1. Convert all images in clone to base64 Data URLs
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(img => convertImgToDataUrl(img)));

    // 2. Wait for image render tick
    await new Promise(resolve => setTimeout(resolve, 150));

    // 3. Render canvas with automatic OKLCH -> RGB stylesheet sanitization
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      width: 680,
      height: 390,
      onclone: (clonedDoc) => {
        sanitizeOklchInDoc(clonedDoc);
      }
    });

    // 4. Generate clean PNG Data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    if (!dataUrl || dataUrl.length < 500) {
      throw new Error('Generated canvas image was empty');
    }

    triggerDownload(dataUrl, fileName);
    return true;
  } catch (err) {
    console.error('ID Card export error:', err);
    throw new Error(err.message || 'Canvas rendering error');
  } finally {
    if (overlay && overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  }
};
