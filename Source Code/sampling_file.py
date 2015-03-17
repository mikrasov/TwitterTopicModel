from sets import Set
import random

#files from data
edgeFile = 'hashtags.all.followedBy'
mapFile = ''numeric2screen'

#vars
months = ['06', '07', '08', '09', '10', '11', '12']
delimiter = '||##|\/|##||'


#STEP 1: determine neighborhoods of all nodes
ids = {}
f = open(edgeFile, 'r')

for line in f:
	[u,v] = line.split()
	if u not in users:
		ids[u] = Set([v])
	else:
		ids[u].add(v)
	if v not in users:
		ids[v] = Set([u])
	else:
		ids[v].add(u)

f.close()


#STEP 2: determine tweet count per user

names = {}

#go through all the per month tweet files
for m in months:
        print 'on month',i
        filename = 'tweets2009-'+ m +'.txt'

        f = open(filename, 'r')
	#counter to keep track of line type
		#line 1 is blank
		#line 2 is timestamp
		#line 3 is user url
		#line 4 is tweet (%4 == 0)
        count = 0
	#for each line in file
        for line in f:
                count = (count+1)%4
                #print line
                if count == 3:
                        line = line.split('/')
                        #print line
                        if len(line) == 4:
                                line = line[3]
                                if line not in names:
                                        names[line] = 1
                                else:
                                        names[line]+=1

        f.close()


#STEP 3: Determe which users have at least 10 neighbors

for u in ids.keys():
	if len(ids[u]) < 10:
		del ids[u]


#STEP 4: Determe which users have at least 100 tweets

for u in names.keys():
	if names[u] < 100:
		del names[u]


#STEP 5: Determine intersection of users with at least 10 neighbors and at least 100 tweets

f = open(mapFile, 'r')

mapping = {}

for line in f:
	line = line.split()
	if line[1] in names and line[0] in ids:
	mapping[line[0]] = line[1]
f.close()

#STEP 6: Sample 100 users

temp = mapping.keys()
random.shuffle(temp)

initial_sample = Set(temp[:100])


#STEP 7: Randomly sample at most 10 neighbors for each of the previously sampled users

neighbor_sample = Set([])

for u in initial_sample:
	temp = list(ids[u])
	#limit neighbors to be sampled to those in the general sampling pool
	for v in ids[u]:
		if v not in ids:
			temp.pop(temp.index(v))
	#if pruned neighbor list hast no more than 10 users, sample them all
	if len(temp) <=10:
		for v in temp:
			neighbor_sample.add(v)
	#else, randomly sample 10 from list
	else:
		random.shuffle(temp)
		for v in range(10):
			neighbor_sample.add(temp[v])

final_sample = initial_sample.union(neighbor_sample)

#STEP 8: Randomly sample 100 tweets for each sampled user

#Preliminary step

fname = 'tweets_all.txt'

f = open(fname, 'w')

#go through all the per month tweet files
for m in months:
        print 'on month',i
        gname = 'tweets2009-'+ m +'.txt'
	g = open(gname, 'r')

        print 'on month',m

        #third line has username (%4 = 2)
        #fourth line has tweet (%4 = 3)

        flag = False

        for line in g:
                #print line
                if flag == True:
                        f.write(line)
                        flag = False

                if line[0] == 'U':
                        line = line.split()
                        line = line[1].split('/')
                        #print line
                        #print line[3]
                        if len(line) == 4 and line[3] in names:
                                #print line[3]
                                names[line[3]] +=1
                                f.write(line[3] + delimiter)
                                flag = True
        g.close()


f.close()

print 'done reading and storing tweets'
#End of Preliminary Step

f = open(fname, 'r')

for line in f:
        u = line.split(delimiter)[0]
        names[u]+=1

samples = {}

for name in names:
        temp = [x for x in range(1,names[name]+1)]
        random.shuffle(temp)
        samples[name] = temp[0:100]
        names[name] = 0

f = open(fname, 'r')

gname = 'tweet_samples.txt'

g = open(gname, 'w')

for line in f:
        u = line.split(delimiter)[0]
        names[u]+=1
        if names[u] in samples[u]:
                print line
                line = line.split(delimiter+'W\t')
                print line
                g.write(u + '\t' + line[1])

f.close()
g.close()

print 'DONE!!!'







