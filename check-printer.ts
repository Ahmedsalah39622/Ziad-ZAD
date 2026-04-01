
import "dotenv/config";
const printer = require("@grandchef/node-printer");

const printerName = "Xprinter XP-370B";

async function testEpson() {
  console.log("\n--- Testing Method 1: ESC/POS (Epson) ---");
  const buffer = Buffer.from([
    0x1B, 0x40, // Initialize
    0x1B, 0x61, 0x01, // Center align
    ...Buffer.from("ZAD TEST - ESC/POS\nSUCCESSFUL!\n\n\n\n\n"),
    0x1D, 0x56, 0x41, 0x03, // Cut
  ]);
  
  return new Promise((resolve) => {
    printer.printDirect({
      data: buffer,
      printer: printerName,
      type: "RAW",
      success: (id: any) => { console.log("Sent ESC/POS, Job ID:", id); resolve(true); },
      error: (err: any) => { console.error("Error:", err); resolve(false); }
    });
  });
}

async function testTSPL() {
  console.log("\n--- Testing Method 2: TSPL (Label Mode) ---");
  const data = `SIZE 58 mm, 50 mm
GAP 2 mm, 0 mm
DIRECTION 1
CLS
TEXT 10,10,"3",0,1,1,"ZAD TEST - TSPL"
PRINT 1
`;
  
  return new Promise((resolve) => {
    printer.printDirect({
      data: data,
      printer: printerName,
      type: "RAW",
      success: (id: any) => { console.log("Sent TSPL, Job ID:", id); resolve(true); },
      error: (err: any) => { console.error("Error:", err); resolve(false); }
    });
  });
}

async function run() {
  console.log("Checking printer visibility...");
  const printers = printer.getPrinters().map((p: any) => p.name);
  if (!printers.includes(printerName)) {
    console.error(`Printer '${printerName}' not found in:`, printers);
    return;
  }
  
  await testEpson();
  setTimeout(async () => {
      await testTSPL();
  }, 2000);
}

run();
