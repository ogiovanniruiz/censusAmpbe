var Report = require ('../models/reports/report')
var People = require ('../models/people/person')

const updateReport = async(org) => {
    await Report.deleteMany({orgID: org._id})
    console.log(org.name + "Reset")

    var people =  await People.find({"canvassContactHistory.orgID": org._id})
    var count = 0

    for(var i = 0; i < people.length; i++){        
        for(var j = 0; j < people[i].canvassContactHistory.length; j++){
            if(people[i].canvassContactHistory[j].orgID === org._id){
                for(var k = 0; k < people[i].canvassContactHistory[j].idHistory.length; k++){
                    var report = new Report({campaignID: people[i].canvassContactHistory[j].campaignID,
                                             orgID: people[i].canvassContactHistory[j].orgID,
                                             userID: people[i].canvassContactHistory[j].idHistory[k].idBy,
                                             idResponses: people[i].canvassContactHistory[j].idHistory[k].idResponses,
                                             personID: people[i]._id,
                                             activityType: "CANVASS",
                                             location: people[i].canvassContactHistory[j].idHistory[k].locationIdentified,
                                             activityID: people[i].canvassContactHistory[j].activityID,
                                            }
                                            );
                    report.save()
                    count = count + 1
                    console.log(count)
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
                    var report = new Report({campaignID: people[i].petitionContactHistory[j].campaignID,
                                             orgID: people[i].petitionContactHistory[j].orgID,
                                             userID: people[i].petitionContactHistory[j].idHistory[k].idBy,
                                             idResponses: people[i].petitionContactHistory[j].idHistory[k].idResponses,
                                             personID: people[i]._id,
                                             activityType: "PETITION",
                                             location: people[i].petitionContactHistory[j].idHistory[k].locationIdentified,
                                             activityID: people[i].petitionContactHistory[j].activityID,
                                            }
                                            );
                    report.save()
                    count = count + 1
                    console.log(count)
                }                
            }
        
        }
    }
}

const resetReport = async(details)=>{



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





module.exports = {updateReport,
                  resetReport,
                  getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport}
