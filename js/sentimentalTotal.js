var server = 'couchdb';
//This function is just for text the other functions
function onload() {

	var res = sentimentalTotal();	
	//alert(JSON.stringify(res));
	$('#results').html(JSON.stringify(res));

};

// This function shows the total tweets group by sentiment: 
// key("Positive","Negative","Neutral"), y:#tweets 
//After it convert in an Json array object in the format that Kaimin needs
//Input: No parameters
//Output: Json object 
function sentimentalTotal() {	
	var json = '';
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + '/twittering_replica/_design/sentimental/_view/SentimentalTotal?group_level=1',
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
		"data" : []
	};
	for (var i = 0; i < json.rows.length; i++) {
		var typeSentiment = {
			"key": json.rows[i].key,
			"y" : json.rows[i].value					
		}
		//alert('Linea:'+ point.geometry.sentiment + "\n" + point.geometry.coordinates);
		res.data.push(typeSentiment);
	}	
	return res.data;
};
