from flask import Flask, jsonify, render_template, redirect, current_app
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps


app = Flask(__name__)
CORS(app)
username = 'read_only'
password = 'rJMef22QkRqPDFzk'
client = MongoClient("mongodb+srv://" + username + ":" + password + "@cluster0-paegd.mongodb.net/test?retryWrites=true&w=majority")
db = client.beer_db

accounts_collection = db['accounts']
accounts = [acct for acct in accounts_collection.find()]

taps_collection = db['taps']
taps = [tap for tap in taps_collection.find()]


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', data=taps)

@app.route('/api/accounts',methods=['GET'])
def api_accounts():
    account_list = list(accounts)
    return current_app.response_class(dumps(account_list), mimetype="application/json")

@app.route('/api/accounts_query/<search>',methods=['GET'])
def api_accounts_search(search):
    date = accounts_collection.find().sort('date')
    query1 = {
    "location": {
    "$regex": search,
    "$options" :'i' # case-insensitive
    }
    }
    account_list = list(accounts_collection.find({"$and": [query1,{"date":date[date.count() -1]['date']}]}))
    return current_app.response_class(dumps(account_list), mimetype="application/json")

@app.route('/api/accounts_tap_query/<search>',methods=['GET'])
def api_accounts_tap_search(search):
    date = accounts_collection.find().sort('date')
    query1 = {
    "taps": {
    "$regex": search,
    "$options" :'i' # case-insensitive
    }
    }
    account_list = list(accounts_collection.find({"$and": [query1,{"date":date[date.count() -1]['date']}]}))
    return current_app.response_class(dumps(account_list), mimetype="application/json")

@app.route('/api/taps/<search>',methods=['GET'])
def api_taps(search):
    date = accounts_collection.find().sort('date')
    query1 = {
    "tap": {
    "$regex": search,
    "$options" :'i' # case-insensitive
    }
    }
    taps_list = list(taps_collection.find({"$and": [query1,{"date":date[date.count() -1]['date']}]}))
    return current_app.response_class(dumps(taps_list), mimetype="application/json")

@app.route('/api/totals',methods=['GET'])
def api_totals():
    date = accounts_collection.find().sort('date')

    taps_list = taps_collection.find_one({"date":date[date.count() -1]['date']})
    return current_app.response_class(dumps(taps_list), mimetype="application/json")

if __name__ == '__main__':
    app.run(debug=True)
