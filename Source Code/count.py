
delimiter = '||##|\/|##||'

fname = 'users_1000_tweets_en.txt'

names = {}

f = open(fname, 'r')

for line in f:
	line = line.split(delimiter)
	if line[0] not in names:
		names[line[0]]=1
	else:
		names[line[0]]+=1

f.close()

print 'finished counting tweets'
print 'total users:',len(names)

fname = 'users_1000_count.txt'

f = open(fname, 'w')

for name in names:
	f.write(name + '\t' + str(names[name]) + '\n')
f.close()


print 'finished writing counts'


