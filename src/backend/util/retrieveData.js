//GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}

const getContent = function(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

const checkExpired = function(db) {
  return db.get('reservation').findOne({})
  .then(d => !d || (new Date().getTime() - d._id.getTimestamp()) > 300000);
};

const requestData = function() { // Check for cached data & timestamp
  const sheetId = "1egcRTNt_qWpLTeyJASgQ3WoLqTZUXnGQ2QgBUIh7BZY";
  const range = encodeURIComponent("All Entries!A4:AI");
  const key = process.env.GOOGLE_API_KEY;
  const url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetId + "/values/" + range + "?key=" + key;
  console.log('requesting ' + url);
  return getContent(url).then(JSON.parse).then(d => d.values).catch(err => []);
};

const translateTimeZone = function(timeZoneString) {
  var timeZone
  switch(true) {
    case timeZoneString.startsWith("Eastern"):
    return "EST";
    case timeZoneString.startsWith("Central"):
    return "CST";
    case timeZoneString.startsWith("Mountain"):
    return "MST";
    case timeZoneString.startsWith("Pacific"):
    return "PST";
    default:
    return "";
  }
};

const translateDate = (d, t, tz) => new Date(d + ' ' + t + ' ' + translateTimeZone(tz));

const valueOrNull = (value) => value && value.length > 0 ? value : null;

const inviteToObject = function(inviteData) {
  return {
    username: valueOrNull(inviteData[0]),
    location: valueOrNull(inviteData[2]),
    state: valueOrNull(inviteData[3]),
    country: valueOrNull(inviteData[4]),
    owner: inviteData[5].startsWith("Owner"),
    date: translateDate(inviteData[6], inviteData[8], inviteData[7]),
    inStore: inviteData[9] == "In-Store",
    inviteDate: inviteData[10].length > 0 ? new Date(inviteData[10]) : null,
    configurationDate: inviteData[11].length > 0 ? new Date(inviteData[11]) : null,
    vinDirty: valueOrNull(inviteData[12]),
    vin: valueOrNull(inviteData[13]),
    vinDate: inviteData[14].length > 0 ? new Date(inviteData[14]) : null,
    deliveryDate: inviteData[15].length > 0 ? new Date(inviteData[15]) : null,
    color: valueOrNull(inviteData[16]),
    wheels: valueOrNull(inviteData[17]),
    autopilot: valueOrNull(inviteData[18]),
    firstProductionDeliveryEstimate: valueOrNull(inviteData[19]),
    shortRangeDeliveryEstimate: valueOrNull(inviteData[20]),
    awdDeliveryEstimate: valueOrNull(inviteData[21]),
    powertrain: valueOrNull(inviteData[22]),
    interior: valueOrNull(inviteData[23]),
    trim: valueOrNull(inviteData[24]),
    battery: valueOrNull(inviteData[25]),
    comments: valueOrNull(inviteData[26]),
    lastUpdate: inviteData[27].length > 0 ? new Date(inviteData[27]) : null,
    calculatedDeliveryDate: inviteData[30] && inviteData[30].length > 0 ? new Date(inviteData[30]) : null,
    status: valueOrNull(inviteData[31]),
    configurationToDelivery: valueOrNull(inviteData[32]),
    configurationToVin: valueOrNull(inviteData[33]),
    vinToDelivery: valueOrNull(inviteData[34])
  };
};

const performUpdate = function(db) {
  return requestData()
  .then(d => d.map( x => inviteToObject(x) ).filter( x => x !== undefined))
  .then(i => db.get('reservation').remove({}).then(() => db.get('reservation').insert(i)))
  .then(function() { return true; });
};

const updateDatabase = function(db) {
  return checkExpired(db).then(function(expired) {
    if (!expired) {
      return true;
    }
    return performUpdate(db);
  });
};

//checkExpired(db).then(x => console.log(db ? "expired" : "still valid"))
//"mongodb://localhost:27017/model3data"
module.exports = {
  updateDatabase: updateDatabase
};
