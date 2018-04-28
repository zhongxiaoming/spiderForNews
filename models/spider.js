var http = require("http");
var https = require("https");

var cheerio = require('cheerio');
var fs = require("fs");

const bithumbUrl = "http://bithumb.cafe/notice";
const upbitUrl = "https://upbit.com/service_center/notice";
const upbitOptions = {
    hostname: 'api-manager.upbit.com',
    port: 443,
    path: '/api/v1/notices?page=1&per_page=20',
    method: 'GET'
};


function spider(req,res){
    var data = {
        bithumb:[],
        upbit:[]
    };
    var bithumbFinish = 0,upbitFinish = 0;

    //bithumb

    http.get(bithumbUrl,function(res1){
        var html = "";//用来存储获取的HTML内容
        //监听Data事件，每次获取一部分数据
        res1.on("data",function(chunk){
            html += chunk;
        });
        //监听End，当加载完成则进入该方法事件中，执行回调函数
        res1.on("end",function(){
            var $ = cheerio.load(html);
            $(".container").find(".entry-content").each(function(){
                var coin = $(this).find("p").text().match(/\([A-Z]{3,}?\)/g);
                var coinLink = $(this).find("a").attr("href");
                if (coin){
                    coin.forEach(function(item){
                        data.bithumb.push({
                            coin:item.slice(1,-1),
                            coinLink:coinLink
                        });
                    });
                }
            });
            bithumbFinish = 1;
            upbitFinish&&res.end(JSON.stringify(data));
        });
    });

    //upbit

    var upbitReq = https.request(upbitOptions, function(res2){
        var upbitData = "";
        res2.on('data', function(chunk){
            upbitData += chunk;
        });
        res2.on("end",function(){
            upbitData = JSON.parse(upbitData);
            upbitData.data.list.forEach(function(item){
                var coin = item.title.match(/\((.*[A-Z]{2,})\)?/g);
                if (coin){
                    coin.forEach(function(coinname){
                        coinname.replace(/([A-Z]{2,})/g,function($1){
                            data.upbit.push({
                                coin:$1,
                                coinLink:upbitUrl + "?id=" + item.id
                            });
                        });
                    });
                }
            });
            upbitFinish = 1;
            bithumbFinish&&res.end(JSON.stringify(data));
        });
    });

    upbitReq.on('error', function(err){
        console.error(err);
    });

    upbitReq.end();
}

exports.spider = spider;










