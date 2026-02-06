import { NextRequest, NextResponse } from "next/server";

interface ScrapeResult {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
}

// Maximum HTML body size to process (5MB)
const MAX_HTML_BYTES = 5 * 1024 * 1024;

// Simple in-memory rate limiting (per IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Private IP ranges to block (SSRF protection)
function isPrivateOrLocalIP(hostname: string): boolean {
  // Check for localhost variants
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname === "0.0.0.0"
  ) {
    return true;
  }

  // Check for private IP ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b, c] = ipv4Match.map(Number);
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 224.0.0.0/4 (multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (reserved)
    if (a >= 240) return true;
    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
  }

  // Check for IPv6 private ranges (simplified)
  if (hostname.startsWith("fe80:") || hostname.startsWith("[fe80:")) return true; // Link-local
  if (hostname.startsWith("fc") || hostname.startsWith("[fc")) return true; // Unique local
  if (hostname.startsWith("fd") || hostname.startsWith("[fd")) return true; // Unique local

  return false;
}

// Check rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Read response body with size limit
async function readBodyWithLimit(
  response: Response,
  maxBytes: number
): Promise<{ html: string; truncated: boolean } | null> {
  const reader = response.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;
      if (totalBytes > maxBytes) {
        truncated = true;
        // Add partial chunk up to the limit
        const remaining = maxBytes - (totalBytes - value.length);
        if (remaining > 0) {
          chunks.push(value.slice(0, remaining));
        }
        break;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const decoder = new TextDecoder("utf-8", { fatal: false });
  const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return { html: decoder.decode(combined), truncated };
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
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format and protocol
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Only allow http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are allowed" },
        { status: 400 }
      );
    }

    // Block private/local IPs (SSRF protection)
    if (isPrivateOrLocalIP(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "Access to internal addresses is not allowed" },
        { status: 403 }
      );
    }

    // Fetch the page with redirect: "manual" to prevent open redirect attacks
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Handle redirects manually to check destination
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        try {
          const redirectUrl = new URL(location, url);
          if (isPrivateOrLocalIP(redirectUrl.hostname)) {
            return NextResponse.json(
              { error: "Redirect to internal address is not allowed" },
              { status: 403 }
            );
          }
          // Return redirect info to client
          return NextResponse.json(
            { error: "URL redirects to another location", redirectUrl: redirectUrl.href },
            { status: 302 }
          );
        } catch {
          return NextResponse.json({ error: "Invalid redirect URL" }, { status: 502 });
        }
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    // Validate content-type
    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 415 }
      );
    }

    // Read body with size limit
    const bodyResult = await readBodyWithLimit(response, MAX_HTML_BYTES);
    if (!bodyResult) {
      return NextResponse.json({ error: "Failed to read response body" }, { status: 502 });
    }

    if (bodyResult.truncated) {
      console.warn(`Response body truncated for URL: ${url}`);
    }

    const productData = extractProductData(bodyResult.html, url);

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
