from itertools import izip
import collections
from sets import Set
import sys
from math import log

NUM_TWEETS_PER_USER = sys.argv[1]
NUM_TOPICS_PER_USER = sys.argv[2]

print(NUM_TWEETS_PER_USER)
print(NUM_TOPICS_PER_USER)


num_topics = 3

f_users = open('user_id_100.txt', 'r')
f_topics = open('ldaoutput_500.txt', 'r')
f_neighbors = open('new_sample_edges.txt', 'r')

user_list = []
user_topic_dict = {} #top 3 topics
user_topic_dict_all = {}
user_neighbors = {}

for line in f_users:
	user_list.append(line.rstrip())

f_users.close()

line_num = 0
for line in f_topics:
	float_list = [float(x) for x in line.split()]
	if(len(float_list) != 10):
		print("Wrong number of topics")
		sys.exit(0)
	user_topic_dict_all[user_list[line_num]] = float_list
	sorted_list = sorted(float_list)[-num_topics:]
	x, y, z = sorted_list
	user_topic_dict[user_list[line_num]] = [float_list.index(x), float_list.index(y), float_list.index(z)]
	line_num += 1

f_topics.close()

for line in f_neighbors:
	u, v = line.split()
	if u not in user_neighbors:
		user_neighbors[u] = Set(v)
	else:
		user_neighbors[u].add(v)
	if v not in user_neighbors:
		user_neighbors[v] = Set(u)
	else:
		user_neighbors[v].add(u)

f_neighbors.close()

def isHomophilous(x, y, choice):
	if choice == 0 :
		if(len(Set(x).intersection(Set(y))) > 0):
			return 1
		else:
			return 0
	elif choice == 1:
		return len(Set(x).intersection(Set(y)))/float(num_topics)

def originalMeasures():
	f_homophily_binary = open("homophily_binary_" + str(NUM_TWEETS_PER_USER) + "_" + str(NUM_TOPICS_PER_USER) + ".txt", 'w')
	f_homophily_ratios = open("homophily_ratios_" + str(NUM_TWEETS_PER_USER) + "_" + str(NUM_TOPICS_PER_USER) + ".txt", 'w')
	for user, neighbors in user_neighbors.iteritems():
		total_neighbors = float(len(neighbors))
		try:
			user_topics = user_topic_dict[user] #store the topics of current user
		except KeyError:
			continue
		num_homopholous_binary = 0.0
		num_homopholous_ratio = 0.0
		for neighbor in neighbors:
			try:
				neighbors_topics = user_topic_dict[neighbor]
			except KeyError:
				continue
			num_homopholous_binary += isHomophilous(user_topics, neighbors_topics, 0)
			num_homopholous_ratio += isHomophilous(user_topics, neighbors_topics, 1)

		f_homophily_binary.write(str(num_homopholous_binary/total_neighbors) + "\n")
		f_homophily_ratios.write(str(num_homopholous_ratio/total_neighbors) + "\n")

	f_homophily_binary.close()
	f_homophily_ratios.close()

def relativeEntropyMeasures():
	f_kullback = open("kullback_leibler_output_" + str(NUM_TWEETS_PER_USER) + "_" + str(NUM_TOPICS_PER_USER) + ".txt", 'w')
	for user, neighbors in user_neighbors.iteritems():
		total_neighbors = float(len(neighbors))
		try:
			user_topics = user_topic_dict_all[user] #store the topics of current user
		except KeyError:
			continue
		kullback_leibler_sum = 0.0
		for neighbor in neighbors:
			try:
				neighbors_topics = user_topic_dict_all[neighbor]
			except KeyError:
				continue	
			kullback_leibler_sum += kullback_leibler(user_topics, neighbors_topics)

		f_kullback.write(str(kullback_leibler_sum/total_neighbors) + "\n")

	f_kullback.close()

def kullback_leibler(u, v):
	rel_ent = 0.0
	for x in range(len(u)):
		rel_ent+=(u[x] * log(u[x]/v[x],2))
	return rel_ent


originalMeasures()
relativeEntropyMeasures()

