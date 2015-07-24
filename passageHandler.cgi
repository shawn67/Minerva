#!/usr/local/bin/python2.7
# -*- coding: utf-8 -*-

import cgi, sqlite3, datetime, sys
from database import DBHandler
from authentication import cookieAuthentication
from os import environ, getcwd
import subprocess
from config import textParseHandler
import json
#sys.path.append(getcwd()+'/post')
#from postQrels import postQrels

def passageHandle(form, environ):
    docno        = form.getvalue("docno", 0)
    offset_start = form.getvalue("offset_start", 0)
    offset_end   = form.getvalue("offset_end", 0)
    passage_name = form.getvalue("passage_name", None)
    subtopic_id  = form.getvalue("subtopic_id", None)

    atn_db  = DBHandler("./database/test.db")
    backup_db  = DBHandler("./database/backup.db")

    result = cookieAuthentication(environ)
    if result:
        ## subtopic-user matching check
        dump_jdata = {'options':[]}
	#try:
	if True:
	    atn_db.insert('passage',[None,passage_name.decode('UTF-8'),docno,offset_start,offset_end,0,subtopic_id,0])
	    backup_db.insert('passage',[None,passage_name.decode('UTF-8'),docno,offset_start,offset_end,0,subtopic_id,0])
	    passage_id = atn_db.cur.lastrowid
	    
	    atn_db.cur.execute('SELECT topic_id, subtopic_name FROM subtopic WHERE subtopic_id=?',[int(subtopic_id)])
	    topic_id, subtopic_name = atn_db.cur.fetchone()
	    atn_db.cur.execute('SELECT userid, topic_name FROM topic WHERE topic_id=?',[topic_id])
	    userid, topic_name = atn_db.cur.fetchone()
	    atn_db.cur.execute('SELECT username FROM user WHERE userid=?',[userid])
	    username, = atn_db.cur.fetchone()
	    try:
			logh = open('./userlog/%s.log'%username,'a')
			logline = 'passage/create  |  time: %s  |  # of fields: 6  |  topic_id: %s  |  topic_name: %s  |  subtopic_id: %s  |  subtopic_name: %s  |  passage_id: %s  |  passage_name:  %s\r\n\r\n'%(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S %f").encode('UTF-8'), str(topic_id).encode('UTF-8'), ((topic_name.replace('|',' ')).replace('\n',' ')).encode('UTF-8') , str(subtopic_id).encode('UTF-8'), ((subtopic_name.replace('|',' ')).replace('\n',' ')).encode('UTF-8'), str(passage_id).encode('UTF-8'), ((passage_name.decode('UTF-8')).encode('UTF-8')).replace('\n',' '))
			logh.write(logline)
			logh.close()
	    except:
			pass
	    atn_db.commit()
	    backup_db.commit()
	    
	    parseResult = subprocess.check_output(['java','-jar',textParseHandler, passage_name])
	    log_handler = open('nlp.log','w')
	    log_handler.write(parseResult)
	    log_handler.close()
	    resultLines = parseResult.splitlines()
	    dump_jdata['parseStorage'] = resultLines[0]
	    for result in resultLines[1:]:
		dump_jdata['options'].append(result)

	    #postQrels("http://chaff.cs.uwaterloo.ca/judgements/", topic_id, atn_db, backup_db)
	#except:
	#    passage_id = -1
	dump_jdata['passage_id'] = passage_id
	print('Content-Type: text/plain\r\n')
	print(json.dumps(dump_jdata))

    atn_db.close()
    backup_db.close()

# __main__

form = cgi.FieldStorage()
passageHandle(form, environ)
