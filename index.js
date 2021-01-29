var config = require('./config');
const express = require("express");
const app = express();
const { MongoClient } = require('mongodb');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    label({ label: 'proetusemu' }),
    timestamp(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
  exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const MONGO_UNASSIGNED_COLLECTION = 'unassigned';
var unassignedCases = [];

app.get("/", async (req, res) => {
  const client = new MongoClient(config.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  logger.info("Incoming GET request from IP \"" + req.ip + "\".");
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    const database = client.db(config.MONGO_DB);
    await database.command({ ping: 1 });
    logger.debug("Connected successfully to mongo server.");

    const unassignedCollection = database.collection(MONGO_UNASSIGNED_COLLECTION);

    const cursor = unassignedCollection.find();

    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      logger.debug("No documents found!");
    }

    unassignedCases = await cursor.toArray();

    var body = "";
    for (const _case of unassignedCases) {
      logger.verbose("Processing case \"" + _case._id + "\".");
  
      if (_case.caseOrigin.localeCompare("Salesforce") == 0) {
        _case.caseOrigin = "SF";
        logger.verbose("_case.caseOrigin set to \"SF\".");
      }
      if (_case.country.localeCompare("United States of America") == 0) {
        _case.country = "USA";
        logger.verbose("_case.country set to \"USA\".");
      }
      _case.severity = _case.severity.split(' - ')[1];
      logger.verbose("_case.severity set to \"" + _case.severity + "\".");

    const queues = [
	           ['OES', 'Open Enterprise Server'],
	           ['Condrey', 'Condrey'],
	           //['Kanaka', 'Condrey'],
	           ['eDir', 'eDirectory'],
	           ['eDirectory', 'eDirectory'],
	           ['IDM', 'IDM Advanced Edition'],
	           ['Client', 'Client'],
	           ['Filr', 'Filr Standard Edition'],
	           ['GW', 'GroupWise'],
	           ['GroupWise', 'GroupWise'],
	           ['ZEN', 'ZENWorks'],
	           ['ZENWorks', 'ZENWorks'],
	           ['SBM', 'SBM'],
	           ['SLM', 'SLM'],
	           ['Rumba', 'RUMBA'],
	           ['PAM', 'Privileged Account Manager'],
	           ['NAM', 'Access Manager'],
	           ['RefDesk', 'Reflection Desktop'],
	           ['AccuRev', 'AccuRev Enterprise Edition'],
	           ['Silk', 'SilkTest'],
	           ['Databridge', 'Databridge Enterprise'],
	           ['Enterprise Dev', 'Enterprise Developers for zEnterprise'],
	           ['AAF', 'Advanced Authentication'],
	           ['ChangeMan', 'ChangeMan ZMF'],
	           ['Orbix', 'MF-Orbix Mainframe Runtime'],
	           ['EA', 'Enterprise Analyzer - Analyst Client'],
	           ['Enterprise Analyzer', 'Enterprise Analyzer - Analyst Client'],
	           ['TGAudit', 'TGAudit'],
	           ['StarTeam', 'StarTeam Enterprise'],
	           ['MFA', 'Mainframe Access Suite'],
	           ['Enterprise Server', 'Enterprise Server'],
	           ['ES', 'Enterprise Server']
      ];

      var subjectRouting = "";
      var subjectSplit = _case.subject.split(':');
      _case.product =  _case.product.split('>')[1].split('<')[0];  
      logger.verbose("_case.product set to \"" + _case.product + "\".");
      if (_case.product.localeCompare(" ") == 0) {
        _case.product = "";
        logger.verbose("_case.product set to empty string.");
      }
      if (_case.product.localeCompare("") == 0) {
        _case.product = "NULL";
        logger.verbose("_case.product set to \"NULL\".");
      }
      for (i = 0; i < queues.length; i++) {
        if (subjectSplit[0].localeCompare(queues[i][0]) == 0) {
          subjectRouting = queues[i][1];
        }
      } 
      if (subjectRouting.localeCompare("") != 0) {
        _case.product = subjectRouting;
        logger.verbose("_case.product set to \"" + _case.product + "\".");
      }
  
      body += _case.logTime + "|" + 
              _case._id + "|" +
              _case.product + "|" +
              _case.severity + "||" +
              _case.caseOrigin + "||" +
              _case.dateTimeOpened + "|" +
              _case.caseDate + "|" + //last modified
              _case.status + "|||||" +
              _case.contactRegion + "|" +
              _case.country + "||||" +
              _case.accountName + "|||||||" +
              _case.subject + "<br>";
    }
    logger.debug("html body: " + body);
    res.send(`<html>${body}</html>`);

  } catch (e) {
    logger.error("Error caught: " + e);
  } finally { 
    await client.close();
    logger.debug("Connection closed.");
  } 
});

app.listen(config.HTTP_PORT, () => {
  logger.info("Server started on port " + config.HTTP_PORT + ".");
});
