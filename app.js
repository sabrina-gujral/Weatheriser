const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
var fs = require("fs");

const app = express();
app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

require.extensions['.txt'] = function(module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var key = require("./key.txt");

app.get('/', function(req, res) {
    res.render('index');
})

app.post("/", function(req, res) {
    const apiKey = key;
    var units = "metric";
    var q = req.body.place;
    var re = new RegExp('[a-z]*[A-Z]*[0-9][a-z]*[A-Z]*');

    if (q.length === 0 || re.test(q) === true ) {
        res.render('failure');
    } else {

        const url = "https://api.openweathermap.org/data/2.5/weather?q=" + q + "&appid=" + apiKey + "&units=" + units + "";

        https.get(url, function(response) {
            response.on("data", function(data) {
                const today = new Date();
                const day = today.toDateString().split(' ')[0];
                const hours = today.getHours();
                const minutes = today.getMinutes();

                const weatherData = JSON.parse(data);
                const code = weatherData.sys.country;
                const temp = weatherData.main.temp;
                const feels_like = weatherData.main.feels_like;
                const min_temp = weatherData.main.temp_min;
                const max_temp = weatherData.main.temp_max;
                const humidity = weatherData.main.humidity;
                const desc = weatherData.weather[0].description;
                const wind = weatherData.wind.speed;
                const icon = weatherData.weather[0].icon;
                const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

                res.render('weather', {
                    desc: desc,
                    temp: temp,
                    min_temp: min_temp,
                    max_temp: max_temp,
                    feels_like: feels_like,
                    humidity: humidity,
                    place: q,
                    wind: wind,
                    day: day,
                    hours: hours,
                    minutes: minutes,
                    url: imageURL,
                    code: code,
                })

            })

        })

    }
})

app.listen(3000, function() {
    console.log("server running at port 3000..");
})