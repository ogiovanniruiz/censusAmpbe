var Report = require ('../models/reports/report')
var People = require ('../models/people/person')
var Organization = require('../models/organizations/organization')
var Campaign = require('../models/campaigns/campaign');

var languages = ["arabic",
    "armenian",
    "assyrian_neo_aramaic",
    "cantonese",
    "chaldean_neo_aramaic",
    "chinese",
    "farsi",
    "filipino",
    "hindi",
    "hmong",
    "iu_mien",
    "japanese",
    "khmer",
    "korean",
    "mandarin",
    "min_nan_chinese",
    "portuguese",
    "punjabi",
    "russian",
    "spanish",
    "tagalog",
    "telugu",
    "thai",
    "ukrainian",
    "vietnamese"]

var htcGroups = ["immigrants_refugees",
    "middle_eastern_and_north_africa",
    "homeless_individuals_and_famili",
    "farmworkers",
    "veterans",
    "latinos",
    "asian_americans_pacific_islande",
    "african_americans",
    "native_americans_tribal_communi",
    "children_ages_0_5",
    "lesbian_gay_bisexual_transgende",
    "limited_english_proficient_indi",
    "people_with_disabilities",
    "seniorsolder_adults",
    "low_broadband_subscription_rate"]

const updateReport = async(org) => {
    var people =  await People.find({"canvassContactHistory.orgID": org._id})
    var latestReport = await Report.findOne({}, {}, { sort: { 'reportDate' : -1 } });
    if(!latestReport) latestReport = {reportDate: 0}
    //var latestReport = {reportDate: 0}
    var count = 0

    for(var i = 0; i < people.length; i++){        
        for(var j = 0; j < people[i].canvassContactHistory.length; j++){
            if(people[i].canvassContactHistory[j].orgID === org._id){
                for(var k = 0; k < people[i].canvassContactHistory[j].idHistory.length; k++){
                    if(latestReport.reportDate < people[i].canvassContactHistory[j].idHistory[k].date){                    
                        var report = new Report({campaignID: people[i].canvassContactHistory[j].campaignID,
                                                 orgID: people[i].canvassContactHistory[j].orgID,
                                                 userID: people[i].canvassContactHistory[j].idHistory[k].idBy,
                                                 idResponses: people[i].canvassContactHistory[j].idHistory[k].idResponses,
                                                 personID: people[i]._id,
                                                 idDate: people[i].canvassContactHistory[j].idHistory[k].date,
                                                 activityType: "CANVASS",
                                                 location: people[i].address.location,
                                                 activityID: people[i].canvassContactHistory[j].activityID,
                                                }
                                                );
                        report.save()
                        count = count + 1
                        console.log('Canvass', org.name,": ",count)
                    }
                }                
            }
        }
    }

    var people =  await People.find({"petitionContactHistory.orgID": org._id})
    var count = 0

    for(var i = 0; i < people.length; i++){        
        for(var j = 0; j < people[i].petitionContactHistory.length; j++){
            if(people[i].petitionContactHistory[j].orgID === org._id){
                for(var k = 0; k < people[i].petitionContactHistory[j].idHistory.length; k++){
                    if(latestReport.reportDate < people[i].petitionContactHistory[j].idHistory[k].date){
                        var report = new Report({campaignID: people[i].petitionContactHistory[j].campaignID,
                                                 orgID: people[i].petitionContactHistory[j].orgID,
                                                 userID: people[i].petitionContactHistory[j].idHistory[k].idBy,
                                                 idResponses: people[i].petitionContactHistory[j].idHistory[k].idResponses,
                                                 personID: people[i]._id,
                                                 idDate: people[i].petitionContactHistory[j].idHistory[k].date,
                                                 activityType: "PETITION",
                                                 location: people[i].address.location,
                                                 activityID: people[i].petitionContactHistory[j].activityID,
                                                }
                                                );
                        report.save()
                        count = count + 1
                        console.log('Petition',org.name, ": ",count)
                    }
                }                
            }
        }
    }

    return {orgName: org.name}
}

const getReport = async(campaign) =>{
    var campaign = await Campaign.findOne({campaignID: campaign.campaignID})
    var knocksPerActivity = []

    for(var i = 0; i < campaign.canvassActivities.length; i++){
        var histories = await People.find({"canvassContactHistory.activityID": campaign.canvassActivities[i]._id}).count()
        knocksPerActivity.push({knocks: histories, activity: campaign.canvassActivities[i].activityMetaData.name})
    }

    var orgIDs = campaign.orgIDs
    var orgs = await Organization.find({_id: {$in: orgIDs}})

    var knocksPerOrg = []

    for(var i = 0; i < orgs.length; i++){
        var histories = await People.find({"canvassContactHistory.orgID": orgs[i]._id}).count()
        var totalRefused = await People.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.refused": true }).count()
        var totalNonResponse = await People.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.nonResponse": true ,  "canvassContactHistory.refused": false}).count()
        var totalCompleted = await People.find({"canvassContactHistory.orgID": orgs[i]._id, "canvassContactHistory.identified": true }).count()
        knocksPerOrg.push({knocks: histories, org: orgs[i].name, completed: totalCompleted, refuses: totalRefused, nonResponses: totalNonResponse})
    }

    //var totalCanvassEntries = await People.find({"canvassContactHistory": { $exists: true, $not: {$size: 0}}}).count()

    var incompleteAddresses = await People.find({"canvassContactHistory": { $exists: true, $not: {$size: 0}}, "address.streetNum": null})
    //var noNamesGroup = await People.find({"canvassContactHistory": { $exists: true, $not: {$size: 0}}, "firstName": null})

    var noNamesGroup = await People.aggregate([{$match: {"canvassContactHistory": { $exists: true, $not: {$size: 0}}, "firstName": null }},
        {$group: {_id: "$address.location",
                houseHoldSize: { "$sum": 1 },
                person: {"$push": {address: "$address", canvassContactHistory: "$canvassContactHistory"} },
            }},
        {$match: {"houseHoldSize": {"$gt": 1}}},
    ])

    var duplicateNames = await People.aggregate([{$match: {"canvassContactHistory": { $exists: true, $not: {$size: 0}} }},])

    //return {totalCanvassHistories: totalCanvassEntries, knocksPerOrg: knocksPerOrg, knocksPerActivity: knocksPerActivity, anomolies: anomolies}
    //return {incompleteAddresses: incompleteAddresses, noNames: noNamesGroup}
    return {incompleteAddresses: incompleteAddresses, noNamesGroup: noNamesGroup}
}

const getCanvassSummaryReport = async(details) =>{
    var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, activityType: 'CANVASS'})

    var knocksPerOrg = []

    var identifiedCount  = 0;
    var refusedCount = 0;
    var nonResponseCount = 0;
    var impressionsCount = 0;
    var impressions = 0;

    for(var i = 0; i < reports.length; i++){
        if (reports[i].idResponses[0]) {
            if (reports[i].idResponses[0].idType === 'POSITIVE' ||
                reports[i].idResponses[0].idType === 'NEUTRAL' ||
                reports[i].idResponses[0].idType === 'NEGATIVE'
            ) {
                identifiedCount = identifiedCount + 1
            }
            if (reports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (reports[i].idResponses[0].responses.toLowerCase().includes('lit') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('imp') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('con') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('spanish') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('und')) {
                impressions = impressions + 1
            }
            if (reports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
    }

    impressionsCount = impressions + parseInt(identifiedCount)
    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await knocksPerOrg.push({org: details.orgName, identified: identifiedCount, refuses: refusedCount, impressions: impressionsCount, nonResponses: nonResponseCount, total: total})
    return knocksPerOrg
}

const getPetitionSummaryReport = async(details) =>{
    var petitionCount = await Report.find({campaignID: details.campaignID, orgID: details.orgID, activityType: 'PETITION'}).count()

    var knocksPerOrg = []
    await knocksPerOrg.push({org: details.orgName, identified: petitionCount})
    return knocksPerOrg
}

const getOverallSummaryReport = async(details) =>{
    var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, $or:[{activityType:'CANVASS'}, {activityType:'PETITION'}]})

    var knocksPerOrg = []

    var identifiedCount  = 0;
    var refusedCount = 0;
    var nonResponseCount = 0;

    for(var i = 0; i < reports.length; i++){
        if (reports[i].idResponses[0]) {
            if (reports[i].idResponses[0].idType === 'POSITIVE' ||
                reports[i].idResponses[0].idType === 'NEUTRAL' ||
                reports[i].idResponses[0].idType === 'NEGATIVE'
            ) {
                identifiedCount = identifiedCount + 1
            }
            if (reports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (reports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
    }

    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await knocksPerOrg.push({org: details.orgName, identified: identifiedCount, refuses: refusedCount, nonResponses: nonResponseCount, total: total})
    return knocksPerOrg
}

const getEventsSummaryReport = async(details) =>{
    var campaign = await Campaign.findOne({campaignID: details.campaignID})

    var eventActivities = campaign.eventActivities

    var events = {};
    for (var i = 0; i < eventActivities.length; i++) {
        var eventName = eventActivities[i].orgCreatorName;
        if (!events[eventName]) {
            events[eventName] = [];
        }
        events[eventName].push(eventActivities[i]);
    }

    var eventsPerOrg = [];
    for (var event in events) {

        var numOfEvents = await events[event].length

        var total_number_of_impressions = 0;
        var total_number_of_paid_staffvolun = 0;
        var language = {}
        for (var langCount = 0; langCount < languages.length; langCount++) {
            language[languages[langCount]] = 0;
        }
        var htcGroup = {}
        for (var htcCount = 0; htcCount < htcGroups.length; htcCount++) {
            htcGroup[htcGroups[htcCount]] = 0;
        }
        var total_htc_of_impressions = 0;
        var funding_volunteer_hours = 0;

        for (var ii = 0; ii < numOfEvents; ii++) {
            if(events[event][ii].swordForm) {
                total_number_of_impressions += parseInt(events[event][ii].swordForm.total_number_of_impressions);
                total_number_of_paid_staffvolun += parseInt(events[event][ii].swordForm.total_number_of_paid_staffvolun);
                for (var lang in language) {
                    if (events[event][ii].swordForm["lang_" + lang]) {
                        language[lang] += parseInt(events[event][ii].swordForm["lang_" + lang])
                    }
                }
                for (var htc in htcGroup) {
                    if (events[event][ii].swordForm[htc]) {
                        htcGroup[htc] += parseInt(events[event][ii].swordForm[htc])
                    }
                }
                total_htc_of_impressions += parseInt(events[event][ii].swordForm.total_htc_of_impressions);
                funding_volunteer_hours += parseInt(events[event][ii].swordForm.funding_volunteer_hours);
            }
        }

        await eventsPerOrg.push({
            org: event,
            numOfEvents: numOfEvents,
            total_number_of_impressions: total_number_of_impressions,
            total_number_of_paid_staffvolun: total_number_of_paid_staffvolun,
            language,
            htcGroup,
            total_htc_of_impressions: total_htc_of_impressions,
            funding_volunteer_hours: funding_volunteer_hours
        })
    }

    return eventsPerOrg
}

const getActivitiesSummaryReport = async(details) =>{
    canvassActivities = details.activities

    var knocks = []

    for(var i = 0; i < canvassActivities.length; i++){
        var totalIdentified = await People.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": true }).count()
        var totalRefused = await People.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": true }).count()
        var totalNonResponse = await People.find({"canvassContactHistory.activityID": canvassActivities[i]._id, "canvassContactHistory.identified": false, "canvassContactHistory.refused": false, "canvassContactHistory.nonResponse": true}).count()

        var impressions = [];
        var impressionsCount = 0;

        for(var b = 0; b < canvassActivities[i].activityMetaData.nonResponses.length; b++){
            if(canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().startsWith('lit') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes(' lit') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('lit ') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('/lit') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('lit/') ||

                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().startsWith('imp') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes(' imp') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('imp ') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('/imp') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('imp/') ||

                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().startsWith('con') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes(' con') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('con ') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('/con') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('con/') ||

                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('spanish') ||

                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().startsWith('und') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes(' und') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('und ') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('/und') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('und/')
            ) {
                impressions.push(canvassActivities[i].activityMetaData.nonResponses[b])
            }
        }
        var impressionsCount = impressions.length;

        var total = await parseInt(totalIdentified) + parseInt(totalRefused) + parseInt(totalNonResponse)
        await knocks.push({identified: totalIdentified, impressions: impressionsCount, total: total})
    }

    return {knocks: knocks}
}

module.exports = {updateReport,
                  getReport,
                  getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport,
                  getEventsSummaryReport,
                  getActivitiesSummaryReport}
