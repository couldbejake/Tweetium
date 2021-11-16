
const request = require('request');
var fs = require('fs');


function write_json_to_temp(filename, data){
  fs.writeFile (filename, JSON.stringify(data), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);
}

function print_tweets(tweets_glob){
  tweets = tweets_glob.globalObjects.tweets
  for (const [key, value] of Object.entries(tweets)) {
    process.send(value.text);
    //console.log(key, value.text);
  }
}

Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function get_next_cursor(globalObjects){
  var instructions_ex = check_nested(globalObjects, 'timeline', 'instructions')
  if(globalObjects && instructions_ex){
    var instruction_count = Object.keys(globalObjects.timeline.instructions).length
    var next_cursor_id = false
    if(instruction_count == 1){
        var entries = globalObjects['timeline']['instructions'][0]['addEntries']['entries']
        last_entry = entries[Object.keys(entries).length - 1]
        last_entry_val = last_entry['content']['operation']['cursor']['value']
        return last_entry_val
    } else {
        var instructions = globalObjects.timeline.instructions
        var last_instruct = instructions[instructions.length - 1].replaceEntry.entry.content.operation.cursor.value
        return last_instruct
    }
  }
  return false
}

function check_nested(obj /*, level1, level2, ... levelN*/) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
}

function _grab_tweets_with_gt(onComplete, search_query, proxy_ip, next_cursor_id = false){
  request.post({
      headers: { 'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'},
      uri: 'https://api.twitter.com/1.1/guest/activate.json'
  }, function(err, res, body) {

    var token = JSON.parse(body)['guest_token']
    
    var options = {
      'q': search_query,
      'src': 'typd',
      "count":"25",
    }
    if(next_cursor_id != false){
      options['cursor'] = next_cursor_id
    }
    request.get({
      headers: {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-guest-token': token,
      },
      uri: 'https://api.twitter.com/2/search/adaptive.json',
      qs: options
    }, function(err, res, body) {
      data = JSON.parse(body)
      //print_tweets(data)
      onComplete(data)
    });
  });
}

var onDone = function(data){
  print_tweets(data)
  var next_cursor = get_next_cursor(data)
  if(next_cursor){
    _grab_tweets_with_gt(onDone, 'facebook', '127.0.0.1', next_cursor)
  }
}

hashtags = ['#blackmirror', '#netflix', '#sherlock', '#fleabag', '#pride', '#andrewscott', '#hotpriest', '#moriarty', '#jimmoriarty', '#actor', '#presentlaughter', '#hamlet', '#spectre', '#handsomedevil', '#thestag', '#jamesmoriarty', '#miley', '#thisbeautifulfantastic', '#kinglear', '#jamesbond', '#irishactor', '#oldvictheatre', '#seawall', '#steelcountry', '#proudofandrewscott', '#sherlocked', '#swallowsandamazons', '#consultingcriminal', '#bandersnatch', '#bhfyp']

var hashtag = hashtags[Math.floor(Math.random()*hashtags.length)];

_grab_tweets_with_gt(onDone, hashtag , '127.0.0.1')

