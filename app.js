var express = require("express");

var app = new express();

var spider = require("./models/spider").spider;

app.set("view engine","ejs");

app.use(express.static("./public"));

app.use("/index",function(req,res){
    res.render("index",{});
});

app.use("/notice",spider);

app.listen(3000);