var rp = require("request-promise")
var cheerio = require('cheerio')

var path = require('path')
var fs = require('fs')

module.exports = {
	async getPage(url) {
	    var data = {
	      url,
	      res: await rp({
	        url: url
	      })
	    };
	    return data;
	},
	getImagesNum(res, name) {
	    if (res) {
	      var $ = cheerio.load(res);
	      var len = $(".pagenavi")
	        .find("a")
	        .find("span").length;
	      if (len == 0) {
	        fs.rmdirSync('image/' + name);//删除无法下载的文件夹
	        return 0;
	      }
	      var pageIndex = $(".pagenavi")
	        .find("a")
	        .find("span")[len - 2].children[0].data;
	      return pageIndex;//返回图片总数
	    }
	},
	async FileName(url) {
		var fileName = await path.basename(url);
	    return fileName;
	},
	async downloadImg(data, url) {
		var imgData = await this.getPage(url);
		var $ = cheerio.load(imgData.res);
		if ($(".main-image").find("img")[0]) {
	        var imgSrc = $(".main-image").find("img")[0].attribs.src;//图片地址

	        var headers = {
		      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		      "Accept-Encoding": "gzip, deflate",
		      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
		      "Cache-Control": "no-cache",
		      Host: "i.meizitu.net",
		      Pragma: "no-cache",
		      "Proxy-Connection": "keep-alive",
		      Referer: data.url,
		      "Upgrade-Insecure-Requests": 1,
		      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.19 Safari/537.36"
		    };//反防盗链

		    var fileName = await this.FileName(imgSrc.toString());
		    await rp({
		      url: imgSrc,
		      resolveWithFullResponse: true,
		      headers
		    }).pipe(fs.createWriteStream('image/' + data.name + '/' + fileName));//下载
	  	}
	}
};