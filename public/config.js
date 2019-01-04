

var myApp = angular.module('myApp', ['ngMaterial', 'ngAnimate', 'ngMessages', 'igTruncate', 'angular-svg-round-progressbar']);

myApp.controller('mainCtrl', function($scope, $http, $animate, $timeout, $log ) {


    var artist_array = [];
    var artist_html = "";
    $scope.showProgress = false;///////////////////////////
    $scope.showFirstTable = false;///////////////////////
    $scope.showDetailTable = false;//////////////////////////////////
    $scope.has_price = false; ////////////
    $scope.activeResult = false;////////////
    $scope.clickList = false; // click List button///
    $scope.showFavT = false;

    $scope.hasRst = true; // first search table corner case
    $scope.hasEvent = true;//sub table 1 corner case
    $scope.hasTeam = true;//sub table 2 corner case
    $scope.hasVenue = true; //sub table 2 corner case
    $scope.hasComing = true; //sub table 2 corner case

    $scope.activeFav = false;
    $scope.FavList =false;
    $scope.rightFav = false;
    $scope.inFav = false;

    $scope.curLoc = function(){
        document.getElementById("input_location").disabled = true;
    };

    $scope.readLoc = function(){
        document.getElementById("input_location").disabled = false;
    };


    // $http({
    //     method: 'GET',
    //     url: 'http://ip-api.com/json'
    // }).then(function successCallback(response) {
    //
    //     $scope.cur_lat = response.data.lat;
    //     $scope.cur_lng = response.data.lon;
    //
    //     console.log("lat is: " + $scope.cur_lat + " lng is: " + $scope.cur_lng);//////////////////
    //     // this callback will be called asynchronously
    //     // when the response is available
    // }, function errorCallback(response) {
    //     console.log(response.status);
    //     // called asynchronously if an error occurs
    //     // or server returns response with an error status.
    // });




            //autocomplete ticket master API

            $http({
                method: 'GET',
                url: 'https://app.ticketmaster.com/discovery/v2/suggest?apikey=x1yqJ2mxEfexyGTEKjQwOSJKzH3sPPAB&keyword=laker'
            }).then(function successCallback(response) {
                var autodata = response.data._embedded.attractions;

                var rst = "";
                for (var i = 0; i < autodata.length - 1; i++) {
                    if (autodata[i] !== undefined) {
                        rst += autodata[i]["name"] + ", ";
                        console.log("name is: " + autodata[i]["name"]);
                    }
                }
                rst += autodata[autodata.length - 1]["name"];

                console.log("rst string is : " + rst);/////////////////

                $scope.aa = rst.split(/, +/g).map(function (state) {

                    return {
                        value: state.toLowerCase(),
                        display: state
                    };
                });

                console.log("after split is: " + $scope.aa[0].value);
                mylists = $scope.aa;
                console.log("mylist: " + mylists[0].value);

            }, function errorCallback(response) {
                console.log(response.status);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });





    $scope.getCurLoc = function(){

        $http({
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address=University+of+Southern+California&key=AIzaSyD3vy_5SYNS_4mmdb1xTm8XaLmi2JS09vo'
        }).then(function successCallback(response) {

            $scope.cur_lat = response.data.results[0].geometry.location.lat;
            $scope.cur_lng = response.data.results[0].geometry.location.lng;

            console.log("lat is: " + $scope.cur_lat + " lng is: " + $scope.cur_lng);//////////////////
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            console.log(response.status);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.getInputLoc = function() {


        $scope.showProgress = true;


        var para = "inputLoc=" + $scope.inputLocation;

        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/input_loc?"+ para)
            .then(function(response) {
                $scope.input_lat = response.data["results"][0]["geometry"]["location"]["lat"];
                $scope.input_lng = response.data["results"][0]["geometry"]["location"]["lng"];
                console.log("input lat is: " + $scope.input_lat + "input lng is : " + $scope.input_lng);//////////////////////
                //start to search
                $scope.searchStart();
            });
    };



    $scope.searchStart = function () {

        var params="";
        if($scope.myLocation==="cur_location"){

            params += "keyword=" + $scope.myKeyword + '&' +
                "category=" + $scope.myCategory + '&' +
                "distance=" + $scope.myDistance + '&' +
                "locLat=" + $scope.cur_lat+ '&' +
                "locLng=" + $scope.cur_lng+ '&' +
                "unit=" + $scope.form_mile;
        }
        else if($scope.myLocation==="other_location"){

            console.log("trans lat：" + $scope.input_lat + "trans lng is : " + $scope.input_lng);/////////////////////////

            params += "keyword=" + $scope.myKeyword + '&' +
                "category=" + $scope.myCategory + '&' +
                "distance=" + $scope.myDistance + '&' +
                "locLat=" + $scope.input_lat + '&' +
                "locLng=" + $scope.input_lng + '&' +
                "unit=" + $scope.form_mile;
        }
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/search_rst?"+ params)
            .then(function(response) {

                if(response.data["_embedded"] === undefined){
                    $scope.showProgress = false;
                    $scope.activeResult = true;
                    $scope.hasRst = false;

                }else{
                    $scope.firstTable = response.data["_embedded"]["events"];
                    console.log("from resp: " + response.data["_embedded"]["events"][0]["name"]);////////////////////

                    $scope.showProgress = false;
                    $scope.showFirstTable = true;
                    $scope.activeResult = true;
                    document.getElementById("detailBtn").disabled = true;//@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                }


            });
    };


    $scope.getDetail = function(element, id, curE){

        artist_array = [];
        artist_html = "";

        // upcoming init
        $scope.sort_by = 'default';
        $scope.sort_expression = '';

        if($scope.inFav){
            $scope.proStar = true;
            $scope.activeFav = true;
            document.getElementById("processStar").classList.add("fas"); // set the four table star to be lighted
            $scope.showFavT = false;
            var favor_yellow_id = element + "_fav";
            document.getElementById(favor_yellow_id).classList.add("table-warning");
        }
        $scope.showFirstTable = false;
        $scope.clickList = false;
        $scope.clickLeft =true;
        $scope.showProgress = true;
        $scope.curEvent = curE;   //current json element

        // set the empty form first in the event detail table
        $scope.has_time = false;
        $scope.has_venue = false;
        $scope.has_category = false;
        $scope.has_art = false;
        $scope.has_price = false;
        $scope.has_ticket = false;
        $scope.has_buy = false;
        $scope.has_seat = false;

        console.log("current event is: " );//////////////////////////////////////////////////
        console.log($scope.curEvent);//////////////////////////////////////////////////
        console.log("cur event id is: " + $scope.curEvent.id);//////////////////////////////////////////////

        var yellow_id = element + "_event";
        document.getElementById(yellow_id).classList.add("table-warning");

        console.log("event id is: " + element);////////////////////////////////////////
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/event_detail?eventId=" + element)
            .then(function(response) {
                $scope.event_detail = response.data;

                if($scope.event_detail._embedded === undefined){

                    $scope.showProgress = false;
                    $scope.hasEvent = false;
                    document.getElementById("allEvent").style.display = "none";

                }else{
                    $scope.event_name = $scope.event_detail.name;
                    $scope.event_url = $scope.event_detail.url;

                    if($scope.event_detail._embedded.venues !== undefined){
                        $scope.event_venue = $scope.event_detail._embedded.venues[0].name;
                        console.log("venue is : " + $scope.event_venue );//////////////////////////////////////
                        $scope.has_venue = true;
                    }

                    if($scope.event_detail.dates !== undefined){
                        $scope.event_time = $scope.event_detail.dates.start.localDate + " " + $scope.event_detail.dates.start.localTime;
                        $scope.has_time = true;
                    }

                    if($scope.event_detail.classifications !== undefined){
                        $scope.event_category_name = $scope.event_detail.classifications[0].segment.name;
                        if($scope.event_category_name === "Music"){
                            $scope.isMusic = true; ///////////////////////////////////////
                        }
                        $scope.event_category = $scope.event_detail.classifications[0].genre.name + " | " + $scope.event_detail.classifications[0].segment.name;
                        $scope.has_category = true;
                    }


                    if($scope.event_detail._embedded.attractions !== undefined){
                        var art = "";
                        //use for spotify api
                        $scope.artist_name = $scope.event_detail._embedded.attractions[0].name;
                        for(var i = 0; i < $scope.event_detail._embedded.attractions.length - 1 ; i++){
                            art += $scope.event_detail._embedded.attractions[i].name + " | ";

                            // put into artist array
                            artist_array.push($scope.event_detail._embedded.attractions[i].name);
                        }
                        var last  = $scope.event_detail._embedded.attractions.length - 1;
                        art += $scope.event_detail._embedded.attractions[last].name;

                        // put into artist array
                        artist_array.push($scope.event_detail._embedded.attractions[last].name);
                        $scope.event_art = art;
                        $scope.has_art = true;
                    }

                    if($scope.event_detail.priceRanges !== undefined){
                        console.log("price!!!!!");
                        $scope.event_price = "$" + $scope.event_detail.priceRanges[0].min + " ~ " + "$" + $scope.event_detail.priceRanges[0].max;
                        console.log("price: " + $scope.event_detail.priceRanges[0].min);//////////////////////////////////
                        $scope.has_price = true;
                    }

                    if($scope.event_detail.dates !== undefined){
                        $scope.event_ticket = $scope.event_detail.dates.status.code;
                        $scope.has_ticket = true;
                    }

                    if($scope.event_detail.url !== undefined){
                        $scope.event_buy = $scope.event_detail.url;
                        $scope.has_buy = true;
                    }

                    if($scope.event_detail.seatmap !== undefined){
                        $scope.event_seat = $scope.event_detail.seatmap.staticUrl;
                        $scope.has_seat = true;
                    }

                    console.log("event name is: " + $scope.event_detail["name"]);///////////////////////

                    $scope.showProgress = false;

                }

                $scope.showDetailTable = true;

                $scope.handleArtist(); ////// draw artist table
                $scope.handleVenue();// draw venue table
                $scope.handleUpcoming(); // draw upcoming table
            });



    };

    //get upcoming venue id
    $scope.handleUpcoming = function(){
        $scope.showMore = true;//////////////////~~
        $scope.limitLen = 5;
        var p = "venueName=" + $scope.event_venue;
        console.log("sending venue name is : "  + $scope.event_venue);///////////////////////////////////////////
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/upcoming_id?"+ p)
            .then(function(response) {
                $scope.upcomingTable = response.data;
                if($scope.upcomingTable.resultsPage === undefined){
                    $scope.hasComing = false;
                    document.getElementById("allUpcoming").style.display = "none";
                }else{
                    $scope.upcoming_id = $scope.upcomingTable.resultsPage.results.venue[0].id;
                    console.log("upcoming venue id is : " + $scope.upcoming_id);//////////////////////////////////////
                    $scope.getUpcoming();
                }

            });
    };

    //get upcoming events
    $scope.getUpcoming = function(){
        var p = "upcomingId=" + $scope.upcoming_id;
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/upcoming_event?"+ p)
            .then(function(response) {
                $scope.upcomingEventTable = response.data.resultsPage.results.event;
                console.log("upcoming events is : " + response.data.resultsPage.results.event.length);//////////////////////////////////////
                $scope.upcoming_display = response.data.resultsPage.results.event[0].displayName;
                console.log("upcoming events is : " + $scope.upcoming_display);//////////////////////////////////////
                $scope.upcoming_uri = response.data.resultsPage.results.event[0].uri;
                console.log("upcoming uri is : " + $scope.upcoming_uri);//////////////////////////////////////
                $scope.upcoming_date = response.data.resultsPage.results.event[0].start.date;
                console.log("upcoming date is : " + $scope.upcoming_date);//////////////////////////////////////

            });
    };

    // draw form and picture div
    $scope.handleArtist = function(){
        console.log("drawing artitst table ....");///////////////////////////////////
        console.log("artist array length is : " + artist_array.length);
        if(artist_array.length === 0){
            $scope.hasTeam = false;
        }
        if(artist_array.length > 0){
            console.log();/////////////////////////////////////////////////////////////
            artist_array.forEach(myFun);

        }
    };

    // call two functions to draw artist table
    function myFun(value){
        console.log("call in the loop array is: " + value);/////////////////////////////
        //call spotify api
        if($scope.isMusic){
            $scope.getArtist(value);
        }
        // call google api
        $scope.getImg(value);
    }

    $scope.showArtist = function(){
        document.getElementById("artistArea").innerHTML = artist_html;

    };

    $scope.getImg = function(e){

        var p = "search=" + e;
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/img_rst?"+ p)
            .then(function(response) {

                    $scope.imgTable = response.data.items;
                    artist_html += "<div style='text-align: center'>" + e + "</div>";
                    for(var k = 0; k < $scope.imgTable.length ; k++){
                        var cur_link = $scope.imgTable[k].link;
                        console.log("cur image link is : " + cur_link);////////////////////////////
                        artist_html += "<a target='_blank' href='"+ cur_link +"'><img class='img-thumbnail col-xs-12 col-md-4' src='" + cur_link+ "'></a>";
                                                                                   //style=' margin: 20px; width: 26%; height: 27%'
                    }

                console.log("images is of : " + e);//////////////////////////////////////

            });
    };


    $scope.handleVenue = function(){

        var p = "venue=" + $scope.event_venue;
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/venue_rst?"+ p)
            .then(function(response) {

                $scope.venueTable = response.data;
                if($scope.venueTable._embedded.venues[0] === undefined){
                    $scope.hasVenue = false;
                    document.getElementById("allVenue").style.display = "none";
                }else{
                    console.log("venue is : " + $scope.venueTable._embedded.venues[0].name);//////////////////////////////////////
                    $scope.venue_name = $scope.venueTable._embedded.venues[0].name;
                    $scope.venue_add = $scope.venueTable._embedded.venues[0].address.line1;
                    console.log(" venue address is : " + $scope.venue_add);///////////////////////////////////
                    $scope.venue_city= $scope.venueTable._embedded.venues[0].state.name;
                    console.log(" venue city is : " + $scope.venue_city);///////////////////////////////////
                    $scope.venue_phone = $scope.venueTable._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
                    console.log(" venue phone is : " + $scope.venue_phone);///////////////////////////////////
                    $scope.venue_hour = $scope.venueTable._embedded.venues[0].boxOfficeInfo.openHoursDetail;
                    console.log(" venue hour is : " + $scope.venue_hour);///////////////////////////////////
                    $scope.venue_rule = $scope.venueTable._embedded.venues[0].generalInfo.generalRule;
                    console.log(" venue general rule is : " + $scope.venue_rule);///////////////////////////////////
                    $scope.venue_child = $scope.venueTable._embedded.venues[0].generalInfo.childRule;
                    console.log(" venue child rule is : " + $scope.venue_child);///////////////////////////////////

                    $scope.venue_lat = $scope.venueTable._embedded.venues[0].location.latitude;
                    console.log(" venue lat is : " + $scope.venue_lat);///////////////////////////////////
                    $scope.venue_lng = $scope.venueTable._embedded.venues[0].location.longitude;
                    console.log(" venue lng is : " + $scope.venue_lng);///////////////////////////////////
                }

            });

    };

    $scope.showVenue = function(){
        console.log("showing map !!");////////////////////////////
        initMap($scope.venue_lat, $scope.venue_lng);
    };

    $scope.getArtist = function (ele) {
        var p = "artist=" + ele;
        $http.get("http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/artist_rst?"+ p)
            .then(function(response) {
                $scope.artistTable = response.data;
                console.log("artist table is : " );////////////////////////////////
                console.log(response.data);////////////////////////////////////////


                    var artist_name = $scope.artistTable.artists.items[0].name;
                    console.log("artist_name is: " + artist_name);///////////////////////////////////

                    artist_html += "<table class='table table-striped'>";
                    artist_html += "<tbody><div id='subArtist'>" + artist_name + "</div><tr><th scope='row'>Name</th>";
                    artist_html += "<td>"+ artist_name+"</td></tr>";

                    var artist_follower = $scope.artistTable.artists.items[0].followers.total;
                    console.log("followers is : " +  artist_follower);//////////////////////////////////


                    var value = artist_follower.toLocaleString(
                        undefined, // leave undefined to use the browser's locale,
                        // or use a string like 'en-US' to override it.
                        { minimumFractionDigits: 2 }
                    );


                    artist_html += "<tr><th scope='row'>Followers</th>";
                    artist_html += "<td>"+ value +"</td></tr>";

                    var artist_pop = $scope.artistTable.artists.items[0].popularity;
                    console.log("pop is: " + $scope.artist_pop);////////////////////////////////

                    artist_html += "<tr><th scope='row'>Popularity</th>";
                    artist_html += "<td>"+ artist_pop+"</td></tr>";
                    //progress
                    // artist_html += "<td><div class='pie-wrapper progress-45 style-2'><span class='label'>45<span class='smaller'>%</span></span><div class='pie'><div class='left-side half-circle'></div><div class='right-side half-circle'></div><div class='shadow'></div></div></td></tr>";

                    var artist_url = $scope.artistTable.artists.items[0].external_urls.spotify;
                    console.log("artist url is: " + artist_url);////////////////////////////////

                    artist_html += "<tr><th scope='row'>Check At</th>";
                    artist_html += "<td><a target='_blank' href='"+ artist_url+ "'>Spotify</a></td></tr>";

                    artist_html+= "</tbody></table>";


            });
    };


    //auto complete@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    $scope.complete = function (string) {

        $scope.autoHide = false;

        var url = "http://yuzhu-hw8.us-east-2.elasticbeanstalk.com/auto_complete?"
            + "&autoComplete=" + string;

        $http.get(url).then(function (result) {
            if(result.data._embedded !== undefined){
                $scope.keywordList = result.data._embedded.attractions;
            }
        });

        var output = [];
        if ($scope.keywordList !== undefined) {
            for (var i = 0; i < $scope.keywordList.length; i++) {
                output.push($scope.keywordList[i].name);
            }
            $scope.autoTable = output;
        }
    };

    $scope.getAuto = function(string) {
        $scope.myKeyword = string;
        $scope.autoHide = true;
    };

    // end auto complete@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



    $scope.Favstorage = {};
    $scope.proStar = false;
    $scope.tableStar = false;
    $scope.Favempty = false;

    // localStorage.clear();
    if(localStorage.length !== 0){
        for(ele in localStorage){
            // window.localStorage.removeItem(ele);
            $scope.Favstorage[ele] = JSON.parse(window.localStorage.getItem(ele));
        }
    }


    //show favorite table when favorite button is click
    $scope.showFav = function () {

        if(Object.keys($scope.Favstorage).length === 0 ){
            $scope.hasFav = false;
            $scope.Favempty = true;
        }else{
            $scope.Favstorage = [];
            for(var i = 0; i < localStorage.length; i++){
                $scope.Favstorage.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
            }
            $scope.Favempty = false;
            $scope.hasFav = true;
        }
        console.log("has Fav is: " + $scope.hasFav);
    };


    $scope.removeFav = function(e){
        $scope.rightFav = false;
        delete $scope.Favstorage[e.name];
        window.localStorage.removeItem(e.name);
        $scope.proStar = false;
        $scope.tableStar = false;

        var id = e.id;
        if(document.getElementById(id).classList.contains("fas")){
            document.getElementById(id).classList.remove("fas");
        }
        if(document.getElementById("processStar").classList.contains("fas")){
            document.getElementById("processStar").classList.remove("fas"); // set the four table star to be lighted
        }

        $scope.showFav();
    };


    // add into favorite when four table exist
    $scope.addFav = function(element){

        if($scope.proStar){
            console.log("removing");////////////////////////////////////////////////////////////////////////
            var id = $scope.curEvent.id;
            if(document.getElementById(id) !== null){
                document.getElementById(id).classList.remove("fas");
            }

            if( document.getElementById("processStar") !== null){
                document.getElementById("processStar").classList.remove("fas"); // set the four table star to be lighted
            }
            $scope.proStar = false;
            $scope.tableStar = false;
            delete $scope.Favstorage[$scope.curEvent.name];
            window.localStorage.removeItem($scope.curEvent.name);
        }else{
            console.log("adding");////////////////////////////////////////////////////////////////////////
            // need to set the table star light
            var id = $scope.curEvent.id;
            console.log("add fav event id is: " + id);////////////////////////////////////////////////////////
            console.log("get element by id");
            console.log(document.getElementById(id));
            console.log(document.getElementById(id).classList);
            document.getElementById(id).classList.add("fas");
            document.getElementById("processStar").classList.add("fas"); // set the four table star to be lighted
            $scope.Favstorage[$scope.curEvent.name] = $scope.curEvent;
            window.localStorage.setItem($scope.curEvent.name, JSON.stringify($scope.curEvent));
            $scope.tableStar = true;
            $scope.proStar = true;
        }

        console.log("favorite array is: ");
        console.log($scope.Favstorage);
        console.log("local storage is: ");
        console.log(window.localStorage);
    };

    //add item into favorite when first table show
    $scope.handleFav = function (item) {

        console.log("input x is : " );////////////////////////////////////////////////////////////////////////
        console.log(item);////////////////////////////////////////////////////////////////////////
        console.log("turnOn is: " + $scope.tableStar);////////////////////////////////////////////////////////////////////////
        console.log("input name is : ");////////////////////////////////////////////////////////////////////////
        console.log(item.name);////////////////////////////////////////////////////////////////////////

        //add the item into the favorite
        if(!$scope.tableStar){
            console.log("adding");////////////////////////////////////////////////////////////////////////
            window.localStorage.setItem(item.name, JSON.stringify(item));
            $scope.Favstorage[item.name] = item;
            document.getElementById("processStar").classList.add("fas"); // set the four table star to be lighted
            var id = item.id;
            document.getElementById(id).classList.add("fas");
            $scope.proStar = true;
            $scope.tableStar = true;
        }else{
            console.log("removing");////////////////////////////////////////////////////////////////////////
            // remove the item
            window.localStorage.removeItem(item.name);
            delete $scope.Favstorage[item.name];
            $scope.proStar = false;
            $scope.tableStar = false;
            var id = item.id;
            if(document.getElementById(id) !== null){
                document.getElementById(id).classList.remove("fas");
            }
            if(document.getElementById("processStar") !== null){
                document.getElementById("processStar").classList.remove("fas");
            }

        }

        console.log("favorite array is: ");////////////////////////////////////////////////////////////////////////
        console.log($scope.Favstorage[item.name]);////////////////////////////////////////////////////////////////////////

        console.log("local storage is: ");////////////////////////////////////////////////////////////////////////
        $scope.cur_data = JSON.parse(window.localStorage.getItem(item.name));
        console.log($scope.cur_data);////////////////////////////////////////////////////////////////////////
        console.log("storage array length is: ");
        console.log($scope.Favstorage);
    };

    $scope.clickFavDetail= function(){
        $scope.rightFav = false;
        $scope.showFavT = false;
        $scope.showDetailTable = true;
    };

    $scope.handleList = function(){
        if($scope.inFav){
            $scope.showDetailTable = false;
            $scope.clickLeft = false;
            $scope.FavList = true;
            $scope.rightFav = true;
            $scope.showFavT = true;
            if(Object.keys($scope.Favstorage).length === 0 ){
                $scope.hasFav = false;
                $scope.Favempty = true;
            }else{
                $scope.Favempty = false;
                $scope.hasFav = true;
            }
        }else{
            $scope.clickLeft = false ;
            $scope.showDetailTable = false;
            $scope.clickList = true;
            $scope.showFirstTable = true;
        }
    };

    //reset the search
    $scope.clearAll = function () {
        document.getElementById("my_form").reset();
        artist_array = [];
        artist_html = "";


        $scope.myKeyword ='';
        $scope.my_form.keyword.$touched = false;
        $scope.myCategory = 'all';
        $scope.myDistance = 10;
        $scope.my_form.form_mile = 'miles';
        $scope.myLocation='cur_location';
        $scope.my_form.input_location.$touched = false;
        document.getElementById("input_location").disabled = true;



        $scope.showProgress = false;///////////////////////////
        $scope.showFirstTable = false;///////////////////////
        $scope.showDetailTable = false;//////////////////////////////////
        $scope.has_price = false; ////////////
        $scope.activeResult = false;////////////
        $scope.clickList = false; // click List button///
        $scope.clickLeft = false;
        $scope.showFavT = false;
        $scope.clickLeft =false;
        $scope.hasEvent = true;//sub table 1 corner case
        $scope.hasTeam = true;//sub table 2 corner case
        $scope.hasVenue = true; //sub table 2 corner case
        $scope.hasComing = true; //sub table 2 corner case
        $scope.hasRst = true; // first search table corner case

        // set the empty form first in the event detail table
        $scope.has_time = false;
        $scope.has_venue = false;
        $scope.has_category = false;
        $scope.has_art = false;
        $scope.has_price = false;
        $scope.has_ticket = false;
        $scope.has_buy = false;
        $scope.has_seat = false;
        $scope.Favempty = false;
        $scope.activeFav = false;
        $scope.FavList =false;
        $scope.rightFav = false;
        $scope.inFav = false;

        // upcoming init
        $scope.sort_by = 'default';
        $scope.sort_expression = '';


        //auto complete@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        $scope.autoTable = [];


    }


});