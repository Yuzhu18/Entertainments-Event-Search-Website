
var express = require("express");
var app = express();
var port = process.env.PORT || 8088;
var https =require("https");
var url = require("url");
var geohash = require('ngeohash');
var spotify = require('spotify-web-api-node');


// var cors = require("cors");
// app.use(cors());

app.use(express.static('public'));


// app.get('/cur_loc', function(req, res){
//
//     res.setHeader("Content-Type","text/plain");
//     res.setHeader("Access-Control-Allow-Origin","*");
//
//     https.get("https://ip-api.com/json", function(req2,res2){
//         var cur_res = "";
//         req2.on('data',function(data){
//             cur_res += data;
//         });
//         req2.on('end',function(){
//             console.log("server cur loc :" + cur_res);
//             return res.send(cur_res);
//         });
//     });
// });


app.get('/auto_complete', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    var autoUrl = "https://app.ticketmaster.com/discovery/v2/suggest?apikey=x1yqJ2mxEfexyGTEKjQwOSJKzH3sPPAB" + "&keyword=" + para.autoComplete;

    https.get(autoUrl, function(req2,res2){
        var auto_res = "";
        req2.on('data',function(data){
            auto_res += data;
        });
        req2.on('end',function(){
            return res.send(auto_res);
        });
    });
});




app.get('/input_loc', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("input loc: " + para.inputLoc);/////////////////////

    var inputUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + para.inputLoc + "&key=AIzaSyD3vy_5SYNS_4mmdb1xTm8XaLmi2JS09vo";

    https.get(inputUrl, function(req2,res2){
        var input_res = "";
        req2.on('data',function(data){
            input_res += data;
        });
        req2.on('end',function(){
            return res.send(input_res);
        });
    });
});


app.get('/search_rst', function (req, res) {

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var params = url.parse(req.url, true).query;

    var category = params.category;

    var segmentId = "";
    if(category === "music"){
        segmentId = "KZFzniwnSyZfZ7v7nJ";
    }else if(category === "sports"){
        segmentId = "KZFzniwnSyZfZ7v7nE";
    }else if(category === "arts"){
        segmentId = "KZFzniwnSyZfZ7v7na";
    }else if(category === "film"){
        segmentId = "KZFzniwnSyZfZ7v7nn";
    }else if(category === "miscellaneous"){
        segmentId = "KZFzniwnSyZfZ7v7n1";
    }


    var geoPoint = geohash.encode(parseFloat(params.locLat), parseFloat(params.locLng));

    console.log("keyword is:" + params.keyword);//////////////////////////////////////////
    console.log("segmentId is:" + segmentId);//////////////////////////////////////////
    console.log("radius is:" + params.distance);//////////////////////////////////////////
    console.log("unit is:" + params.unit);//////////////////////////////////////////
    console.log("lat is:" + params.locLat);//////////////////////////////////////////
    console.log("lng is:" + params.locLng);//////////////////////////////////////////
    console.log("geopoint is:" + geoPoint);//////////////////////////////////////////

    var ticketUrl = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=x1yqJ2mxEfexyGTEKjQwOSJKzH3sPPAB" + "&keyword=" + params.keyword + "&segmentId=" + segmentId + "&radius=" + params.distance + "&unit=" + params.unit +"&geoPoint=" + geoPoint;

    https.get(ticketUrl, function(req2,res2){
        var search_res = "";
        req2.on('data',function(data){
            search_res += data;
        });
        req2.on('end',function(){
            // console.log("search rst is :" + search_res);///////////////////////////////////
            return res.send(search_res);

        });
    });
});


// invoke event detail API
app.get('/event_detail', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("event id : " + para.eventId);////////////////////////

    var detailUrl = "https://app.ticketmaster.com/discovery/v2/events/" +para.eventId + "?apikey=x1yqJ2mxEfexyGTEKjQwOSJKzH3sPPAB&";

    https.get(detailUrl, function(req2,res2){
        var detail_res = "";
        req2.on('data',function(data){
            detail_res += data;
        });
        req2.on('end',function(){
            return res.send(detail_res);
        });
    });
});

//google get image api
app.get('/img_rst', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("search content is : " + para.search);/////////////////////////////////////

    var imgUrl = "https://www.googleapis.com/customsearch/v1?q="+ para.search +"&cx=005172689902481577915:rf3fcc2ixcm&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyAm92MOn5DSlepEbGHXgryJVg6BoYzsmws";

    https.get(imgUrl, function(req2,res2){

        var img_res = "";
        req2.on('data',function(data){
            img_res += data;
        });
        req2.on('end',function(){
            // console.log("images server is :" + img_res);/////////////////////////////////////
            return res.send(img_res);
        });
    });
});


// get upcoming id api
app.get('/upcoming_id', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("upcoming venue name is : " + para.upcomingId);/////////////////////////////////////

    var idUrl = "https://api.songkick.com/api/3.0/search/venues.json?query="+ para.venueName +"&apikey=lyqb4LQZWDoK45WH";

    https.get(idUrl, function(req2,res2){

        var id_res = "";
        req2.on('data',function(data){
            id_res += data;
        });
        req2.on('end',function(){
            // console.log("id server is :" + id_res);/////////////////////////////////////
            return res.send(id_res);
        });
    });
});

//get upcoming events api
app.get('/upcoming_event', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("upcoming id is : " + para.upcomingId);/////////////////////////////////////

    var upcomingUrl = "https://api.songkick.com/api/3.0/venues/"+ para.upcomingId +"/calendar.json?apikey=lyqb4LQZWDoK45WH";

    https.get(upcomingUrl, function(req2,res2){

        var upcoming_res = "";
        req2.on('data',function(data){
            upcoming_res += data;
        });
        req2.on('end',function(){
            // console.log("upcoming events server is :" + upcoming_res);/////////////////////////////////////
            return res.send(upcoming_res);
        });
    });
});

// spotify api
app.get('/artist_rst', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    var artist = para.artist;
    console.log("artist is : " + artist);///////////////////////////////////////////////


    //spotify api
    var clientId = '442bc4722cd3409b85a47363fa8c8b40',
        clientSecret = '1ae83fd89576443cb8889f8f60d5816c';

    var spotifyApi = new spotify({
        clientId: clientId,
        clientSecret: clientSecret
    });

    spotifyApi.clientCredentialsGrant().then(
        function(data) {

            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.searchArtists(artist)
                .then(function(data) {
                    console.log("artist: " + artist + "rst is: ");/////////////////////////////////
                    console.log(data.body);///////////////////////////////////////////////////////////////
                    console.log("rst items is: ");//////////////////////////////////////
                    console.log(data.body.artists.items);////////////////////////
                    res.send(data.body);

                }, function(err) {
                    console.error(err);
                });
        },
        function(err) {
            console.log('Wrong!', err);
        }
    );

});


//get venue info api
app.get('/venue_rst', function(req, res){

    res.setHeader("Content-Type","text/plain");
    res.setHeader("Access-Control-Allow-Origin","*");
    var para = url.parse(req.url, true).query;

    console.log("venue is : " + para.venue);/////////////////////////////////////

    var venueUrl = "https://app.ticketmaster.com/discovery/v2/venues?apikey=x1yqJ2mxEfexyGTEKjQwOSJKzH3sPPAB&keyword=" + para.venue;

    https.get(venueUrl, function(req2,res2){

        var venue_res = "";
        req2.on('data',function(data){
            venue_res += data;
        });
        req2.on('end',function(){
            // console.log("venue server is :" + venue_res);/////////////////////////////////////
            return res.send(venue_res);
        });
    });
});


var server = app.listen(port, function () {

    console.log("express started !");

    var host = server.address().address;////////////////////////////
    var port = server.address().port;/////////////////////////////////

    console.log("host is : "+ host + " port is :" + port)

});