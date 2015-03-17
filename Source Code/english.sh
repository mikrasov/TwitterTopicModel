
mpirun -np 9 python english.py

python merge.py

awk '/1/ {print FNR}' tweet_lang_all.txt > subset.txt

awk 'NR == FNR {nums[$1]; next} FNR in nums' subset.txt users_1000_tweets.txt > users_1000_tweets_en.txt

