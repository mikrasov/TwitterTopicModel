from collections import defaultdict
from nltk.stem.porter import *
from nltk.corpus import words
from nltk.corpus import stopwords
import numpy as np
import lda
import re
import sys
import string
#contains non words and additional (alternatively spelt) stop words
non_words = {'|':0, '~':0, '>>':0, '-':0, '&':0, '2':0, '4':0, "i'm":0, 'rt':0, 'u':0, 'ur':0, 'im':0, 'n':0, "don't":0, "won't":0, "can't":0, '3':0, "it'":0}

def is_ascii(s):
    return all(ord(c) < 128 for c in s)

def not_url(word):
    if re.search('http://|www|.com|.org|.edu',word) == None:
	   return True
    return False

def aggregate_tweets(filename):
    stemmer = PorterStemmer()
    tweets = defaultdict(lambda : defaultdict(int))
    vocab = set()
    count = 0
    for i, line in enumerate(open(filename)):
        count+=1
        for word in line.split()[1:]:
	    if is_ascii(word) and not_url(word):
                w = word.lower().strip('\'\".,:!?#@()')
                if w not in stopwords.words('english') and w not in non_words and len(stemmer.stem(w)) > 1: 
                    vocab.add(stemmer.stem(w).strip('\'\".,:!?#@()'))
                    tweets[line.split()[0]][stemmer.stem(w).strip('\'\".,:!?#@()')]+=1
	
        if count%10000 == 0:
	    print count
    return tweets, list(vocab)

def individual_tweets(filename):
    tweets = []
    stemmer = PorterStemmer()
    vocab = set()
    users = []
    count = 0
    for i,line in enumerate(open(filename)):
        count+=1
        w = [word.lower() for word in line.split()[1:] if is_ascii(word)]
        w = [word.strip('\'\".,:!?@#') for word in w if word.strip('\'\".,:!?@#') not in stopwords.words('english')]
        w = [stemmer.stem(word) for word in w]
        tweets.append(w)
        vocab.update(set(word for word in w))
        users.append(line.split()[0])
        if count%1000 == 0:
	    print count
    return tweets, list(vocab), users

def row_to_user_aggregate(tweets):
    return list(tweets)

def row_to_user_solo(topic_user_solo, users):
    user_index = list(set(users))
    return user_index

def make_matrix_aggregated(vocab, tweets):
    X = np.zeros((len(tweets), len(vocab)))
    for i,user in enumerate(tweets):
        for word in tweets[user]:
            X[i][vocab.index(word)] = int(tweets[user][word])
    return X.astype(int)

def make_matrix_solo(vocab, tweets):
    X = np.zeros((len(tweets), len(vocab)))
    for i,review in enumerate(tweets):
        for word in review:
            X[i][vocab.index(word)] += 1
    return X

def run_lda(n, vocab,X):
    model = lda.LDA(n_topics = n)
    model.fit(X)
    topic_word = model.topic_word_
    n_top_words = 11
    for i, topic_dist in enumerate(topic_word):
	   topic_words = np.array(vocab)[np.argsort(topic_dist)][:-n_top_words:-1]
	   print ('Topic {}: {}'.format(i, ' '.join(topic_words)))
    return model.doc_topic_

def consolidate(topic_tweet, users,m):
    user_index = list(set(users))
    topic_user = [[0]*m]*len(user_index)
    for i,dist in enumerate(topic_tweet):
        topic_user[user_index.index(users[i])]+= dist
    return topic_user


if __name__ == "__main__":
    if (len(sys.argv)!=4):
        print "Enter input filename, number of topics, and output file name"
        sys.exit
    filename = sys.argv[1]
    print "Running " + filename + " for " + sys.argv[2] + " topics!!"
    tweets, vocab = aggregate_tweets(filename)
    print 'done aggregating tweets'
    X = make_matrix_aggregated(vocab,tweets)
    print "The top 11 words for " + filename + "with " + sys.argv[2] + " topics are:"
    topic_user = run_lda(int(sys.argv[2]),vocab,X)
    print 'done with LDA'
    np.savetxt(sys.argv[3], topic_user)
    print 'DONE with LDA for documents of 1000 tweets'
