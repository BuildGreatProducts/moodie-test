import { NextRequest, NextResponse } from "next/server";

interface ScrapeResult {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
}

// Simple HTML parser to extract meta tags and common product data
function extractProductData(html: string, url: string): ScrapeResult {
  const result: ScrapeResult = {};

  // Helper to extract meta content
  const getMetaContent = (html: string, property: string): string | undefined => {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i"),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        return decodeHtmlEntities(match[1]);
      }
    }
    return undefined;
  };

  // Helper to decode HTML entities
  function decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");
  }

  // Try to get product name from various sources
  result.name =
    getMetaContent(html, "og:title") ||
    getMetaContent(html, "twitter:title") ||
    getMetaContent(html, "product:title");

  // If no meta title, try to get from title tag
  if (!result.name) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.name = decodeHtmlEntities(titleMatch[1].trim());
      // Clean up common title suffixes
      result.name = result.name.replace(/\s*[|–-]\s*.+$/, "").trim();
    }
  }

  // Try to get description
  result.description =
    getMetaContent(html, "og:description") ||
    getMetaContent(html, "description") ||
    getMetaContent(html, "twitter:description");

  // Try to get image URL
  let imageUrl =
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image") ||
    getMetaContent(html, "product:image");

  // Make image URL absolute if relative
  if (imageUrl && !imageUrl.startsWith("http")) {
    try {
      const baseUrl = new URL(url);
      imageUrl = new URL(imageUrl, baseUrl.origin).href;
    } catch {
      // Keep as is if URL parsing fails
    }
  }
  result.imageUrl = imageUrl;

  // Try to get price from various sources
  const pricePatterns = [
    /"price":\s*"?(\d+(?:\.\d{2})?)/, // JSON-LD price
    /product:price:amount['"]\s*content=['"]([\d.]+)/, // OG price
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*\$?([\d,.]+)/, // Common price class
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/, // Dollar amount
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/,/g, "");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0 && price < 1000000) {
        result.price = price;
        break;
      }
    }
  }

  // Try to get currency
  const currencyMatch =
    html.match(/product:price:currency['"]\s*content=['"]([A-Z]{3})/) ||
    html.match(/"priceCurrency":\s*"([A-Z]{3})"/);
  if (currencyMatch) {
    result.currency = currencyMatch[1];
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const productData = extractProductData(html, url);

    // Return even partial data
    return NextResponse.json(productData);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape product" },
      { status: 500 }
    );
  }
}
