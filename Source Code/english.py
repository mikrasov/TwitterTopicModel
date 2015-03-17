import os, time
from mpi4py import MPI

comm = MPI.COMM_WORLD
size = comm.Get_size()
rank = comm.Get_rank()
status = MPI.Status()

width = 10000000
tweetFile = 'users_1000_tweets.txt'
delimiter = '||##|\/|##||'

#if master
if rank == 0:
	
	#get number of lines
	x = os.popen('wc -l users_1000_tweets.txt').read()
	lines = int(x.split()[0])	

	#create start indeces
	indeces = []
	limit = lines/width
	for n in range(limit+1):
		indeces.append(n*width)

	#send index to slaves

	sent = 0

	total = len(indeces)

	#getting a start time
        start = time.time()

	#sending initial indeces
        for x in range(1,size):
                comm.send(indeces.pop(),dest = x)
                print "sent node",x,"work"
                sent +=1

	#counting replies received
        received = 0

        #while not done
        while received < total:
                #wait until a slave finishes
                comm.recv(source=MPI.ANY_SOURCE, status = status)
                received+=1
                dest = status.Get_source()
                print "received answer from node",dest
                print "received",received,"so far"
                #if there is still work, send the node more work
                if len(indeces) > 0:
                        comm.send(indeces.pop(), dest = dest)
                        print "sent node", dest,"more work"
                        sent+=1
                #else, tell the node it can shut down
                else:
                        comm.send(-1, dest=dest)
        #get end time
        end = time.time()

        #final print outs
        print "work not sent:",indeces
        print "sent",sent,"indexes and received",received,"replies"
        print "total number of indexes to send were",total
        print "work took",end-start,"time"

#end of master  


#if slave
else:

	import langid

	print "I am slave",rank,"ready to receive network."


	#receive initial index of data portion
        while 1:
                index = comm.recv(source=0, status=status)
                if index == -1:
                        break

		gname = 'tweet_lang_' + str(index) + '.txt'

		f = open(tweetFile, 'r')

		vals = []		

		for x in range(index):
			f.readline()

		for x in range(width):
			line = f.readline()
			if line == '':
				break
			else:
				[name, tweet] = line.split(delimiter+'W\t')

				lang = langid.classify(tweet)
        			if lang[0] == 'en':
                			vals.append(1)
        			else:
                			vals.append(0)

		g = open(gname, 'w')
		for val in vals:
			g.write(str(val) + '\n')

		g.close()
 		comm.send(1, dest = 0)


	print "I am node",rank,", shutting down."




