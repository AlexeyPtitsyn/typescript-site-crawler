/**
 * @file This script crawls site and gathering page meta-tags
 *       to the `test.csv` file.
 * @copyright Alexey Ptitsyn <numidium.ru@gmail.com>, 2021.
 */

import Crawler from '../src/crawler';
import * as fs from 'fs';

const siteUrl = 'https://www.youtube.com';

const crawler = new Crawler();

/**
 * Success request result.
 * 
 * @param data - Page content.
 * @param status - Response code.
 */
interface ISuccessRequestResult {
  data: string,
  status: number
}

fs.writeFile(__dirname + '/test.csv',
  'URL\tSTATUS\tTITLE\tROBOTS\tKEYWORDS\tDESCRIPTION\n',
  (err) => {
  if(err) {
    console.log(`Write file error: ${err.message}`);
  }
  
  main();
});

async function main() {
  const siteMapUri = siteUrl + '/about/sitemap.xml'; //await crawler.findSiteMap(siteUrl);
  
  console.log(`Getting "${siteMapUri}"...`);

  const siteMapResponse = await crawler.getURI(siteMapUri);
  const siteMapData = siteMapResponse.data;

  const urls:Array<string> = siteMapData.match(/<loc>.*?<\/loc>/g);
  
  let urlList:Array<string> = [];
  for(const url of urls) {
    let urlItem = url.match(/<loc>(.*?)<\/loc>/)[1];
    urlList.push(urlItem);
  }

  console.log(`Total urls: ${urlList.length}`);

  // Start processing url one by one. From first:
  processUrl(urlList, urlList.length, 1);

  // vvv--- Auxillary functions ---vvv

  /**
   * Get value with regexp or return an empty string.
   * @param item - Item as string.
   * @param re - Regexp
   */
  function getValue(item:string, re:RegExp):string {
    let res = item.match(re);
    if(res === null) {
      return '';
    }
    return res[1];
  }

  /**
   * Process one URL.
   * @param list - List of URLs.
   * @param len - List length.
   * @param iter - Iterator.
   */
  async function processUrl(list:Array<string>, len:number, iter:number) {
    if(!list.length) {
      console.log('Done!');
      return;
    }

    const url = list.splice(0, 1).toString();

    async function appendLog(dataString:string) {
      return new Promise((resolve, reject) => {
        fs.appendFile(__dirname + '/test.csv', dataString, (err) => {
          if(err) {
            reject(new Error(`File error: ${err.message}`));
          }

          resolve(null);
        });
      });
    }

    function cont() {
      iter++;
      processUrl(list, len, iter);
    }

    // ^^^--- Auxillary functions ---^^^


    let urlResponse: ISuccessRequestResult;
    try {
      urlResponse = await crawler.getURI(url);
    } catch (err) {
      console.log(`[${iter}/${len}]: URL: '' - Error: ${err.message}`);
      cont();
      return;
    }

    const urlData = urlResponse.data;
    const status = urlResponse.status;

    let title = getValue(urlData, /<title>(.*?)<\/title>/);
    let robots = getValue(urlData, /<meta name="robots" content="(.*?)"/);
    let keywords = getValue(urlData, /<meta name="keywords" content="(.*?)"/);
    let description = getValue(urlData, /<meta name="description" content="(.*?)"/);

    console.log(`[${iter}/${len}]: URL: '${url}' - Loaded(${status})`);

    const fileLogString = `${url}\t${status}\t${title}\t${robots}\t${keywords}\t${description}\n`;

    try {
      await appendLog(fileLogString);
    } catch(err) {
      console.log(`Write file error: ${err.message}`);
    }

    cont();
  } // processUrl();
} // main();
