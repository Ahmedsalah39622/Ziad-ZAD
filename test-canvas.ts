try {
  const canvas = require('@napi-rs/canvas');
  console.log('✅ Canvas loaded:', Object.keys(canvas));
  const { createCanvas } = canvas;
  const cv = createCanvas(200, 200);
  console.log('✅ Canvas created successfully!');
} catch (e) {
  console.error('❌ Canvas load failed:', e);
}

