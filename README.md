# Model 3 Charts
A simple site dedicated to charting model 3 reservation status. This site relies on data from the [Tesla Model 3 invite spreadsheet](https://docs.google.com/spreadsheets/d/1BWscIZyLsh42IHcj1AJNfEF-vzj-vRo-3skcCXgO_Nc/edit#gid=0) which is an incredible data source kept up to date and managed by reddit user [/u/Teslike](https://www.reddit.com/user/Teslike). 

# Dependencies
 * node.js
 * mongodb

## Installing Dependencies on Debian
Install node.js, mongodb, and nginx if desired
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb buildessential nginx
```

# Getting started
The following instructions are intended for Debian Linux
 * `git clone https://github.com/marcuswu/model3charts.git`
 * `node src/backend/data/createScript.js`
 * `npm install -g gulp bower`
 * `npm install`
 * `cd src/frontend ; bower install ; cd -`
 * `cd src/backend ; npm install ; cd -`
 * `gulp`
 * `cd build/ ; NODE_ENV="production" PORT="3000" node index.js`
 
# Getting and refreshing invite spreadsheet data
The spreadsheet data can be refreshed by running `node /home/mwu/model3charts/update.js`
To refresh it periodically, it can be added to the crontab for your user. The following refreshes the data every 5 minutes:
`*/5 * * * * GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY" node /home/mwu/model3charts/update.js`
