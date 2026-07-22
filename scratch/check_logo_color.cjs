const fs = require('fs');
const path = require('path');

// Check logo-emblem.svg first
const svgPath = path.join(__dirname, '../public/logo-emblem.svg');
if (fs.existsSync(svgPath)) {
  console.log('logo-emblem.svg exists. Size:', fs.statSync(svgPath).size);
  const content = fs.readFileSync(svgPath, 'utf8');
  // Check if it contains some hex codes
  const hexMatches = content.match(/#[0-9a-fA-F]{3,6}\b/g);
  if (hexMatches) {
    console.log('Hex colors found in SVG:', [...new Set(hexMatches)]);
  } else {
    console.log('No hex colors found directly in SVG.');
    // Let's print the first 1000 characters of the SVG to see its format
    console.log('First 1000 chars of SVG:', content.substring(0, 1000));
  }
} else {
  console.log('logo-emblem.svg does not exist.');
}
