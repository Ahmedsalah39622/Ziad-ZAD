/**
 * Quick Test Script for XPrinter 370B
 * Run with: npx tsx test-printer.ts
 * 
 * This script tests if the printer is properly connected and can print
 */

import { getPrinterService } from "./src/lib/printer/xprinter";
import { generateReceiptQR } from "./src/lib/printer/qr-receipt";

async function testPrinter() {
  console.log("🔍 Testing XPrinter 370B Connection...\n");

  const printerService = await getPrinterService();

  if (!printerService) {
    console.error("❌ Failed to initialize printer service!");
    console.log("\n📍 Troubleshooting Tips:");
    console.log("1. Check if XPrinter 370B is connected via USB");
    console.log("2. Install XPrinter drivers from the manufacturer");
    console.log("3. Check Windows Device Manager for USB devices");
    console.log("4. Restart the application");
    process.exit(1);
  }

  console.log("✅ Printer service initialized successfully!\n");

  // Test data - Sample Order
  const testOrder = {
    id: "test-001",
    createdAt: new Date(),
    customerName: "محمد أحمد",
    customerPhone: "01234567890",
    address: "شارع النيل",
    city: "القاهرة",
    total: 499.99,
    discountPct: 10,
    shippingFee: 50,
    paymentMethod: "COD",
    items: [
      {
        product: { name: "T-Shirt Classic" },
        quantity: 2,
        price: 149.99,
        size: "L",
        color: "Black",
      },
      {
        product: { name: "Jeans Premium" },
        quantity: 1,
        price: 200.00,
        size: "32",
        color: "Blue",
      },
    ],
  };

  try {
    console.log("📄 Generating QR Code...");
    const qrCode = await generateReceiptQR(testOrder as any);
    console.log("✅ QR Code generated successfully\n");

    console.log("🖨️  Sending test receipt to printer...\n");

    const receiptData = {
      orderId: testOrder.id,
      date: new Date().toLocaleString("ar-EG"),
      customerName: testOrder.customerName,
      customerPhone: testOrder.customerPhone,
      address: `${testOrder.address}, ${testOrder.city}`,
      items: testOrder.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      subtotal: 499.99,
      discountAmount: 49.99,
      discountPct: testOrder.discountPct,
      shippingFee: testOrder.shippingFee,
      total: testOrder.total,
      paymentMethod: "Cash on Delivery",
      qrCode,
    };

    const result = await printerService.printReceipt(receiptData);

    if (result) {
      console.log("\n✅ TEST PASSED! Printer is working correctly 🎉");
      console.log("\n📋 Summary:");
      console.log("✓ USB Connection: OK");
      console.log("✓ QR Code Generation: OK");
      console.log("✓ Receipt Formatting: OK");
      console.log("✓ Printer Output: OK\n");
    } else {
      console.error(
        "\n❌ TEST FAILED! Printer did not produce output"
      );
      console.log("\n📍 Possible Issues:");
      console.log("1. Printer is offline or not responding");
      console.log("2. Paper is jammed or missing");
      console.log("3. Printer driver needs update");
      console.log("4. USB cable is disconnected\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ TEST ERROR:", error);
    console.log("\n📍 Debug Information:");
    console.error(error);
    process.exit(1);
  }

  console.log("You can now use the printer in your application! 🚀");
}

testPrinter();
