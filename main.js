/*


hashtags = ['#blackmirror', '#netflix', '#sherlock', '#fleabag', '#pride', '#andrewscott', '#hotpriest', '#moriarty', '#jimmoriarty', '#actor', '#presentlaughter', '#hamlet', '#spectre', '#handsomedevil', '#thestag', '#jamesmoriarty', '#miley', '#thisbeautifulfantastic', '#kinglear', '#jamesbond', '#irishactor', '#oldvictheatre', '#seawall', '#steelcountry', '#proudofandrewscott', '#sherlocked', '#swallowsandamazons', '#consultingcriminal', '#bandersnatch', '#bhfyp']

var hashtag = hashtags[Math.floor(Math.random()*hashtags.length)];




const { fork } = require('child_process');

total = 0

var start = process.hrtime();

for (let i = 0; i < 50; i++) {
    const forked = fork('worker.js');
    forked.on('message', (msg) => {
      total += msg
      console.log('\n==')
      console.log('total messages collected -> ' + total)
      var elapsed = process.hrtime(start)[1] / 1000000;
      var ms = elapsed.toFixed(3) 
      var sec = process.hrtime(start)[0]
      var twps = total/sec
      console.log(twps + ' tweets per second')
      console.log('==')
    });
    
}*/


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


//400
for (let i = 0; i < 400; i++) {
  var hashtag = hashtags[Math.floor(Math.random()*hashtags.length)];
  create_process(hashtag)
  open_threads += 1
}

