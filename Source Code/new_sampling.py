import random
from sets import Set
delimiter = '||##|\/|##||'

edgeFile = 'hashtags.all.followedBy'
mapFile = 'numeric2screen'


#Step 1: determine how many users have at least 1000 tweets in English
names = {}

fname = 'users_1000_tweets_en.txt'
gname = 'users_1000_recount.txt'

f = open(fname, 'r')

for line in f:
	u = line.split(delimiter)[0]
	if u not in names:
		names[u] = 1
	else:
		names[u]+=1
f.close()

g = open(gname,'w')
count = 0
for name in names:
	if names[name] >=1000:
		g.write(name + '\t' + str(names[name]) + '\n')
		count+=1
g.close()
print count




#Step 2: Sample 110 seed users and at most 20 neighbors for each of these

fname = 'users_1000_recount.txt'

names = {}

f = open(fname,'r')

for line in f:
	line = line.split()
	names[line[0]] = int(line[1])
f.close()

print 'done loading names'

#Preliminary step: obtain list of neighbors and mapping

mapping = {}

f = open(mapFile, 'r')

for line in f:
        line = line.split()
        if line[1] in names:
        	mapping[line[0]] = line[1]
f.close()

print 'done loading mapping'

ids = {}

f = open(edgeFile, 'r')

for line in f:
        [u,v] = line.split()
	if u in mapping and v in mapping:
        	if u not in ids:
                	ids[u] = Set([v])
        	else:
                	ids[u].add(v)
        	if v not in ids:
                	ids[v] = Set([u])
        	else:
                	ids[v].add(u)
f.close()

print 'done loading edges'

#Done with preliminary steps

print 'length of ids:',len(ids)
t = ids.keys()
random.shuffle(t)

initial_sample = Set(t[:110])

neighbor_sample = Set([])

for u in initial_sample:
	#print u
	#print u in ids
        temp = list(ids[u])
        #if neighbor list hast no more than 10 users, sample them all
        if len(temp) <=20:
                for v in temp:
                        neighbor_sample.add(v)
        #else, randomly sample 20 from list
        else:
                random.shuffle(temp)
                for v in range(20):
                        neighbor_sample.add(temp[v])

final_sample = initial_sample.union(neighbor_sample)

print 'done sampling users'
print 'sampled',len(final_sample),'users'

f = open('new_sample_names.txt','w')

for id in final_sample:
	name = mapping[id]
	f.write(name + '\n')
f.close()

print 'stored names of sampled users'

samples = {}

for id in final_sample:
	name = mapping[id]
        temp = [x for x in range(1,names[name]+1)]
        random.shuffle(temp)
        samples[name] = temp[0:1000]
        names[name] = 0

f = open('users_1000_tweets_en.txt', 'r')

gname = 'new_tweet_samples.txt'

g = open(gname, 'w')

for line in f:
        u = line.split(delimiter)[0]
	if u in names and u in samples:
        	names[u]+=1
        	if names[u] in samples[u]:
                	#print line
                	line = line.split(delimiter+'W\t')
                	#print line
                	g.write(u + '\t' + line[1])

f.close()
g.close()

print 'done sampling tweets'

print 'DONE!!!'


