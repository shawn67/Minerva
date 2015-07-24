#!/usr/local/bin/python2.7

import cgi
import sys
import sqlite3
import subprocess
from os import environ
from config import database, index_path, IndriQueryHandler, retrieveNum, TestForm, queryFeedbackHandler
#from authentication import cookieAuthentication

type_array = ['init', 'fetch', 'feedback']

def statusResponse(code):
	print 'status: %d\r\n'%code

def getValues(form, fields):
	values = []
	for field in fields:
		values.append(form.getvalue(field, None))
	return values

def main():
	#result = cookieAuthentication(environ)
	#if not result:
		#return statusResponse(401)

	form = cgi.FieldStorage()
	##form = TestForm(sys.argv[1])

	request_type = form.getvalue('type', 'init') ## set to init for debug
	if request_type in type_array:
		con = sqlite3.connect(database)
		cur = con.cursor()

 	if request_type == 'init':
 		query, user_id, domain_id, case_id = getValues(form, ['case_name', 'user_id', 'domain_id', \
 			'case_id'])
 		rating = -1

 		if query == '' or not query:
 			return statusResponse(400)
		try: 
			user_id, domain_id, case_id = int(user_id), int(domain_id), int(case_id)
			## validate the tuple above
		except:
			return statusResponse(400)
		try:
		    retrieved_results = subprocess.check_output([IndriQueryHandler, index_path[domain_id], query.replace('\n',''), str(retrieveNum)])
		except:
		    retrieved_results = ''
		for result in retrieved_results.splitlines():
			docno, score = result.split()
			cur.execute('SELECT state FROM docPoll WHERE user_id=? AND domain_id=? AND case_id=? AND docno=?', \
				[user_id, domain_id, case_id, docno])
			doc_entry = cur.fetchone()
			if doc_entry:
				state, = doc_entry
				if state == 0:
					cur.execute('UPDATE docPoll set score=? WHERE user_id=? AND domain_id=? AND case_id=? \
						AND docno=?', [score, user_id, domain_id, case_id, docno])
					## update rating?
			else:
				cur.execute('INSERT INTO docPoll VALUES(?, ?, ?, ?, ?, ?, ?)', [user_id, domain_id, case_id, \
					docno, rating, score, 0])
		statusResponse(200) 
		con.commit()
		con.close()

	elif request_type == 'fetch':
		user_id, domain_id, case_id, returnNum = getValues(form, ['user_id','domain_id','case_id', 'num'])
		try: ## duplicate with above codes, consider integrating them later
			user_id, domain_id, case_id, returnNum = int(user_id), int(domain_id), int(case_id), int(returnNum)
			## validate the tuple above
		except:
			return statusResponse(400)

		cur.execute('SELECT docno, rating, score FROM docPoll WHERE user_id=? AND domain_id=? \
			AND case_id=? AND state=0 ORDER BY rating*score ASC LIMIT ?', [user_id, domain_id, case_id, returnNum])
		selected_results = cur.fetchall()

		return_str = ''
		for result in selected_results:
			return_str += ','.join([result[0], str(result[1]*result[2])]) + '\n'
			cur.execute('UPDATE docPoll SET state=1 WHERE docno=? AND user_id=? AND domain_id=? \
				AND case_id=?', [result[0], user_id, domain_id, case_id])
		con.commit()
		con.close()

		print ("Content-Type: text/csv")
		print ("Content-Disposition: attachment; filename=list.csv")
		print ("Status: 200 OK\r\n")
		print (return_str)

	elif request_type == 'feedback':
		query, user_id, domain_id, case_id, para_array, para_pair = getValues(form, ['case_name', 'user_id', 'domain_id', \
 			'case_id', 'para_array', 'para_pair'])
		rating = -1
		try: 
			user_id, domain_id, case_id = int(user_id), int(domain_id), int(case_id)
			## validate the tuple above
		except:
			return statusResponse(400)
		try:
			queries = subprocess.check_output(['java','-jar',queryFeedbackHandler, '"%s"'%para_pair, '"%s"'%para_array])
			log_handler = open('queries.log','w')
			log_handler.write(queries)
			log_handler.close()
		except:
		    queries = ''
		'''
		try:
		    retrieved_results = subprocess.check_output([IndriQueryHandler, index_path[domain_id], query.replace('\n',''), str(retrieveNum)])
		except:
		    retrieved_results = ''
		'''
	else:
		errorRequest(400)



if __name__ == '__main__':
	main()
