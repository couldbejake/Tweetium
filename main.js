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

var numCPUs = require('os').cpus().length;

var start = process.hrtime();
var total = 0

console.log(numCPUs)

function create_process(){
  const forked = fork('worker.js');
  forked.on('message', (msg) => {
    total += msg
    var sec = process.hrtime(start)[0]
    var twps = total/sec
    console.log(twps + ' tweets per second')
  });
}

for (let i = 0; i < 100; i++) {
  create_process()
  
}

