import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  imageUrl?: string;
  youtubeUrl?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogType = 'website',
  imageUrl,
  youtubeUrl
}: SEOProps) => {
  useEffect(() => {
    // 1. Dynamic Title
    const brandTitle = `${title} | Team Felco Official`;
    document.title = brandTitle;

    // Helper to get or create meta tags
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    } else {
      setMetaTag('name', 'keywords', 'team felco, colour trading hack, vip hack, bdwins hack, hack tutorial, game predictor');
    }

    // 3. OpenGraph tags
    setMetaTag('property', 'og:title', brandTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', window.location.href);
    if (imageUrl) {
      setMetaTag('property', 'og:image', imageUrl);
    }

    // 4. Twitter / X Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', brandTitle);
    setMetaTag('name', 'twitter:description', description);
    if (imageUrl) {
      setMetaTag('name', 'twitter:image', imageUrl);
    }

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.href);

    // 6. Structured Schema (JSON-LD) for Search Engine Rich Snippets
    let schemaScript = document.getElementById('json-ld-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'json-ld-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': ogType === 'product' ? 'Product' : 'WebApplication',
      'name': title,
      'description': description,
      'url': window.location.href,
      'applicationCategory': 'GameApplication',
      'operatingSystem': 'Android, iOS, Windows, Web',
      ...(imageUrl ? { 'image': imageUrl } : {}),
      ...(youtubeUrl ? { 'video': youtubeUrl } : {}),
      'offers': {
        '@type': 'Offer',
        'price': '450',
        'priceCurrency': 'BDT'
      }
    };

    schemaScript.textContent = JSON.stringify(schemaData);
  }, [title, description, keywords, ogType, imageUrl, youtubeUrl]);
};
