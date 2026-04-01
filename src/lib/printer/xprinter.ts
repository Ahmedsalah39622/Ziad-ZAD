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
      const printerType =
        process.env.PRINTER_TYPE === "STAR" ? PrinterTypes.STAR : PrinterTypes.EPSON;
      const printerInterface = process.env.PRINTER_INTERFACE || "usb";
      const driver = loadPrinterDriver();

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
      const printerName = printerInterface.replace("printer:", "");
      
      const DOTS_PER_MM = 8;
      const WIDTH_DOTS = 58 * DOTS_PER_MM - 40; // Use usable width
      const CENTER_X = (58 * DOTS_PER_MM) / 2;
      
      let y = 30;
      const cmdParts: (string | Buffer)[] = [];

      // 1. Header (Logo)
      cmdParts.push(`TEXT ${CENTER_X},${y},"4",0,2,2,2,"Z A D"\n`);
      y += 80;
      cmdParts.push(`TEXT ${CENTER_X},${y},"2",0,1,1,2,"BREAK YOUR LIMITS"\n`);
      y += 50;
      cmdParts.push(`BAR 30,${y},400,3\n`);
      y += 30;

      // 2. Order Info
      cmdParts.push(`TEXT 30,${y},"3",0,1,1,"ORDER: ${receiptData.orderId}"\n`);
      y += 40;
      cmdParts.push(`TEXT 30,${y},"2",0,1,1,"DATE:  ${receiptData.date}"\n`);
      y += 60;

      // 3. Customer Section (Arabic Support)
      cmdParts.push(`TEXT 30,${y},"3",0,1,1,1,"CUSTOMER DETAILS"\n`);
      y += 40;

      // Name (Arabic)
      const nameBmp = renderTextToTsplBitmap(receiptData.customerName, 30, y, WIDTH_DOTS, 24, true);
      cmdParts.push(nameBmp.command);
      cmdParts.push(nameBmp.data);
      cmdParts.push("\n");
      y += nameBmp.height + 10;

      // Tel (Standard)
      cmdParts.push(`TEXT 30,${y},"2",0,1,1,"TEL:  ${receiptData.customerPhone}"\n`);
      y += 35;

      // Address (Arabic)
      const addrBmp = renderTextToTsplBitmap(receiptData.address, 30, y, WIDTH_DOTS, 20);
      cmdParts.push(addrBmp.command);
      cmdParts.push(addrBmp.data);
      cmdParts.push("\n");
      y += addrBmp.height + 40;

      // 4. Items Table
      cmdParts.push(`BAR 30,${y},400,2\n`);
      y += 20;
      cmdParts.push(`TEXT 30,${y},"2",0,1,1,"ITEMS"\n`);
      cmdParts.push(`TEXT 320,${y},"2",0,1,1,"EGP"\n`);
      y += 40;
      cmdParts.push(`BAR 30,${y},400,1\n`);
      y += 20;

      for (const item of receiptData.items) {
        // Item Name (Arabic Support)
        const itemBmp = renderTextToTsplBitmap(item.name, 30, y, WIDTH_DOTS - 80, 20);
        cmdParts.push(itemBmp.command);
        cmdParts.push(itemBmp.data);
        cmdParts.push("\n");
        // We'll put the price on the same level as the bitmap if height is small, or below
        const priceY = y + 5;
        cmdParts.push(`TEXT 320,${priceY},"2",0,1,1,"${(item.quantity * item.price).toFixed(0)}"\n`);
        
        y += itemBmp.height + 5;
        
        // Qty details
        cmdParts.push(`TEXT 45,${y},"1",0,1,1,"${item.quantity} x ${item.price.toFixed(0)}"\n`);
        y += 25;

        const specs = [item.size, item.color].filter(Boolean).join(" / ");
        if (specs) {
          cmdParts.push(`TEXT 45,${y},"1",0,1,1,"[ ${specs} ]"\n`);
          y += 25;
        }
        y += 15;
      }
      
      y += 10;
      cmdParts.push(`BAR 30,${y},400,2\n`);
      y += 40;

      // 5. Totals
      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        cmdParts.push(`TEXT 30,${y},"2",0,1,1,"Subtotal:"\n`);
        cmdParts.push(`TEXT 320,${y},"2",0,1,1,"${receiptData.subtotal.toFixed(2)}"\n`);
        y += 35;
        cmdParts.push(`TEXT 30,${y},"2",0,1,1,"Discount:"\n`);
        cmdParts.push(`TEXT 320,${y},"2",0,1,1,"-${receiptData.discountAmount.toFixed(2)}"\n`);
        y += 35;
      }

      cmdParts.push(`TEXT 30,${y},"2",0,1,1,"Shipping:"\n`);
      cmdParts.push(`TEXT 320,${y},"2",0,1,1,"${receiptData.shippingFee.toFixed(2)}"\n`);
      y += 50;

      cmdParts.push(`TEXT 30,${y},"3",0,1,1,1,"TOTAL:"\n`);
      cmdParts.push(`TEXT 240,${y},"4",0,1,1,"${receiptData.total.toFixed(2)}"\n`);
      y += 70;

      cmdParts.push(`TEXT ${CENTER_X},${y},"2",0,1,1,2,"Payment: ${receiptData.paymentMethod.toUpperCase()}"\n`);
      y += 60;

      // 7. Codes
      const qrData = `https://zadfitt.com/order/${receiptData.orderId}`;
      cmdParts.push(`QRCODE ${CENTER_X - 60},${y},M,5,A,0,"${qrData}"\n`);
      y += 150;

      cmdParts.push(`BARCODE ${CENTER_X - 150},${y},"128",60,1,0,2,2,"${receiptData.orderId}"\n`);
      y += 100;

      cmdParts.push(`TEXT ${CENTER_X},${y},"2",0,1,1,2,"*** THANK YOU FOR SHOPPING ***"\n`);
      y += 40;
      
      const finalHeightMm = Math.ceil(y / DOTS_PER_MM) + 10;
      
      let headerText = `SIZE 58 mm, ${finalHeightMm} mm\n`;
      headerText += `GAP 0, 0\n`;
      headerText += `DIRECTION 1\n`;
      headerText += `CLS\n`;
      
      const footerText = `PRINT 1\n`;
      
      // Combine all parts into a single buffer
      const finalBuffer = Buffer.concat([
        Buffer.from(headerText),
        ...cmdParts.map(p => (typeof p === "string" ? Buffer.from(p) : p)),
        Buffer.from(footerText)
      ]);
 
      const driver = loadPrinterDriver();
      if (!driver) return false;
 
      return new Promise((resolve) => {
        driver.printDirect({
          data: finalBuffer,
          printer: printerName,
          type: "RAW",
          success: (id: any) => {
            console.log(`✅ Arabic-Enabled TSPL Receipt printed successfully. Job ID: ${id}`);
            resolve(true);
          },
          error: (err: any) => {
            console.error("❌ Arabic-Enabled TSPL Print error:", err);
            resolve(false);
          }
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
