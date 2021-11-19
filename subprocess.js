const { fork } = require('child_process');

var hashtags = ['#blackmirror', '#netflix', '#sherlock', '#fleabag', '#pride', '#andrewscott', '#hotpriest', '#moriarty', '#jimmoriarty', '#actor', '#presentlaughter', '#hamlet', '#spectre', '#handsomedevil', '#thestag', '#jamesmoriarty', '#miley', '#thisbeautifulfantastic', '#kinglear', '#jamesbond', '#irishactor', '#oldvictheatre', '#seawall', '#steelcountry', '#proudofandrewscott', '#sherlocked', '#swallowsandamazons', '#consultingcriminal', '#bandersnatch', '#bhfyp']

var start = process.hrtime();
var total = 0
var open_threads = 0;

function onExit(){
  console.log('thread ended')
  open_threads -= 1
}

function create_process(hashtag){
  const forked = fork('worker.js');
  var hashtag = hashtags[Math.floor(Math.random()*hashtags.length)];
  forked.send(hashtag);
  forked.on('exit', onExit);
  forked.on('close', onExit);
  forked.on('message', (msg) => {
    total += msg
    var sec = process.hrtime(start)[0]
    var twps = Math.floor(total/sec)
    console.log(twps + ' tps, threads ' + open_threads)
  });
}


for (let i = 0; i < 100; i++) {
  var hashtag = hashtags[Math.floor(Math.random()*hashtags.length)];
  create_process(hashtag)
  open_threads += 1
}
