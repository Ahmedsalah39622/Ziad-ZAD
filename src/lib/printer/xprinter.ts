import { printer as PrinterLib } from "node-thermal-printer";
import { types as PrinterTypes } from "node-thermal-printer";
import { CharacterSet } from "node-thermal-printer";

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
      const { renderTextToTsplBitmap } = await import("./arabic-utils");

      const printerInterface = process.env.PRINTER_INTERFACE || "printer:Xprinter XP-370B";
      const printerName = printerInterface.replace(/^printer:/, "").trim();

      const DOTS_PER_MM = 8;
      const WIDTH_DOTS = 58 * DOTS_PER_MM - 20;
      let y = 20;
      const cmdParts: (string | Buffer)[] = [];

      const leftX = 20;
      const rightPriceX = WIDTH_DOTS - 80;
      const textWidth = WIDTH_DOTS - 40;

      const pushBitmapLine = (text: string, fontSize = 16, bold = false, maxWidth = textWidth) => {
        const bmp = renderTextToTsplBitmap(text, leftX, y, maxWidth, fontSize, bold);
        cmdParts.push(bmp.command, bmp.data, "\n");
        y += bmp.height + 6;
      };

      const pushLabelValue = (label: string, value: string) => {
        pushBitmapLine(`${label} ${value}`, 16, true);
      };

      const pushSimpleLine = (text: string, fontSize = 16, bold = false) => {
        pushBitmapLine(text, fontSize, bold);
      };

      pushSimpleLine("ZAD ORDER SLIP", 18, true);
      pushLabelValue("Order:", receiptData.orderId);
      pushLabelValue("Date:", receiptData.date);
      pushSimpleLine("Customer:", 16, true);
      pushBitmapLine(receiptData.customerName, 16, true);
      pushBitmapLine(`Tel: ${receiptData.customerPhone}`, 16);
      pushBitmapLine(receiptData.address, 14);

      cmdParts.push(`BAR ${leftX},${y},${textWidth},2\n`);
      y += 18;
      pushSimpleLine("ITEMS", 16, true);
      y -= 6;
      cmdParts.push(`TEXT ${rightPriceX},${y},"1",0,1,1,"PRICE"\n`);
      y += 24;
      cmdParts.push(`BAR ${leftX},${y},${textWidth},1\n`);
      y += 18;

      for (const item of receiptData.items) {
        const itemName = `${item.quantity} x ${item.name}`;
        const itemBmp = renderTextToTsplBitmap(itemName, leftX, y, WIDTH_DOTS - 120, 14);
        cmdParts.push(itemBmp.command, itemBmp.data, "\n");
        cmdParts.push(`TEXT ${rightPriceX},${y},"1",0,1,1,"${(item.quantity * item.price).toFixed(0)}"\n`);
        y += itemBmp.height + 6;
      }

      y += 6;
      cmdParts.push(`BAR ${leftX},${y},${textWidth},2\n`);
      y += 18;

      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        pushLabelValue("Subtotal:", receiptData.subtotal.toFixed(2));
        pushLabelValue("Discount:", `-${receiptData.discountAmount.toFixed(2)}`);
      }

      pushLabelValue("Shipping:", receiptData.shippingFee.toFixed(2));

      cmdParts.push(`BAR ${leftX},${y},${textWidth},2\n`);
      y += 18;

      pushSimpleLine("TOTAL:", 18, true);
      cmdParts.push(`TEXT ${rightPriceX},${y - 18},"2",0,1,1,"${receiptData.total.toFixed(2)}"\n`);
      y += 20;

      pushBitmapLine(`Payment: ${receiptData.paymentMethod}`, 16);
      pushBitmapLine("Delivered with order slip", 14);

      const finalHeightMm = Math.ceil(y / DOTS_PER_MM) + 10;
      let headerText = `SIZE 58 mm, ${finalHeightMm} mm\n`;
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
