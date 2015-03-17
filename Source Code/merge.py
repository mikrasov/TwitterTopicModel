
width = 10000000

gname = 'tweet_lang_all.txt'

g = open(gname, 'w')

for x in range(9):
	index = width*x
	fname = 'tweet_lang_'+str(index)+'.txt'

	f = open(fname, 'r')

	for line in f:
		g.write(line)
	f.close()
	print 'done with index',index
g.close()


