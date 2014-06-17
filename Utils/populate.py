from bs4 import BeautifulSoup
import urllib3
import os, sys

http = urllib3.PoolManager()

s = os.fork()
if(s!=0):
    sys.exit()
pid = os.getpid()
pidfile = open('populate.pid', 'w')
pidfile.write(str(pid))
pidfile.close()

logfile = open('session.log', 'w')


for i in range(1,50):
	r = http.request('GET', 'parsoid-tests.wikimedia.org/topfails/%s'%i)
	print("fetched page -%s"%i)
	logfile.write("fetched page -%s"%i)
	soup = BeautifulSoup (r.data)

	for tr in soup.find_all('tr', {'status': ['skip', 'fail']}):
		a = tr.td.find_all('a')
		fullLink = a[1].get('href')
		href = ''.join(fullLink.split('/_rt'))
		r = http.request('GET', href)
		print("done")
		logfile.write("done -%s"%i)

logfile.close()