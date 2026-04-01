import "dotenv/config";
import { getPrinterService } from "./src/lib/printer/xprinter";

async function testSmartPrint() {
  console.log("🚀 Starting Smart Print Test...");
  
  const printer = await getPrinterService();
  if (!printer) {
    console.error("❌ Printer service not available. Check your .env and printer connection.");
    process.exit(1);
  }

  const testData = {
    orderId: "ZAD-100200",
    date: new Date().toLocaleString("ar-EG"),
    customerName: "أحمد محمود سليم",
    customerPhone: "01098765432",
    address: "شارع التسعين الجنوبي، التجمع الخامس، القاهرة",
    items: [
      { name: "تيشيرت أسود أوفرسايز - ZAD", quantity: 1, price: 550, size: "XL", color: "أسود" },
      { name: "بنطلون جينز أزرق", quantity: 2, price: 750, size: "34" },
      { name: "سويت شيرت شتوي ثقيل", quantity: 1, price: 1200, size: "L", color: "زيتي" }
    ],
    subtotal: 3250,
    discountAmount: 250,
    discountPct: 8,
    shippingFee: 60,
    total: 3060,
    paymentMethod: "COD"
  };

  console.log("🖨️ Sending test print to XPrinter...");
  const success = await printer.printReceipt(testData);

  if (success) {
    console.log("✅ Smart Print Job sent successfully!");
  } else {
    console.error("❌ Smart Print Job failed.");
  }
}

testSmartPrint().catch(console.error);
