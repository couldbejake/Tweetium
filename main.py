#from multiprocessing.pool import Pool
#import random
#import time
#import os

#def writeOut(index):
#    print("Starting process #{0}".format(index))
#    os.system('node subprocess.js')
#    print("Finished process #{0} which delayed for {1}s.".format(index))

#pool = Pool(processes=10)
#pool.map(writeOut, range(10))

import subprocess

batcmd="node subprocess.js"

for i in range(40):
    result = subprocess.check_output(batcmd, shell=True)
    