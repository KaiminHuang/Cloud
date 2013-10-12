
/* Returns in a bi-dimensional array the number of tweets per day. The
 * first element is date in the format YYYY-MM-DD, and the second the
 * number of tweets e.g. res[0][0] = '2013-08-30' and res[0][1] = 500.
 */
 var server = "couchdb/"
function getNumberTweetsPerDay() {
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/counting/_view/per_hour?group_level=3',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var data = [
	    {
	    	key: "Sydney",
	    	values: []
	    }
	]
	var ini = new Date(2013, 8, 18, 0, 0, 0, 0);
	data[0].values.push([ini.getTime(), 0]);

	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		var time = new Date(k[0], k[1], k[2], 0, 0, 0, 0);
		var element = [time.getTime(), v];
		data[0].values.push(element);
	}
	return data;
};

/* Returns in a bi-dimensional array the number of tweets per hour, on a specific day. 
 * The first element is the hour in the format HH24, and the second the
 * number of tweets e.g. res[0][0] = '19' and res[0][1] = 500.
 */
function getNumberTweetsPerHour(year, month, day) {
	var json = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/counting/_view/per_hour?group_level=4'
		  	+ '&startkey=[' + year + ',' + month + ',' + day + ']&endkey=[' + year 
		  	+ ',' + month + ',' + (day + 1) + ']',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var data = [
	    {
	    	key: "Sydney",
	    	values: []
	    }
	]
	

	var ini = new Date(year, month, day, 0, 0, 0, 0);
	data[0].values.push([ini.getTime(), 0]);

	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		var time = new Date(k[0], k[1], k[2], k[3], 0, 0, 0);
		var element = [time.getTime(), v];
		data[0].values.push(element);
	}
	
	return data;
};

/* Returns all the points in the json object format that the d3 library requires
 * to render the hex map of the points according to number of tweets.
 */
function getD3JSONCounting() {
	
	var doc = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/counting/_view/coordinates',
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
				"coordinates" : [doc.rows[i].value[0],doc.rows[i].value[1]]
			}
		}
		res.features.push(point);
	}
	return res;
}

/* Returns all the points in the json object format that the d3 library requires
 * to render the hex map of the points according to number of tweets, on a specific day.
 */
function getD3JSONCountingOn(year, month, day) {
	
	var doc = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/counting/_view/coordinates'
		  	+ '?startkey=[' + year + ',' + month + ',' + day + ']&endkey=[' + year 
		  	+ ',' + month + ',' + day + ']',
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
				"coordinates" : [doc.rows[i].value[0],doc.rows[i].value[1]]
			}
		}
		res.features.push(point);
	}
	return res;
}
