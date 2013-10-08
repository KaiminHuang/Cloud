var server = 'http://115.146.95.43/couchdb';
//This function is just for text the other functions
function onload() {

	//var res = sentimentalPerDay(2013,10,01);	
	var res = sentimental();	
	//alert(JSON.stringify(res));
	$('#results').html(JSON.stringify(res));

	//alert(JSON.stringify(samanTest()));

};

// This function receives a date and bring the following data: 
// type (point), cordinate1, cordinate2, sentiment of each tweet on a certain day
//After it convert in another Json object in the format that Saman needs
//Input: Date: year(4 digits), month(2 digits), day (2 digits)
//Output: Json object 
function sentimentalPerDay(year, month,day) {
	month--;	
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + '/twittering_replica/_design/sentimental/_view/sentimentalPerDay',
		  data: { startkey: "["+year + ',' + month + ',' + day+"]",
		           endkey: '['+year + ',' + month + ',' + (day)+']'
		       },
		  success: function(result) {
			  json = result;		
			  // alert ('It gets the Json :)');	  
		  },
		  error: function(){
		  	alert("error");
		  },
		  // complete: function(){
		  // 	alert("completed");
		  // },
		  async:false
	});

	var res = {
		"extent" : [150.821457,-34.026391,151.319962,-33.724244],
		"features" : []
	};
//	alert (json.rows.length);	
	for (var i = 0; i < json.rows.length; i++) {
		var point = {
			"geometry": {
				"type" : "point",
				"coordinates" : [json.rows[i].value[1],json.rows[i].value[2]],
				"sentiment" : json.rows[i].value[3]
			}		
		}
		//alert('Linea:'+ point.geometry.sentiment + "\n" + point.geometry.coordinates);
		res.features.push(point);
	}	
	return res;
};

// This function receives a date and bring the following data: 
// type (point), cordinate1, cordinate2, sentiment of each tweet 
//After it convert in another Json object in the format that Saman needs
//Input: No parameters
//Output: Json object 
function sentimental() {	
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + '/twittering_replica/_design/sentimental/_view/sentimentalPerDay',
		  success: function(result) {
			  json = result;			  
		  },
		  error: function(){
		  	alert("error");
		  },
		  // complete: function(){
		  // 	alert("completed");
		  // },
		  async:false
	});

	var res = {
		"extent" : [150.821457,-34.026391,151.319962,-33.724244],
		"features" : []
	};
//	alert (json.rows.length);	
	for (var i = 0; i < json.rows.length; i++) {
		var point = {
			"geometry": {
				"type" : "point",
				"coordinates" : [json.rows[i].value[1],json.rows[i].value[2]],
			},
			"sentiment" : json.rows[i].value[3]		
		}
		//alert('Linea:'+ point.geometry.sentiment + "\n" + point.geometry.coordinates);
		res.features.push(point);
	}	
	return res;
};
