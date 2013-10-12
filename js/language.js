
/* Location of the couchdb proxy. Please make sure a proxy is configured
 * for the apache server pointed by this URL.
 */
var server = "couchdb/";

/* For detail on the output json objects these function return please look at
 * the data input specifications for the d3 libraries.
 */

/* Returns the amounts of tweets per language per Sydney Region, ignoring English.
 * It uses the spatial index of Geocouch to query the bboxes. */
function getLanguageTweetsPerRegion() {
	var json = '';
	var bboxes = [
	   [151.186,-33.909,151.233,-33.854,'City','#B20000'],
	   [151.233,-34.052,151.288,-33.852,'East','#006600'], //East1
	   [151.186,-34.052,151.233,-33.909,'East','#006600'], //East2
	   [151.233,-33.852,151.345,-33.575,'Northeast','#003399'],
	   [151.067,-33.854,151.233,-33.755,'Inner North','#009999'],
	   [151.067,-33.775,151.233,-33.462,'North','#00CC66'],
	   [151.067,-33.909,151.186,-33.854,'Inner West','#FFCC00'],
	   [150.975,-34.147,151.186,-33.909,'South','#5A0000'],
	   [150.850,-33.909,151.067,-33.775,'West Central','#FF9933'],
	   [150.061,-34.310,150.850,-33.846,'South West','#663300'], //South West1
	   [150.850,-34.310,150.975,-33.909,'South West','#663300'], //South West2
	   [150.061,-33.846,150.850,-33.144,'North West','#FFFF66'], //North West1
	   [150.850,-33.775,151.067,-33.144,'North West','#FFFF66'] //North West2
	];
	
	var res = {
		"name": "Sydney",
		"children": []
	}
	
	// Execute one query per bbox region
	for (var i = 0, skip = 0; i < bboxes.length; i++) {
		$.ajax({
			  type: 'GET',
			  dataType: 'json',
			  url: server + 'twittering_replica/_design/language/_spatial/points?bbox='
			  	+ bboxes[i][0] + ',' + bboxes[i][1] + ',' + bboxes[i][2] + ',' + bboxes[i][3],
			  success: function(result) {
				  json = result;
			  },
			  async: false
		});
		
		var child = {
				"name": bboxes[i][4],
				"children": [],
				"color": bboxes[i][5]
		}
		if (i == 2 || i == 10 || i == 12) { //2 bbox regions
			child = res.children[i - 1 - skip];
			skip++;
		}
		
		//Process every element returned by the current bbox query
		for (var j = 0; j < json.rows.length; j++) {
			var v = json.rows[j].value;
			var lang = codeToString(v[0]);
			
			//Ignore the small languages and English
			if (!filterMainLanguages(v[0]) || v[0] == 'en')
				continue;
			
			//Reduce the values using our own sum, no reduce for spatial views.
			if (child.children.length == 0) { //Insert the first child
				var grandchild = {
					"name": lang,
					"size": 1,
					"color": codeToColor(v[0])
				}
				child.children.push(grandchild);
			} else for (var c = 0; c < child.children.length; c++) {
				if (child.children[c].name == lang) {
					child.children[c].size += 1;
					break;
				} else if (c == child.children.length - 1) { //Last case
					var grandchild = {
							"name": lang,
							"size": 1,
							"color": codeToColor(v[0])
					}
					child.children.push(grandchild);
					break;
				}
			}
		}
		
		if (i != 2 && i != 10 && i != 12) { //Push the new region
			res.children.push(child);
		}
	}
	
	return res;
};

/* Returns the number of tweets generated per language, per day */
function getLanguageTweetsPerDay() {
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/language/_view/per_hour?group_level=4',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var data = [];
	
	var lastLang = '';
	var lastChild = {};
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		var lang = codeToString(k[0]);
		
		if (lastLang != lang) {
			var child = {
			    key: lang,
			    values: []
			}
			data.push(child);
			lastChild = child;
		}
			
		var time = new Date(k[1], k[2], k[3], 0, 0, 0, 0);
		var element = [time.getTime(), v];
		lastChild.values.push(element);
		
		lastLang = lang;
	}
	
	return data;
};

/* Returns the number of tweets generated per language, per hour on a specific day.
 * The day is specified in the arguments year, month and day */ 
function getLanguageTweetsPerHour(year, month, day) {
	var json = '';
	month--;
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_replica/_design/language/_view/per_day_range?group_level=5'
		  	+ '&startkey=[' + year + ',' + month + ',' + day + ']&endkey=[' + year 
		  	+ ',' + month + ',' + (day + 1) + ']',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});
	
	var data = [];
	
	var lastLang = '';
	var lastChild = {};
	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		var lang = codeToString(k[3]);
		
		if (lastLang != lang) {
			var child = {
			    key: lang,
			    values: []
			}
			data.push(child);
			lastChild = child;
		}
			
		var time = new Date(k[0], k[1], k[2], k[4], 0, 0, 0); //k[3] is language code
		var element = [time.getTime(), v];
		lastChild.values.push(element);
		
		lastLang = lang;
	}
	
	return data;
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
		  beforeSend: function(){
		  	$("iframe body").append('<img id="loading" src="js/loading.gif" />');
		  },
		  success: function(result) {
		  	$("#loading").remove();
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

/* Translates the two character code of a language to the 
 * actual name of that language */
function codeToString(code) {
	switch (code) {
	case "ar": return "Arabic";
	case "bg": return "Bulgarian";
	case "bn": return "Bengali";
	case "da": return "Danish";
	case "de": return "German";
	case "el": return "Greek";
	case "en": return "English";
	case "es": return "Spanish";
	case "et": return "Estonian";
	case "fa": return "Persian";
	case "fi": return "Finish";
	case "fr": return "French";
	case "he": return "Hebrew";
	case "hi": return "Hindi";
	case "ht": return "Haitian Creole";
	case "hu": return "Hungarian";
	case "id": return "Indonesian";
	case "it": return "Italian";
	case "ja": return "Japanese";
	case "ko": return "Korean";
	case "lt": return "Lithuanian";
	case "lv": return "Latvian";
	case "ne": return "Nepali";
	case "nl": return "Dutch";
	case "no": return "Norweigan";
	case "pl": return "Polish";
	case "pt": return "Portuguese";
	case "ru": return "Russian";
	case "sk": return "Slovak";
	case "sl": return "Slovenian";
	case "sv": return "Swedish";
	case "ta": return "Tamil";
	case "th": return "Thai";
	case "tl": return "Tagalog";
	case "tr": return "Turkish";
	case "und": return "Undetermined";
	case "ur": return "Urdu";
	case "vi": return "Vietnamese";
	case "zh": return "Chinese";
	default: return "Unknown";
	}
};

/* Returns a color for a two character code of a language */
function codeToColor(code) {
	switch (code) {
	case "ar": return "#FF6600";
	case "bg": return "#666633";
	case "bn": return "#FF6600";
	case "da": return "#6699FF";
	case "de": return "#0099CC";
	case "el": return "#99FF99";
	case "en": return "#0033CC";
	case "es": return "#4747B2";
	case "et": return "#999966";
	case "fa": return "#FF9966";
	case "fi": return "#006600";
	case "fr": return "#6600FF";
	case "he": return "#99FFCC";
	case "hi": return "#FF9966";
	case "ht": return "#FF0066";
	case "hu": return "#996633";
	case "id": return "#660033";
	case "it": return "#B2476B";
	case "ja": return "#669999";
	case "ko": return "#666699";
	case "lt": return "#663300";
	case "lv": return "#996600";
	case "ne": return "#336699";
	case "nl": return "#6666FF";
	case "no": return "#00CC99";
	case "pl": return "#CC9900";
	case "pt": return "#661A80";
	case "ru": return "#CCCC00";
	case "sk": return "#99CC00";
	case "sl": return "#669900";
	case "sv": return "#339933";
	case "ta": return "#990000";
	case "th": return "#993300";
	case "tl": return "#FFFF66";
	case "tr": return "#FF9933";
	case "und": return "#000000";
	case "ur": return "#FF5050";
	case "vi": return "#FF9966";
	case "zh": return "#CC0000";
	default: return "#000000";
	}
}

/* Determines if a language is one of the main languages
 * that have many tweet occurrences. */
function filterMainLanguages(code) {
	switch (code) {
	case "ar": return true;
	case "de": return true;
	case "en": return true;
	case "es": return true;
	case "et": return true;
	case "fa": return true;
	case "fr": return true;
	case "id": return true;
	case "it": return true;
	case "ja": return true;
	case "ko": return true;
	case "nl": return true;
	case "pl": return true;
	case "th": return true;
	case "tl": return true;
	case "tr": return true;
	case "vi": return true;
	case "zh": return true;
	default: return false;
	}
}