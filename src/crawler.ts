/**
 * @file Crawler module.
 * @author Alexey Ptitsyn <numidium.ru@gmail.com>
 * @copyright Alexey Ptitsyn <numidium.ru@gmail.com>, 2021
 */
import * as https from 'https';

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

class Crawler {
  /** @var userAgent - User agent string. */
  userAgent: string;

  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0 Safari/537';
  }

  /**
   * Make HTTP(S) request.
   * @param uri - Uri to request.
   */
  getURI(uri: string):Promise<ISuccessRequestResult> {
    const options = {
      headers: {
        'User-Agent': this.userAgent
      }
    };


    return new Promise((resolve, reject) => {
      const request = https.request(uri, options, (res) => {
        const status = res.statusCode;
        let data = '';
  
        res.on('data', function(chunk) {
          data += chunk;
        });
  
        res.on('end', () => {
          resolve({
            data: data,
            status: status
          });
        });
      });
  
      request.on('error', (e) => {
        reject(e);
      });
  
      request.end();
    });
  } // getURI()

  /**
   * Get an array of unique URLS from HTML page content.
   * @param data - HTML page content.
   * @param prefix - URL prefix (e.g. site address).
   */
  getURLs(data:string, prefix:string = null):Array<string> {
    const re = new RegExp('(?:href|src)="(.*?)"', 'g');

    let hrefs = [];

    let match = re.exec(data);
    while(match != null) {
      hrefs.push(match[1]);
      match = re.exec(data);
    }

    // Remove wrong urls:
    hrefs = hrefs.filter(str => {
      const re = /^\/[a-zA-Z0-9].*$/;
      return re.test(str);
    });

    if(prefix) {
      hrefs = hrefs.map((item) => {
        if(item[0] == '/') {
          return prefix + item;
        }
        return prefix + '/' + item;
      });
    }

    // Filter unique:
    hrefs = hrefs.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    return hrefs;
  } // getURLs();

  /**
   * Find site map on site.
   * @param url - Site url. Without trailing slash.
   */
  async findSiteMap(url:string):Promise<string> {
    const res = await this.getURI(`${url}/robots.txt`);
    const sURL = res.data.match(/^Sitemap:\s+?(.*?)$/m);
    if(sURL == null) {
      throw new Error('Sitemap was not found in `robots.txt`');
    }

    return sURL[1];
  } // findSiteMap();

  /**
   * Get list of site map URLs.
   * @param url - Site map url.
   */
  async getSiteMapURLs(url):Promise<Array<string>> {
    const res = await this.getURI(url);

    const data = res.data;
    const re = new RegExp('<loc>(.*?)<\\/loc>', 'g');

    let hrefs = [];

    let match = re.exec(data);
    while(match != null) {
      hrefs.push(match[1]);
      match = re.exec(data);
    }

    // Filter unique:
    hrefs = hrefs.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    return(hrefs);
  } // getSiteMapURLs();
}

export default Crawler;
