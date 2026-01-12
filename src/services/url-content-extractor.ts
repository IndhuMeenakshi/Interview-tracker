'use server';

import { JSDOM } from 'jsdom';

export async function extractDataFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new dom.window.DOMParser();
    const doc = reader.parseFromString(dom.window.document.body.innerHTML, 'text/html');
    
    // Remove script and style elements
    doc.querySelectorAll('script, style').forEach(el => el.remove());

    // Get text content
    let textContent = doc.body.textContent || "";

    // Basic cleanup
    textContent = textContent.replace(/\s\s+/g, ' ').trim();

    return textContent;
  } catch (error) {
    console.error(`Error extracting content from URL ${url}:`, error);
    throw new Error('Could not extract content from the provided URL.');
  }
}
