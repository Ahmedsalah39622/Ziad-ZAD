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
  // Accept both PrintImage return types from node-thermal-printer.
  printImage?: (img: string) => void | Promise<void> | Promise<Buffer>;
  cut?: () => void;
  execute?: () => Promise<unknown>;
};

function loadPrinterDriver() {
  try {
    // Dynamic require hidden from webpack static analysis
    return eval('require')("@grandchef/node-printer");
  } catch {
    return null;
  }
}

// XPrinter 370B USB Printer Service
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
        width: 48, // Standard 58mm width (48 chars)
        characterSet: CharacterSet.PC437_USA,
        lineCharacter: "=",
      });

      // Real connection test (do not bypass failures).
      const connected = await this.printer.isPrinterConnected?.();
      if (connected === false) {
        console.error(`❌ Printer is not connected. interface=${printerInterface}`);
        this.printer = null;
        return false;
      }

      console.log(`✅ XPrinter initialized successfully. type=${process.env.PRINTER_TYPE || "EPSON"}, interface=${printerInterface}`);
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
      if (!printer) {
        console.error("❌ Printer is null after initialization");
        return false;
      }

      // Clear buffer
      printer.clear?.();

      // Header
      printer.alignCenter?.();
      printer.bold?.(true);
      printer.setTextSize?.(2, 2);
      printer.newLine?.();
      printer.print?.("INVOICE"); // Removed emoji
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.print?.("=====================");
      printer.newLine?.();
      printer.bold?.(false);

      // Order ID and Date
      printer.alignLeft?.();
      printer.print?.(`Order: ${receiptData.orderId}`);
      printer.newLine?.();
      printer.print?.(`Date: ${receiptData.date}`);

      printer.newLine?.();
      printer.newLine?.();

      // Customer Info
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

      // Items Header
      printer.print?.("=====================");
      printer.newLine?.();
      printer.bold?.(true);
      printer.print?.("Item Details:");
      printer.newLine?.();
      printer.bold?.(false);
      printer.print?.("---------------------");
      printer.newLine?.();

      // Items
      for (const item of receiptData.items) {
        const itemLineTotal = item.price * item.quantity;

        printer.print?.(item.name);
        printer.newLine?.();
        if (item.size) {
          printer.print?.(`  Size: ${item.size}`);
          printer.newLine?.();
        }
        if (item.color) {
          printer.print?.(`  Color: ${item.color}`);
          printer.newLine?.();
        }
        printer.print?.(
          `  Qty: ${item.quantity} × ${this.formatPrice(item.price)}`
        );
        printer.newLine?.();
        printer.print?.(
          `  Total: ${this.formatPrice(itemLineTotal)}`
        );
        printer.newLine?.();
        printer.newLine?.();
      }

      // Totals Section
      printer.print?.("=====================");
      printer.newLine?.();
      printer.print?.(
        `Subtotal:`.padEnd(21) + this.formatPrice(receiptData.subtotal)
      );
      printer.newLine?.();

      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        printer.print?.(
          `Discount (${receiptData.discountPct}%):`.padEnd(21) +
          `-${this.formatPrice(receiptData.discountAmount)}`
        );
        printer.newLine?.();
      }

      printer.print?.(
        `Shipping:`.padEnd(21) + this.formatPrice(receiptData.shippingFee)
      );
      printer.newLine?.();
      printer.print?.("---------------------");
      printer.newLine?.();

      printer.bold?.(true);
      printer.setTextSize?.(1, 2);
      printer.print?.(
        `TOTAL:`.padEnd(21) + this.formatPrice(receiptData.total)
      );
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.bold?.(false);

      printer.print?.("=====================");
      printer.newLine?.();
      printer.newLine?.();

      // Payment Method
      printer.alignCenter?.();
      printer.print?.(`Payment: ${receiptData.paymentMethod}`);
      printer.newLine?.();
      printer.newLine?.();

      // QR Code - Disabled for testing
      /*
      if (receiptData.qrCode) {
        try {
          printer.printImage?.(receiptData.qrCode);
        } catch (qrError) {
          console.error("QR code print failed:", qrError);
          printer.print?.("[QR Code could not be printed]");
          printer.newLine?.();
        }
      }
      */

      // Footer
      printer.newLine?.();
      printer.alignCenter?.();
      printer.print?.("THANK YOU FOR SHOPPING!"); // Removed emoji
      printer.newLine?.();
      printer.print?.("ZAD - BREAK YOUR LIMITS");
      printer.newLine?.();
      printer.newLine?.();
      printer.cut?.();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = (printer as any).getBuffer?.() || Buffer.alloc(0);
      console.log(`🖨️ Buffer generated: ${buffer.length} bytes`);

      await (printer.execute?.() || Promise.resolve());
      console.log("Receipt printed successfully");
      return true;
    } catch (error) {
      console.error("Print error:", error);
      return false;
    }
  }

  private async printReceiptTSPL(receiptData: ReceiptData): Promise<boolean> {
    try {
      const printerInterface = process.env.PRINTER_INTERFACE || "printer:Xprinter XP-370B";
      const printerName = printerInterface.replace("printer:", "");
      
      // Calculate height based on items
      const heightMm = 150 + (receiptData.items.length * 25);
      
      let commands = `SIZE 58 mm, ${heightMm} mm\n`;
      commands += `GAP 0, 0\n`;
      commands += `DIRECTION 1\n`;
      commands += `CLS\n`;
      
      let y = 30;
      
      // Header
      commands += `TEXT 230,${y},"3",0,1,1,2,"INVOICE"\n`;
      y += 60;
      commands += `TEXT 30,${y},"2",0,1,1,"=============================="\n`;
      y += 40;
      
      // Order & Date
      commands += `TEXT 30,${y},"2",0,1,1,"Order: ${receiptData.orderId}"\n`;
      y += 30;
      commands += `TEXT 30,${y},"2",0,1,1,"Date: ${receiptData.date}"\n`;
      y += 60;
      
      // Customer
      commands += `TEXT 30,${y},"3",0,1,1,"Customer:"\n`;
      y += 40;
      commands += `TEXT 30,${y},"2",0,1,1,"${receiptData.customerName}"\n`;
      y += 30;
      commands += `TEXT 30,${y},"2",0,1,1,"Tel: ${receiptData.customerPhone}"\n`;
      y += 30;
      commands += `TEXT 30,${y},"2",0,1,1,"Address: ${receiptData.address.substring(0, 35)}"\n`;
      y += 60;
      
      commands += `TEXT 30,${y},"2",0,1,1,"=============================="\n`;
      y += 40;
      commands += `TEXT 30,${y},"3",0,1,1,"Item Details:"\n`;
      y += 40;
      
      // Items
      for (const item of receiptData.items) {
        commands += `TEXT 30,${y},"2",0,1,1,"${item.name.substring(0, 30)}"\n`;
        y += 30;
        commands += `TEXT 30,${y},"2",0,1,1,"  Qty: ${item.quantity} x ${item.price.toFixed(0)}"\n`;
        y += 40;
      }
      
      y += 20;
      commands += `TEXT 30,${y},"2",0,1,1,"------------------------------"\n`;
      y += 40;
      
      // Totals
      commands += `TEXT 30,${y},"3",0,1,1,"TOTAL: ${receiptData.total.toFixed(2)} EGP"\n`;
      y += 60;
      
      commands += `TEXT 230,${y},"2",0,1,1,2,"THANK YOU!"\n`;
      y += 40;
      commands += `TEXT 230,${y},"2",0,1,1,2,"ZAD - BREAK LIMITS"\n`;

      commands += `PRINT 1\n`;
 
      const driver = loadPrinterDriver();
      if (!driver) {
        console.error("❌ Printer driver not found");
        return false;
      }
 
      return new Promise((resolve) => {
        driver.printDirect({
          data: commands,
          printer: printerName,
          type: "RAW",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          success: (id: any) => {
            console.log(`✅ TSPL Receipt printed successfully. Job ID: ${id}`);
            resolve(true);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: (err: any) => {
            console.error("❌ TSPL Print error:", err);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error("❌ Failed to process TSPL receipt:", error);
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

// Global printer instance
let printerInstance: XPrinterService | null = null;

export async function getPrinterService(): Promise<XPrinterService | null> {
  try {
    if (!printerInstance) {
      printerInstance = new XPrinterService();
      const initialized = await printerInstance.initialize();
      if (!initialized) {
        return null;
      }
    }
    return printerInstance;
  } catch (error) {
    console.error("Failed to get printer service:", error);
    return null;
  }
}
