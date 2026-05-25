import { printer as PrinterLib } from "node-thermal-printer";
import { types as PrinterTypes } from "node-thermal-printer";
import { CharacterSet } from "node-thermal-printer";
import fs from "fs";
import path from "path";

type ThermalPrinterLike = {
  isPrinterConnected?: () => Promise<boolean>;
  clear?: () => void;
  alignCenter?: () => void;
  alignLeft?: () => void;
  bold?: (enabled: boolean) => void;
  setTextSize?: (width: number, height: number) => void;
  newLine?: () => void;
  print?: (text: string) => void;
  printImage?: (img: string) => void | Promise<void> | Promise<Buffer>;
  cut?: () => void;
  execute?: () => Promise<unknown>;
};

function loadPrinterDriver() {
  try {
    return eval('require')("@grandchef/node-printer");
  } catch {
    return null;
  }
}

export class XPrinterService {
  private printer: ThermalPrinterLike | null = null;

  async initialize() {
    try {
      const isTSPL = process.env.PRINTER_TYPE === "TSPL";
      if (isTSPL) {
        console.log("ℹ️ TSPL mode detected — skipping node-thermal-printer initialization.");
        return true;
      }

      const printerType =
        process.env.PRINTER_TYPE === "STAR" ? PrinterTypes.STAR : PrinterTypes.EPSON;
      const printerInterface = process.env.PRINTER_INTERFACE || "usb";
      const driver = loadPrinterDriver();

      if (!driver) {
        throw new Error("Printer driver '@grandchef/node-printer' is not installed.");
      }

      this.printer = new PrinterLib({
        type: printerType,
        interface: printerInterface,
        driver: driver,
        width: 48,
        characterSet: CharacterSet.PC437_USA,
        lineCharacter: "=",
      });

      const connected = await this.printer.isPrinterConnected?.();
      if (connected === false) {
        console.error(`❌ Printer is not connected. interface=${printerInterface}`);
        this.printer = null;
        return false;
      }

      console.log(`✅ XPrinter initialized successfully. interface=${printerInterface}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize XPrinter:", error);
      this.printer = null;
      return false;
    }
  }

  async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    const isTSPL = process.env.PRINTER_TYPE === "TSPL";

    if (!isTSPL && !this.printer) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error("❌ Printer not available");
        return false;
      }
    }

    try {
      if (isTSPL) {
        return await this.printReceiptTSPL(receiptData);
      }

      const printer = this.printer;
      if (!printer) return false;

      printer.clear?.();
      printer.alignCenter?.();
      printer.bold?.(true);
      printer.setTextSize?.(2, 2);
      printer.newLine?.();
      printer.print?.("INVOICE");
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.print?.("=====================");
      printer.newLine?.();
      printer.bold?.(false);

      printer.alignLeft?.();
      printer.print?.(`Order: ${receiptData.orderId}`);
      printer.newLine?.();
      printer.print?.(`Date: ${receiptData.date}`);
      printer.newLine?.();
      printer.newLine?.();

      printer.bold?.(true);
      printer.print?.("Customer:");
      printer.newLine?.();
      printer.bold?.(false);
      printer.print?.(receiptData.customerName);
      printer.newLine?.();
      printer.print?.(`Tel: ${receiptData.customerPhone}`);
      printer.newLine?.();
      printer.print?.(`Address: ${receiptData.address}`);
      printer.newLine?.();
      printer.newLine?.();

      printer.print?.("=====================");
      printer.newLine?.();
      printer.bold?.(true);
      printer.print?.("Item Details:");
      printer.newLine?.();
      printer.bold?.(false);
      printer.print?.("---------------------");
      printer.newLine?.();

      for (const item of receiptData.items) {
        const itemLineTotal = item.price * item.quantity;
        printer.print?.(item.name);
        printer.newLine?.();
        if (item.size) printer.print?.(`  Size: ${item.size}\n`);
        if (item.color) printer.print?.(`  Color: ${item.color}\n`);
        printer.print?.(`  Qty: ${item.quantity} × ${this.formatPrice(item.price)}\n`);
        printer.print?.(`  Total: ${this.formatPrice(itemLineTotal)}\n`);
        printer.newLine?.();
      }

      printer.print?.("=====================");
      printer.newLine?.();
      printer.print?.(`Subtotal:`.padEnd(21) + this.formatPrice(receiptData.subtotal));
      printer.newLine?.();

      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        printer.print?.(`Discount (${receiptData.discountPct}%):`.padEnd(21) + `-${this.formatPrice(receiptData.discountAmount)}`);
        printer.newLine?.();
      }

      printer.print?.(`Shipping:`.padEnd(21) + this.formatPrice(receiptData.shippingFee));
      printer.newLine?.();
      printer.print?.("---------------------");
      printer.newLine?.();

      printer.bold?.(true);
      printer.setTextSize?.(1, 2);
      printer.print?.(`TOTAL:`.padEnd(21) + this.formatPrice(receiptData.total));
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.bold?.(false);

      printer.print?.("=====================");
      printer.newLine?.();
      printer.newLine?.();

      printer.alignCenter?.();
      printer.print?.(`Payment: ${receiptData.paymentMethod}`);
      printer.newLine?.();
      printer.newLine?.();

      printer.newLine?.();
      printer.alignCenter?.();
      printer.print?.("THANK YOU FOR SHOPPING!");
      printer.newLine?.();
      printer.print?.("ZAD - BREAK YOUR LIMITS");
      printer.newLine?.();
      printer.newLine?.();
      printer.cut?.();

      await (printer.execute?.() || Promise.resolve());
      return true;
    } catch (error) {
      console.error("Print error:", error);
      return false;
    }
  }

  private async printReceiptTSPL(receiptData: ReceiptData): Promise<boolean> {
    try {
      const { renderTextToTsplBitmap, renderImageToTsplBitmap } = await import("./arabic-utils");

      const printerInterface = process.env.PRINTER_INTERFACE || "printer:Xprinter XP-370B";
      const printerName = printerInterface.replace(/^printer:/, "").trim();

      const DOTS_PER_MM = 8;
      const PAPER_WIDTH_MM = 50;
      const PAPER_HEIGHT_MM = 80;
      const WIDTH_DOTS = PAPER_WIDTH_MM * DOTS_PER_MM;
      const HEIGHT_DOTS = PAPER_HEIGHT_MM * DOTS_PER_MM;
      const cmdParts: (string | Buffer)[] = [];

      const pushBitmap = (text: string, x: number, y: number, maxWidth: number, fontSize = 16, bold = true) => {
        const bmp = renderTextToTsplBitmap(text, x, y, maxWidth, fontSize, bold);
        cmdParts.push(bmp.command, bmp.data, "\n");
        return bmp.height;
      };

      const trimText = (value: string, maxLength: number) =>
        value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;

      const logoPath = path.join(process.cwd(), "public", "amulet-logo.png");
      const logoX = 20;
      const logoY = 16;
      const logoWidth = 156;
      const logoHeight = 78;

      if (fs.existsSync(logoPath)) {
        try {
          const logoBmp = await renderImageToTsplBitmap(logoPath, logoX, logoY, logoWidth, logoHeight);
          cmdParts.push(logoBmp.command, logoBmp.data, "\n");
        } catch {
          pushBitmap("ZAD", logoX, logoY + 16, logoWidth, 34, true);
        }
      } else {
        pushBitmap("ZAD", logoX, logoY + 16, logoWidth, 34, true);
      }

      const rightHeaderX = 166;
      let rightHeaderY = 18;
      rightHeaderY += pushBitmap(`Order: ${receiptData.orderId}`, rightHeaderX, rightHeaderY, 214, 17, true) + 8;
      rightHeaderY += pushBitmap(`Date: ${receiptData.date}`, rightHeaderX, rightHeaderY, 214, 16) + 6;
      rightHeaderY += pushBitmap(`Customer: ${trimText(receiptData.customerName, 12)}`, rightHeaderX, rightHeaderY, 214, 16) + 6;
      rightHeaderY += pushBitmap(`Tel: ${receiptData.customerPhone}`, rightHeaderX, rightHeaderY, 214, 16) + 6;

      const dividerY = Math.max(rightHeaderY + 6, logoY + logoHeight + 10);
      cmdParts.push(`BAR 20,${dividerY},${WIDTH_DOTS - 40},2\n`);

      let addressY = dividerY + 8;
      addressY += pushBitmap(`Address: ${receiptData.address}`, 20, addressY, WIDTH_DOTS - 40, 16) + 6;

      cmdParts.push(`BAR 20,${addressY},${WIDTH_DOTS - 40},2\n`);

      let itemsY = addressY + 10;
      itemsY += pushBitmap("Order Items", 24, itemsY, 352, 18, true) + 8;
      for (const item of receiptData.items.slice(0, 5)) {
        const details = [];
        if (item.size) details.push(item.size);
        if (item.color) details.push(item.color);
        const detailsStr = details.length > 0 ? ` [${details.join('/')}]` : '';
        const itemLine = `${item.quantity}x ${trimText(item.name, 20)}${detailsStr}`;
        itemsY += pushBitmap(itemLine, 24, itemsY, 352, 15) + 6;
      }
      if (receiptData.items.length > 5) {
        pushBitmap(`+${receiptData.items.length - 5} more items`, 24, itemsY, 352, 14);
      }

      const summaryX1 = 170;
      const summaryY1 = 360;
      const summaryX2 = WIDTH_DOTS - 20;
      const summaryY2 = 562;
      cmdParts.push(`BOX ${summaryX1},${summaryY1},${summaryX2},${summaryY2},2\n`);

      // QR code for quickly visiting the website.
      const websiteUrl = "https://www.zadfitt.com";
      const qrX = 24;
      const qrY = 372;
      cmdParts.push(`QRCODE ${qrX},${qrY},H,4,A,0,M2,S7,\"${websiteUrl}\"\n`);
      pushBitmap("Scan to visit", 20, 532, 140, 13, true);

      let summaryY = summaryY1 + 14;
      summaryY += pushBitmap("ORDER DETAILS", summaryX1 + 10, summaryY, 194, 15, true) + 8;
      summaryY += pushBitmap(`Items: ${receiptData.items.length}`, summaryX1 + 10, summaryY, 194, 13) + 5;
      summaryY += pushBitmap(`Shipping: ${receiptData.shippingFee.toFixed(2)} EGP`, summaryX1 + 10, summaryY, 194, 13) + 5;
      summaryY += pushBitmap(`Payment: ${receiptData.paymentMethod}`, summaryX1 + 10, summaryY, 194, 13) + 8;

      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        summaryY += pushBitmap(`Discount: -${receiptData.discountAmount.toFixed(2)} EGP`, summaryX1 + 10, summaryY, 194, 13, true) + 8;
      }

      pushBitmap(`TOTAL: ${receiptData.total.toFixed(2)} EGP`, summaryX1 + 10, Math.min(summaryY, 520), 194, 20, true);

      const domain = "www.zadfitt.com";
      const domainWidth = 280;
      const domainX = Math.floor((WIDTH_DOTS - domainWidth) / 2);
      const domainY = HEIGHT_DOTS - 34;
      pushBitmap(domain, domainX, domainY, domainWidth, 14, true);

      let headerText = `SIZE ${PAPER_WIDTH_MM} mm, ${PAPER_HEIGHT_MM} mm\n`;
      headerText += `GAP 0, 0\n`;
      headerText += `DIRECTION 1\n`;
      headerText += `CLS\n`;

      const footerText = `PRINT 1\n`;
      const finalBuffer = Buffer.concat([
        Buffer.from(headerText),
        ...cmdParts.map((p) => (typeof p === "string" ? Buffer.from(p) : p)),
        Buffer.from(footerText),
      ]);

      const driver = loadPrinterDriver();
      console.log(`ℹ️ TSPL print debug: printerName='${printerName}', driverLoaded=${!!driver}, bufferLength=${finalBuffer.length}`);
      if (!driver) {
        console.error("❌ TSPL driver is not loaded. Make sure @grandchef/node-printer is installed and can be required.");
        return false;
      }

      return new Promise((resolve) => {
        driver.printDirect({
          data: finalBuffer,
          printer: printerName,
          type: "RAW",
          success: (id: unknown) => {
            console.log(`✅ Arabic-Enabled TSPL Receipt printed successfully. Job ID: ${id}`);
            resolve(true);
          },
          error: (err: unknown) => {
            console.error("❌ Arabic-Enabled TSPL Print error:", err);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error("❌ Failed to process Arabic-Enabled TSPL receipt:", error);
      return false;
    }
  }

  private formatPrice(price: number): string {
    return `${price.toFixed(2)} EGP`;
  }
}

export interface ReceiptData {
  orderId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
  discountAmount?: number;
  discountPct: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  qrCode?: string;
}

let printerInstance: XPrinterService | null = null;

export async function getPrinterService(): Promise<XPrinterService | null> {
  try {
    if (!printerInstance) {
      printerInstance = new XPrinterService();
      const initialized = await printerInstance.initialize();
      if (!initialized) return null;
    }
    return printerInstance;
  } catch (error) {
    console.error("Failed to get printer service:", error);
    return null;
  }
}
