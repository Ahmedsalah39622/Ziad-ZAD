#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function extractDataUris(input) {
  if (!input || typeof input !== 'string') return [];
  // Match data URIs (very permissive)
  const re = /data:[^\s"']+?;base64,[A-Za-z0-9+/=]+/g;
  const matches = input.match(re);
  if (matches && matches.length) return matches;
  return [];
}

function tryParseArrayField(raw) {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [raw];

  // Try JSON.parse
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch (e) {
    // Try to extract data URIs
    const dataUris = extractDataUris(raw);
    if (dataUris.length) return dataUris.map(u => ({ url: u, color: '' }));

    // Try newline or comma separated
    const lines = raw.split(/\r?\n|,/) .map(s => s.trim()).filter(Boolean);
    if (lines.length > 0) return lines;

    // Give up
    return [];
  }
}

async function main() {
  console.log('Starting product JSON repair...');
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const p of products) {
    const updateData = {};

    // images
    try {
      const imagesParsed = tryParseArrayField(p.images);
      // Ensure images are objects with url
      const normalizedImages = imagesParsed.map(it => typeof it === 'string' ? { url: it, color: '' } : it);
      const imagesJson = JSON.stringify(normalizedImages);
      if (imagesJson !== (p.images || '[]')) {
        updateData.images = imagesJson;
      }
    } catch (e) {
      console.warn('Failed to normalize images for', p.id, e);
    }

    // colors
    try {
      const colorsParsed = tryParseArrayField(p.colors);
      const colorsJson = JSON.stringify(colorsParsed);
      if (colorsJson !== (p.colors || '[]')) updateData.colors = colorsJson;
    } catch (e) {
      console.warn('Failed to normalize colors for', p.id, e);
    }

    // sizes
    try {
      const sizesParsed = tryParseArrayField(p.sizes);
      // If sizes are strings, convert to {name, stock}
      const sizesNormalized = sizesParsed.map(it => typeof it === 'string' ? { name: it, stock: p.stock || 0 } : it);
      const sizesJson = JSON.stringify(sizesNormalized);
      if (sizesJson !== (p.sizes || '[]')) updateData.sizes = sizesJson;
    } catch (e) {
      console.warn('Failed to normalize sizes for', p.id, e);
    }

    // details
    try {
      const detailsParsed = tryParseArrayField(p.details).map(String);
      const detailsJson = JSON.stringify(detailsParsed);
      if (detailsJson !== (p.details || '[]')) updateData.details = detailsJson;
    } catch (e) {
      console.warn('Failed to normalize details for', p.id, e);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({ where: { id: p.id }, data: updateData });
      console.log('Fixed', p.id, Object.keys(updateData));
      updated++;
    }
  }

  console.log(`Completed. Products updated: ${updated}/${products.length}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect().then(() => process.exit(1));
});
