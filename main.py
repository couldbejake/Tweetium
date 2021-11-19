from multiprocessing.pool import Pool
import random
import time
import os

def writeOut(index):
   print("Starting process #{0}".format(index))
   os.system('node subprocess.js')
   print("Finished process #{0} which delayed for {1}s.".format(index))

pool = Pool(processes=10)
pool.map(writeOut, range(10))