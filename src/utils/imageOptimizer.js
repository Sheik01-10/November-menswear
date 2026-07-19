export function getOptimizedImageUrl(url, width = 600) {
  if (!url) return url;
  
  // If the image is loaded from Unsplash
  if (url.includes("unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("q", "80");
      return urlObj.toString();
    } catch (e) {
      // Fallback regex replacement if URL parsing fails
      let optimized = url;
      if (optimized.includes("w=")) {
        optimized = optimized.replace(/w=\d+/, `w=${width}`);
      } else {
        optimized += `&w=${width}`;
      }
      if (optimized.includes("q=")) {
        optimized = optimized.replace(/q=\d+/, "q=80");
      } else {
        optimized += "&q=80";
      }
      if (!optimized.includes("auto=")) {
        optimized += "&auto=format";
      }
      return optimized;
    }
  }
  
  return url;
}
