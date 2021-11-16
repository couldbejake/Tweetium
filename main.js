const { fork } = require('child_process');

for (let i = 0; i < 50; i++) {
    const forked = fork('compille2.js');
    forked.on('message', (msg) => {
      console.log('Message from child', msg);
    });
    
}

