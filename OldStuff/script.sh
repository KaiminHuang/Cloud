# Create database
# $1 must be central's ip
# $2 must be lat1
# $3 must be lon1
# $4 must be lat2
# $5 must be lon2

#curl -X PUT http://127.0.0.1:5984/twittering
#curl -H 'Content-Type: application/json' -X POST http://localhost:5984/_replicate -d ' { "source":"http://localhost:5984/twittering", "target":"http://'$1':5984/twittering_replica", "create_target": true, "continuous": true } '

#nohup java -jar HAWX.jar 127.0.0.1 twittering $2 $3 $4 $5
nohup python /home/ubuntu/twitter-sentiment/tweet_sentiment.py --db twittering_replica