/* Returns in a bi-dimensional array the number of positive, neutral, and
 * negative tweets in total. The first element is the sentiment 
 * (positive, negative, or neutral), and the second the number of tweets 
 * e.g. res[0][0] = 'positive' and res[0][1] = 500.
 */
function getSentimentTweets() {
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/total?group_level=1',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var res = new Array();
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		res[i] = new Array(2);
		res[i][0] = k[0];
		res[i][1] = v;
	}
	
	return res;
};

/* Returns in a bi-dimensional array the number of positive, neutral, and
 * negative tweets, on a specific day. 
 * The first element is the hour in the sentiment
 * (positive, negative, or neutral) and the second is the number of tweets 
 * e.g. res[0][0] = 'positive', and res[0][1] = 500.
 */
function getSentimentTweetsPerDay(year, month, day) {
	var json = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/per_hour?group_level=4'
		  	+ '&startkey=[' + year + ',' + month + ',' + day + ']&endkey=[' + year 
		  	+ ',' + month + ',' + (day + 1) + ']',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var res = new Array();
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		res[i] = new Array(2);
		res[i][0] = k[3];
		res[i][1] = v;
	}
	
	return res;
};

/* Returns all the points in the json object format that the d3 library requires
 * to render the hex map of the points according to sentiment.
 */
function getD3JSONSentiment() {
	
	var doc = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/coordinates',
		  success: function(result) {
			  doc = result;
		  },
		  async: false
	});
	
	var res = {
		"extent" : [150.821457,-34.026391,151.319962,-33.724244],
		"features" : []
	};
	for (var i = 0; i < doc.total_rows; i++) {
		var point = {
			"geometry": {
				"type" : "point",
				"coordinates" : [doc.rows[i].value[0],doc.rows[i].value[1]],
				"sentiment" : doc.rows[i].value[2]
			}
		}
		res.features.push(point);
	}
	return res;
}

/* Returns all the points in the json object format that the d3 library requires
 * to render the hex map of the points according to sentiment, on a specific day.
 */
function getD3JSONSentimentOn(year, month, day) {
	
	var doc = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/coordinates'
		  	+ '?startkey=[' + year + ',' + month + ',' + day + ']&endkey=[' + year 
		  	+ ',' + month + ',' + (day + 1) + ']',
		  success: function(result) {
			  doc = result;
		  },
		  async: false
	});
	
	var res = {
		"extent" : [150.821457,-34.026391,151.319962,-33.724244],
		"features" : []
	};
	for (var i = 0; i < doc.rows.length; i++) {
		var point = {
			"geometry": {
				"type" : "point",
				"coordinates" : [doc.rows[i].value[0],doc.rows[i].value[1]],
				"sentiment" : doc.rows[i].value[2]
			}
		}
		res.features.push(point);
	}
	return res;
}

function getTop5Positive() {
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/by_sentiment?descending=true',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var res = new Array();
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		res[i] = new Array(3);
		res[i][0] = k[0];
		res[i][1] = v[0];
		res[i][2] = v[1];
	}
	
	return res;
}

function getTop5Negative() {
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/sentiment/_view/by_sentiment?descending=true',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var res = new Array();
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		res[i] = new Array(3);
		res[i][0] = k[0];
		res[i][1] = v[0];
		res[i][2] = v[1];
	}
	
	return res;
}