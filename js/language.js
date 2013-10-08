/* Returns in a bi-dimensional array the number of tweets per day. The
 * first element is date in the format YYYY-MM-DD, and the second the
 * number of tweets e.g. res[0][0] = '2013-08-30' and res[0][1] = 500.
 */
function getLanguageTweetsPerDay() {
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
	
	var res = new Array();
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		res[i] = new Array(2);
		res[i][0] = k[0] + '-' + ++k[1] + '-' + k[2];
		res[i][1] = v;
	}
	
	return res;
};

/* Returns in a bi-dimensional array the number of tweets per hour, on a specific day. 
 * The first element is the hour in the format HH24, and the second the
 * number of tweets e.g. res[0][0] = '19' and res[0][1] = 500.
 */
function getLanguageTweetsPerHour(year, month, day) {
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
 * to render the hex map of the points according to language given by the argument.
 * The language is defined by a two character code.
 */
function getD3JSONLanguage(language) {
	
	var doc = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/language/_view/coordinates',
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
		if (doc.rows[i].key[3] != language)
			continue;
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
 * to render the hex map of the points according to language given by the argument,
 * on a specific day. The language is defined by a two character code. 
 */
function getD3JSONLanguageOn(language, year, month, day) {
	
	var doc = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/language/_view/coordinates'
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
		if (doc.rows[i].key[3] != language)
			continue;
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