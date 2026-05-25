import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import fs from "fs";

// Load Arial font explicitly from Windows to ensure Arabic characters render properly
if (fs.existsSync("C:/Windows/Fonts/arial.ttf")) {
  GlobalFonts.registerFromPath("C:/Windows/Fonts/arial.ttf", "Arial");
} else if (fs.existsSync("C:/Windows/Fonts/tahoma.ttf")) {
  GlobalFonts.registerFromPath("C:/Windows/Fonts/tahoma.ttf", "Arial");
}

export function prepareArabicText(text: string): string {
    return text || "";
}

/**
 * Renders text to a monochrome bitmap for TSPL printers.
 * Returns the TSPL BITMAP command parts.
 */
export function renderTextToTsplBitmap(
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    fontSize: number = 24,
    bold: boolean = false
): { command: string, data: Buffer, height: number } {
    const preparedText = prepareArabicText(text);
    const hasArabic = /[\u0600-\u06FF]/.test(preparedText);
    
    // Create a temporary canvas to measure height/width
    const tempCanvas = createCanvas(maxWidth, 100);
    const ctx = tempCanvas.getContext("2d");
    ctx.direction = hasArabic ? "rtl" : "ltr";
    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px "Arial", "sans-serif"`;
    
    // We use a fixed width for the receipt (e.g. 400 dots)
    const canvasWidth = maxWidth;
    const canvasHeight = Math.ceil(fontSize * 1.5); // Provide enough vertical space
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const cctx = canvas.getContext("2d");
    
    // Fill white
    cctx.fillStyle = "white";
    cctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw text (Black)
    cctx.direction = hasArabic ? "rtl" : "ltr";
    cctx.fillStyle = "black";
    cctx.font = `${bold ? 'bold ' : ''}${fontSize}px "Arial", "sans-serif"`;
    cctx.textAlign = hasArabic ? "right" : "left";
    cctx.fillText(preparedText, hasArabic ? canvasWidth - 5 : 5, fontSize); // 5px margin from edge
    
    // Convert canvas to monochrome bitmask
    const imageData = cctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const { data, width, height } = imageData;
    
    // TSPL BITMAP expects 1 bit per pixel.
    // XPrinter XP-370B generally interprets 1 = white/blank, 0 = black ink in this mode.
    const widthBytes = Math.ceil(width / 8);
    
    // Initialize with 255 (all 1s) for white background
    const bitmapBuffer = Buffer.alloc(widthBytes * height, 255);
    
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = (row * width + col) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            
            // If pixel is dark and opaque, it's text (Black)
            // We set it to 0 (Black ink) by clearing the bit.
            if (a > 128 && r < 128 && g < 128 && b < 128) {
                const byteIdx = row * widthBytes + Math.floor(col / 8);
                const bitIdx = 7 - (col % 8); // MSB is first pixel
                bitmapBuffer[byteIdx] &= ~(1 << bitIdx); // Clear bit to 0
            }
        }
    }
    
    const command = `BITMAP ${x},${y},${widthBytes},${height},0,`;
    
    return {
        command,
        data: bitmapBuffer,
        height
    };
}

/**
 * Renders an image file into a 1-bit TSPL bitmap command.
 */
export async function renderImageToTsplBitmap(
    imagePath: string,
    x: number,
    y: number,
    targetWidth: number,
    targetHeight: number
): Promise<{ command: string; data: Buffer; width: number; height: number }> {
    const img = await loadImage(imagePath);

    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const imageRatio = img.width / img.height;
    const boxRatio = targetWidth / targetHeight;

    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > boxRatio) {
        drawWidth = targetWidth;
        drawHeight = Math.round(targetWidth / imageRatio);
        offsetY = Math.round((targetHeight - drawHeight) / 2);
    } else {
        drawHeight = targetHeight;
        drawWidth = Math.round(targetHeight * imageRatio);
        offsetX = Math.round((targetWidth - drawWidth) / 2);
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const { data, width, height } = imageData;
    const widthBytes = Math.ceil(width / 8);
    const bitmapBuffer = Buffer.alloc(widthBytes * height, 255);

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = (row * width + col) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            if (a > 100 && luminance < 180) {
                const byteIdx = row * widthBytes + Math.floor(col / 8);
                const bitIdx = 7 - (col % 8);
                bitmapBuffer[byteIdx] &= ~(1 << bitIdx);
            }
        }
    }

    return {
        command: `BITMAP ${x},${y},${widthBytes},${height},0,`,
        data: bitmapBuffer,
        width,
        height,
    };
}
