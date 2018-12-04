var request = require('request')
var cheerio = require('cheerio')

var fs = require('fs')
var async = require('async')

var spiderModule = require("./webSpiderModule")

var options = [], list = [], imgList = [];

for(var i = 1; i < 2; i++){
	options.push('http://www.mzitu.com/page/' + i);
}

//request调用url主函数 (mapLimit iterator)
function main(option, callback) {
	request(option, function(err, res, body) {
		if(!err && res.statusCode == 200){
			var $ = cheerio.load(body);
			$("#pins li a").children().each(async (i, e) => {
		        var obj = {
		          name: e.attribs.alt, //图片网页的名字，后面作为文件夹名字
		          url: e.parent.attribs.href //图片网页的url
		        };
		        list.push(obj); //输出目录页查询出来的所有链接地址
	      	});
			callback(null, list);
		}else{
			console.log(err);
			callback(err, null);
		}
	});
}

function main2(option, callback) {
	request(option, function(err, res, body) {
		if(!err && res.statusCode == 200){
			var $ = cheerio.load(body);
			if ($(".main-image").find("img")[0]) {
		        var imgSrc = $(".main-image").find("img")[0].attribs.src;//图片地址
		        imgList.push(imgSrc);
				callback(null, imgList);
		      }
		}else{
			console.log(err);
			callback(err, null);
		}
	});
}

//限制请求并发数为3
async.mapLimit(options, 3, main.bind(this), async function(err, result){
	if(err) {
		console.log(err);
	} else {
		for(var i = 0; i < result[0].length; i++){

		    if (!fs.existsSync('image/' + result[0][i].name)) {//查看是否存在这个文件夹
		      fs.mkdirSync('image/' + result[0][i].name);//不存在则新建文件夹
		    }

			var data = await spiderModule.getPage(result[0][i].url);
			var imagesNum = await spiderModule.getImagesNum(data.res, result[0][i].name);
			console.log(result[0][i].name, imagesNum, '张，准备下载...');
			for(var j = 1; j < imagesNum; j++){
				spiderModule.downloadImg(result[0][i], result[0][i].url + '/' + j);
			}
			console.log('下载完成！');
		}
		
	}
});