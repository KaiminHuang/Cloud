var server = "http://115.146.94.169/couchdb/";
function getWordFrequency() {
	var json = '';	
	$.ajax({
		  type: 'GET',
		  dataType: 'json',
		  url: server + 'twittering_union/_design/words/_view/frequency?group=true',
		  success: function(result) {
			  json = result;
		  },
		  async: false
	});

	var data = [];

	for (var i = 0; i < json.rows.length; i++) {
		var k = json.rows[i].key;
		var v = json.rows[i].value;
		data.push({word: k, num: v});
	}
	
	data.sort(function(a,b) {
	    return b.num - a.num;
	});

	var top = [];
	for (var i = 0; i < 2000; i++) {
		top.push(data[i]);
	}
	
	top.forEach(function(el){
		document.write(el.word + " " + el.num + "<br />");	
	});
	return top;
	
	
};