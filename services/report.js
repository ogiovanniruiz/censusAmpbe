var Report = require ('../models/reports/report')
var People = require ('../models/people/person')

const updateReport = async(org) => {
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

module.exports = {updateReport}