from bs4 import BeautifulSoup
import urllib3
import time

http = urllib3.PoolManager()

r = http.request('GET', 'parsoid-tests.wikimedia.org/topfails/2')

soup = BeautifulSoup (r.data)

for tr in soup.find_all(status='fail'):
	a = tr.td.find_all('a')
	fullLink = a[1].get('href')
	href = ''.join(fullLink.split('/_rt'))
	r = http.request('GET', href)
	time.sleep(3)
	print("done")