#!/usr/bin/python

database = './database/poll.db'

IndriQueryHandler = '/data1/home/jl1749/trec-dd-2015/indri_5.0/IndriQueryForMinerva/IndriQueryForMinerva'

textParseHandler = '/data2/home/hw271/memex/StanfordNLP/nlp-nounpair.jar'

index_path = { 1 : '/data1/memex/index/electronics'}

retrieveNum = 80

class TestForm:
	def __init__(self, type='init'):
		self.values = {'type': type, 'case_name': 'beijing', 'user_id': 1, 'domain_id': 1, 'case_id': 5,\
		 'annotated_text': 'zhuhai', 'rating': 3, 'num': 20}

	def getvalue(self, key, defaultValue):
		return self.values.get(key, defaultValue)
