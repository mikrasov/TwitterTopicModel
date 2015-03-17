# TwitterTopicModeling
Research Project for CS 290D

I'm just going to put updates in the README so everyone can see them without searching through email. 
Currently, I have updated version of the preprocessing and LDA implementation. In the case where each tweet was considered individually, there had to be some way of combining the results of all the tweets of a given user. 

To do this, I simply added them for now. Though this obviously does not result in a probability distribution, if we are only taking the top topics per user it should preserve which topics appear the most often in a user's tweets. Nevertheless, might want to find a better way. 


TODO: 
Run on large dataset using server. 
Better way of dealing with mispelled words/non-English words? 
Better combining of tweet scores. 
