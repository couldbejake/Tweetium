#!/usr/bin/python
# -*- coding: utf8 -*-


global TWITTER_TIMEOUT
global USER_AGENTS
global nlp


global DEBUG_COUNTER

DEBUG_COUNTER = 0

global DB_SETTINGS

DB_SETTINGS = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "tweets",
    "autocommit": True
}


import os, sys
import datetime
import time
import json
import random
import subprocess
import time
import socket
import mysql.connector
import multiprocessing
import spacy
import time
import decimal
import mysql.connector
import requests
import urllib3

from threading import Thread
from urllib.parse import urlparse, urlencode, urlunparse
from bs4 import BeautifulSoup
import concurrent.futures
import time

USER_AGENTS = []

fua = open('user-agents.txt', 'r')
for ua in fua:
    USER_AGENTS.append(ua.replace('\n', ''))

fua.close()

#pip3 install spacy urllib3 sockets pytextrank bs4 mysql.connector thread6
#python3 -m spacy download en_core_web_lg

#ubuntu specific

#sudo apt-get install apache2 pysocks
#sudo apt-get install mariadb-server

#https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-ubuntu-18-04
#https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-on-ubuntu-20-04

#https://stackoverflow.com/questions/21699774/internal-server-error-http-error-500-after-installing-phpmyadmin-on-a-certain


def refresh_proxies():
    proxies = []

    for line in open('https-proxies.txt', 'r'):
            proxies.append('https://' + line.replace('\n', ''))
    for line in open('sock4-proxies.txt', 'r'):
        proxies.append('socks4://' + line.replace('\n', ''))
    for line in open('sock5-proxies.txt', 'r'):
        proxies.append('socks5://' + line.replace('\n', ''))



    print('Loaded (' + str(len(proxies)) + ') proxies!')

    mydb = mysql.connector.connect(**DB_SETTINGS)
    cursor = mydb.cursor()

    sql = "TRUNCATE TABLE proxies"
    cursor.execute(sql)

    for proxy in proxies:
        sql = "INSERT INTO proxies (`id`, `proxy_ip`, `proxy_timeout`, `successful_attempts`, `failed_attempts`) VALUES (NULL, '" + proxy + "', '0', '0', '0');"
        cursor.execute(sql)

    cursor.close()
    mydb.close()

refresh_proxies()

def write_json_to_file(filename, data):
    tempf = open(filename, 'w')
    tempf.write(json.dumps(data, indent=4))
    tempf.close()
    


def twitter_data(search_query, proxy_ip, next_cursor_id = False):
    tua = random.choice(USER_AGENTS)

    headers = {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'User-Agent': tua 
    }

    response = requests.post('https://api.twitter.com/1.1/guest/activate.json', headers=headers, proxies = dict( http=proxy_ip, https=proxy_ip ), timeout=3) #timeout=random.randrange(300, 800)/100)
    guest_token = (response.json()['guest_token'])

    options = {
        'q': search_query,
        'src': 'typd',
        "count":"50",
    }
    if(next_cursor_id != False):
        options['cursor'] = next_cursor_id


    headers = {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'x-guest-token':guest_token,
        'User-Agent': tua 
    }

    response = requests.request("GET", 'https://api.twitter.com/2/search/adaptive.json', headers=headers, data = options, proxies = dict( http=proxy_ip, https=proxy_ip ), timeout=3) #imeout=random.randrange(300, 800)/100)
    tweets_obj = response.text.encode('ascii', errors='ignore')
    tweets_json_global = json.loads(tweets_obj)
    tweets = tweets_json_global['globalObjects']['tweets']

    if(len(list(tweets)) == 0):
        return tweets
    else:
        mydb = mysql.connector.connect(**DB_SETTINGS)
        cursor = mydb.cursor()
        for key in tweets.keys():
            tweet_id = key
            tweet_data = tweets[key]
            #doc = nlp(tweet_data['text'])≈
            print(tweet_data['text'])
            #phrases = ''
            #for p in doc._.phrases:
            #        phrases += p.text + "... "
            sql = "INSERT IGNORE INTO tweets (`tweet_id`, `created_at`, `full_text`, `saved_at`, `coordinates`, `geo`, `retweet_count`, `favorite_count`, `reply_count`) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (tweet_data['id'], tweet_data['created_at'], json.dumps(tweet_data['text']), str(tweet_data['coordinates']), str(tweet_data['geo']), 0, 0, 0))
        cursor.close()
        mydb.close()

        return tweets_json_global

def _get_prime_proxy(cursor):
    cursor.execute("SELECT * FROM proxies WHERE ( UNIX_TIMESTAMP() - proxy_timeout) > 10 ORDER BY (successful_attempts - failed_attempts ) DESC LIMIT 20")
    proxy_choice = random.choice(cursor.fetchall())
    cursor.close()
    return proxy_choice 

def _update_proxy_values(proxy_id, amount, success):

    mydb = mysql.connector.connect(**DB_SETTINGS)
    cursor = mydb.cursor()
    sql = ''

    if(success):
        cursor.execute('UPDATE `proxies` SET successful_attempts = successful_attempts + ' + str(amount) + '  WHERE id = ' + str(proxy_id))
    else:
        cursor.execute('UPDATE `proxies` SET failed_attempts = failed_attempts + ' + str(amount) + '  WHERE id = ' + str(proxy_id))
        cursor.execute('UPDATE `proxies` SET proxy_timeout=UNIX_TIMESTAMP()'  + '  WHERE id = ' + str(proxy_id))

    cursor.close()
    mydb.close()


def __add_twitter_enteries(search_query, twitter_cursor = False):
    
    success = False
    while not success:
        mydb = mysql.connector.connect(**DB_SETTINGS)
        cursor = mydb.cursor()
        proxy = _get_prime_proxy(cursor)
        mydb.close()
        proxy_id = proxy[0]
        proxy_ip = proxy[1]
        try:
            success = True
            data =  twitter_data(search_query, proxy_ip, twitter_cursor)
            _update_proxy_values(proxy_id, 1, True)
            return data
        except Exception as e:
            _update_proxy_values(proxy_id, 2, False)
def parse_twitter(data):
    write_json_to_file('log.txt', data)
    
    if(data and data['globalObjects'] and data['globalObjects']['tweets']):
        tweets = data['globalObjects']['tweets']
        if(len(data['timeline']['instructions']) == 1):
            next_cursor_id = data['timeline']['instructions'][0]['addEntries']['entries'][-1]['content']['operation']['cursor']['value']
        elif('replaceEntry' in data['timeline']['instructions'][-1]):
            next_cursor_id = data['timeline']['instructions'][-1]['replaceEntry']['entry']['content']['operation']['cursor']['value']
        else:
            print('No ursor found!')
            exit()
        return tweets, next_cursor_id
    else:
        return False, False

def _add_twitter_enteries(search_query):
    glob_data = __add_twitter_enteries(search_query)
    tweets, next_cursor = parse_twitter(glob_data)
    
    while True:
        glob_data = __add_twitter_enteries(search_query, next_cursor)
        tweets, next_cursor = parse_twitter(glob_data)
        
        


def start_threads():
    for i in range(round(1000/len(hashtags))):
        for hashtag in hashtags:
            thread_=Thread(target=_add_twitter_enteries,args=(hashtag,))
            thread_.start()

hashtags = "#blackmirror #netflix #sherlock #fleabag #pride #andrewscott #hotpriest #moriarty #jimmoriarty #actor #presentlaughter #hamlet #spectre #handsomedevil #thestag #jamesmoriarty #miley #thisbeautifulfantastic #kinglear #jamesbond #irishactor #oldvictheatre #seawall #steelcountry #proudofandrewscott #sherlocked #swallowsandamazons #consultingcriminal #bandersnatch #bhfyp".split(' ')
    
start_threads()