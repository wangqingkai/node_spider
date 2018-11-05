var request = require('request')
var cheerio = require('cheerio')

var fs = require('fs')
var async = require('async')
var xlsx = require('node-xlsx')

var options = [], n = 0, timeline = {};

for(var i = 1; i < 11; i++){
	options.push('https://www.cnblogs.com/news/#p' + i);
}

var dataArr = [
		{
			name: 'Sheet1',
			data: [
				['文章标题', 'URL']
			]
		}
	];

//request调用url主函数 (mapLimit iterator)
function main(option, callback) {
	n++;
	timeline[option] = new Date().getTime();
	console.log('现在的并发数是', n, '，正在抓取的是', option);
	request(option, function(err, res, body) {
		if(!err && res.statusCode == 200){
			var $ = cheerio.load(body);
			$('#post_list .post_item').each(function(index, element) {
				// console.log(element);
				//$(element).find('.post_item_body h3 a').text() + 
				// console.log('URL>>>' + $(element).find('.post_item_body h3 a').attr('href'));
				var item = [$(element).find('.post_item_body h3 a').text(),$(element).find('.post_item_body h3 a').attr('href')];
				dataArr[0].data.push(item);
			});
			console.log('抓取', option, '结束，耗时：', new Date().getTime()-timeline[option], '毫秒');
			n--;
			callback(null, 'done!');
		}else{
			console.log(err);
			n--;
			callback(err, null);
		}
	});
}

// async.mapLimit(options, 3, function(option, callback) {
// 	fetchUrl(option, callback);
// 	// request(option, main);
// 	// callback(null);
// }, function(err, result) {
// 	if(err) {
// 		console.log(err);
// 	} else {
// 		console.log('done!');
// 	}
// });

//限制请求并发数为3
async.mapLimit(options, 3, main.bind(this), function(err, result){
	if(err) {
		console.log(err);
	} else {
		fs.writeFile('data/cnbNews.xlsx', xlsx.build(dataArr), 'utf-8', function(err){
			if(err){
				console.log('write file error!');
			}else{
				console.log('write file success!');
			}
		});
	}
});