import { printer as PrinterLib } from "node-thermal-printer";
import { types as PrinterTypes } from "node-thermal-printer";
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
let printerDriver: any = null;
try {
  printerDriver = require("@grandchef/node-printer");
} catch {
  // Native module not available (e.g. on Vercel) — printer features disabled
}

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

// XPrinter 370B USB Printer Service
export class XPrinterService {
  private printer: ThermalPrinterLike | null = null;

  async initialize() {
    try {
      const printerType =
        process.env.PRINTER_TYPE === "STAR" ? PrinterTypes.STAR : PrinterTypes.EPSON;
      const printerInterface = process.env.PRINTER_INTERFACE || "usb";

      this.printer = new PrinterLib({
        type: printerType,
        interface: printerInterface,
        driver: printerDriver,
        width: 58, // 58mm paper width (standard for XPrinter 370B)
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

  async printReceipt(receiptData: ReceiptData) {
    if (!this.printer) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error("❌ Printer not available");
        return false;
      }
    }

    try {
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
      printer.print?.("🛍️ INVOICE");
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.print?.("═════════════════════");
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
      printer.print?.("═════════════════════");
      printer.newLine?.();
      printer.bold?.(true);
      printer.print?.("Item Details:");
      printer.newLine?.();
      printer.bold?.(false);
      printer.print?.("─────────────────────");
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
      printer.print?.("═════════════════════");
      printer.newLine?.();
      printer.print?.(
        `Subtotal:`.padEnd(25) + this.formatPrice(receiptData.subtotal)
      );
      printer.newLine?.();

      if (receiptData.discountAmount && receiptData.discountAmount > 0) {
        printer.print?.(
          `Discount (${receiptData.discountPct}%):`.padEnd(25) +
          `-${this.formatPrice(receiptData.discountAmount)}`
        );
        printer.newLine?.();
      }

      printer.print?.(
        `Shipping:`.padEnd(25) + this.formatPrice(receiptData.shippingFee)
      );
      printer.newLine?.();
      printer.print?.("─────────────────────");
      printer.newLine?.();

      printer.bold?.(true);
      printer.setTextSize?.(1, 2);
      printer.print?.(
        `TOTAL:`.padEnd(25) + this.formatPrice(receiptData.total)
      );
      printer.newLine?.();
      printer.setTextSize?.(1, 1);
      printer.bold?.(false);

      printer.print?.("═════════════════════");
      printer.newLine?.();
      printer.newLine?.();

      // Payment Method
      printer.alignCenter?.();
      printer.print?.(`Payment: ${receiptData.paymentMethod}`);
      printer.newLine?.();
      printer.newLine?.();

      // QR Code
      if (receiptData.qrCode) {
        try {
          printer.printImage?.(receiptData.qrCode);
        } catch (qrError) {
          console.error("QR code print failed:", qrError);
          printer.print?.("[QR Code could not be printed]");
          printer.newLine?.();
        }
      }

      // Footer
      printer.alignCenter?.();
      printer.print?.("Thank You!");
      printer.newLine?.();
      printer.print?.(`${new Date().toLocaleString("ar-EG")}`);
      printer.newLine?.();
      printer.print?.("═════════════════════");
      printer.newLine?.();
      printer.newLine?.();
      printer.newLine?.();

      // Cut paper
      printer.cut?.();

      // Execute/Print
      await (printer.execute?.() || Promise.resolve());
      console.log("✅ Receipt printed successfully");
      return true;
    } catch (error) {
      console.error("❌ Print error:", error);
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
