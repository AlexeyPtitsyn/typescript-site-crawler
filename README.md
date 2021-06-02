# Website crawler

Simple site crawler. Build with Typescript.

## Setup

Run `npm install` to install dependencies.

## Start

`npm start` to start crawling site. Site is defined in `examples/check-site.ts`.

## Examples

```ts
let crawler = new Crawler();

// Change useragent:
crawler.userAgent = 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405';

let siteUrl = 'https://example.com';

// Getting page data:
let pageData = await crawler.getURI(siteUrl);

console.log(`Page content: ${pageData.data}`);
console.log(`Page status code: ${pageData.status}`);

// Getting site map and its URLs:
let siteMapUrl = await crawler.findSiteMap(siteUrl);
let urls = await crawler.getSiteMapURLs(siteMapUrl);

console.log('Site map urls:');
console.log(urls);

// Getting unique site map url:
let pageUrls = crawler.getURLs(pageData.data, siteUrl);

console.log('URLs on page:');
console.log(pageUrls);
```

Other examples are in `examples/` directory.
