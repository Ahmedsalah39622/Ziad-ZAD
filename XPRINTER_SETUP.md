# 🖨️ XPrinter 370B Integration Setup

## ✅ Installation Complete

تم تثبيت نظام الطباعة الكامل للفاتورة بشكل تلقائي!

## 📦 الحزم المتثبتة

```
- node-thermal-printer (طابعة حرارية)
- qrcode (توليد QR codes)
- canvas (رسم الصور)
```

## 📍 الموقع في الكود

### Printer Service سليم
- **الخدمة الرئيسية**: `src/lib/printer/xprinter.ts`
  - فئة `XPrinterService` - تتعامل مع الاتصال والطباعة
  - دالة `getPrinterService()` - تحصل على instance الطابعة

### QR Code Generator
- **ملف**: `src/lib/printer/qr-receipt.ts`
  - `generateReceiptQR()` - توليد QR code من بيانات الأوردر
  - `formatReceiptData()` - تنسيق بيانات الفاتورة

### Server Actions
- **في**: `src/lib/actions/order-actions.ts`
  - `createOrder()` - ينشئ الأوردر و**ينادي الطباعة تلقائياً عند COD**
  - `printOrderReceipt(orderId)` - طباعة الفاتورة الموجودة

### UI Components (Buttons)
- **Checkout Success Page**: `src/components/checkout/print-button.tsx`
  - زر الطباعة في صفحة النجاح
  
- **Admin Orders Page**: `src/components/admin/print-button.tsx`
  - زر الطباعة في تفاصيل الأوردر للمسؤول

## 🔧 التثبيت في Windows

### استقلال الاتصال:
1. **تثبيت برنامج الطابعة** (من موقع XPrinter)
2. **توصيل الطابعة** بـ USB
3. **التحقق من التوصيل** من Windows Devices

### إنجاحية الطباعة:
```
Windows → Settings → Devices & Printers
```
تأكد من رؤية الطابعة كـ "XPrinter 370B"

## 🚀 كيفية الاستخدام

### الطباعة التلقائية (COD Orders)
```typescript
// من checkout-client.tsx
const result = await createOrder({...});
if (paymentMethod === 'COD') {
  // تطبع تلقائياً!
  const printResult = await printOrderReceipt(result.id);
}
```

### الطباعة اليدوية
- من صفحة **Checkout Success**: اضغط زر "Print Receipt"
- من **Admin Orders Detail**: اضغط زر "Print Receipt"

## 💾 بيانات الفاتورة

تتضمن الفاتورة:
- ✅ معلومات الأوردر (ID, تاريخ)
- ✅ بيانات العميل (الاسم, الهاتف, العنوان)
- ✅ قائمة المنتجات (الكمية, السعر, الحجم, اللون)
- ✅ ملخص المالية (الإجمالي, الخصم, التوصيل)
- ✅ QR Code بصيغة JSON يحتوي على:
  - Order ID
  - Total Amount
  - Customer Name
  - Created Date

## ⚙️ إعدادات الطابعة

- **نوع الطابعة**: XPrinter 370B (STAR compatible)
- **عرض الورق**: 58 ملم
- **الاتصال**: USB
- **اللغة**: العربية مدعومة

## ⚠️ معالجة الأخطاء

إذا لم تكن الطابعة متصلة:
- الرسالة: ⚠️ "Printer not available"
- الأوردر **لن يتأثر** - سينجح الإنشاء
- يمكن طباعة من الزر لاحقاً

## 🔍 استكشاف الأخطاء

1. تحقق من الاتصال USB
2. جرب الطابعة من Windows مباشرة
3. تحقق من الـ console logs (F12)
4. تأكد من عدم وجود أخطاء في الطابعة نفسها

## 📝 ملاحظات تطويرية

- المشروع استخدم `node-thermal-printer` (يعم Windows USB)
- لا يحتاج تثبيت drivers خارجية - الاتصال واحد
- دعم QR codes ملون (أسود وأبيض)
- آمن - اللاعب بيانات eucaristic محلياً فقط
