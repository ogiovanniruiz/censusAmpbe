var Report = require ('../models/reports/report');
var People = require ('../models/people/person');
var Organization = require('../models/organizations/organization');
var CensusTract = require('../models/censustracts/censustract');
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

    const agg = [
        {
            '$match': {
                '_id': {
                    '$exists': true
                }
            }
        }
    ];
    var Census = await CensusTract.aggregate(agg);

    for(var i = 0; i < Census.length; i++){
        const agg2 = [
            {
                '$match': {
                    'address.location.coordinates': { $elemMatch: { $exists: true } },
                    'address.blockgroupID': { $exists: false },
                    'address.location': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'Polygon',
                                'coordinates': Census[i].geometry.coordinates[0]
                            }
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'records': {
                        '$push': '$_id'
                    }
                }
            }
        ];
        var saveBlockgroupID = await People.aggregate(agg2);

        if(saveBlockgroupID.length) {
            var updated = await People.update(
                { _id: {$in: saveBlockgroupID[0].records} },
                { 'address.blockgroupID': Census[i].properties.geoid },
                { upsert: false, multi: true,}
            );
            console.log(updated)
        }
    }

    /*var people =  await People.find({"canvassContactHistory.orgID": org._id})
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

    return {orgName: org.name}*/
}

const getCanvassSummaryReport = async(details) =>{

    const agg = [
        {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$facet': {
                'uniquePeople': [
                    {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'records': [
                    {
                        '$project': {
                            'canvassContactHistory': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': {
                'path': '$records',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$records.canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'records.canvassContactHistory.campaignID': details.campaignID,
                'records.canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$records.canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': {
                                '$in': [
                                    'POSITIVE', 'NEUTRAL', 'NEGATIVE'
                                ]
                            }
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'refuses': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'impressions': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.responses': {
                                '$regex': '(?i)lit|imp|con|spanish|und'
                            }
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'nonResponses': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': 'NONRESPONSE'
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'uniquePeople': [
                    {
                        '$group': {
                            '_id': null,
                            'people': {
                                '$first': {
                                    '$arrayElemAt': [
                                        '$uniquePeople', 0
                                    ]
                                }
                            }
                        }
                    }
                ],
                'total': [
                    {
                        '$group': {
                            '_id': null
                        }
                    }
                ]
            }
        }, {
            '$project': {
                'identified': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, 0
                    ]
                },
                'refuses': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$refuses.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$refuses.num', 0
                            ]
                        }, 0
                    ]
                },
                'impressions': {
                    '$add': [
                        {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$impressions.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$impressions.num', 0
                                    ]
                                }, 0
                            ]
                        }
                    ]
                },
                'nonResponses': {
                    '$cond': [
                        {
                            '$size': '$nonResponses'
                        }, {
                            '$arrayElemAt': [
                                '$nonResponses.num', 0
                            ]
                        }, 0
                    ]
                },
                'uniquePeople': {
                    '$cond': [
                        {
                            '$size': '$uniquePeople'
                        }, {
                            '$arrayElemAt': [
                                '$uniquePeople.people.num', 0
                            ]
                        }, 0
                    ]
                },
                'total': {
                    '$add': [
                        {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, 0
                            ]
                        }
                    ]
                }
            }
        }
    ];

    var knocksPerOrg = []

    var reports = await People.aggregate(agg)

    await knocksPerOrg.push({org: details.orgName, identified: reports[0].identified, refuses: reports[0].refuses, impressions: reports[0].impressions, nonResponses: reports[0].nonResponses, uniquePeople: reports[0].uniquePeople, total: reports[0].total})
    return knocksPerOrg

    /*var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, activityType: 'CANVASS'})

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
    return knocksPerOrg*/
}

const getPetitionSummaryReport = async(details) =>{

    const agg = [
        {
            '$unwind': {
                'path': '$petitionContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'petitionContactHistory.campaignID': details.campaignID,
                'petitionContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$petitionContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ]
            }
        }, {
            '$project': {
                'identified': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, 0
                    ]
                }
            }
        }
    ];

    var petitionsPerOrg = []

    var reports = await People.aggregate(agg)

    await petitionsPerOrg.push({org: details.orgName, identified: reports[0].identified})
    return petitionsPerOrg

    /*var petitionCount = await Report.find({campaignID: details.campaignID, orgID: details.orgID, activityType: 'PETITION'}).count()

    var petitionsPerOrg = []
    await petitionsPerOrg.push({org: details.orgName, identified: petitionCount})
    return petitionsPerOrg*/
}

const getOverallSummaryReport = async(details) =>{

    var recordsPerOrg = []

    const agg = [
        {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$facet': {
                'uniquePeople': [
                    {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'records': [
                    {
                        '$project': {
                            'canvassContactHistory': 1
                        }
                    }
                ]
            }
        }, {
            '$unwind': {
                'path': '$records',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$records.canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'records.canvassContactHistory.campaignID': details.campaignID,
                'records.canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$records.canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': {
                                '$in': [
                                    'POSITIVE', 'NEUTRAL', 'NEGATIVE'
                                ]
                            }
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'refuses': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'impressions': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.responses': {
                                '$regex': '(?i)lit|imp|con|spanish|und'
                            }
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'nonResponses': [
                    {
                        '$match': {
                            'records.canvassContactHistory.idHistory.idResponses.0.idType': 'NONRESPONSE'
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ],
                'uniquePeople': [
                    {
                        '$group': {
                            '_id': null,
                            'people': {
                                '$first': {
                                    '$arrayElemAt': [
                                        '$uniquePeople', 0
                                    ]
                                }
                            }
                        }
                    }
                ],
                'total': [
                    {
                        '$group': {
                            '_id': null
                        }
                    }
                ]
            }
        }, {
            '$project': {
                'identified': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, 0
                    ]
                },
                'refuses': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$refuses.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$refuses.num', 0
                            ]
                        }, 0
                    ]
                },
                'impressions': {
                    '$add': [
                        {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$impressions.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$impressions.num', 0
                                    ]
                                }, 0
                            ]
                        }
                    ]
                },
                'nonResponses': {
                    '$cond': [
                        {
                            '$size': '$nonResponses'
                        }, {
                            '$arrayElemAt': [
                                '$nonResponses.num', 0
                            ]
                        }, 0
                    ]
                },
                'uniquePeople': {
                    '$cond': [
                        {
                            '$size': '$uniquePeople'
                        }, {
                            '$arrayElemAt': [
                                '$uniquePeople.people.num', 0
                            ]
                        }, 0
                    ]
                },
                'total': {
                    '$add': [
                        {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, 0
                            ]
                        }, {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, 0
                            ]
                        }
                    ]
                }
            }
        }
    ];
    var reports = await People.aggregate(agg)

    const agg2 = [
        {
            '$unwind': {
                'path': '$petitionContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'petitionContactHistory.campaignID': details.campaignID,
                'petitionContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$petitionContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$group': {
                            '_id': null,
                            'num': {
                                '$sum': 1
                            }
                        }
                    }
                ]
            }
        }, {
            '$project': {
                'identified': {
                    '$cond': [
                        {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, {
                            '$arrayElemAt': [
                                '$identified.num', 0
                            ]
                        }, 0
                    ]
                }
            }
        }
    ];
    var reports2 = await People.aggregate(agg2)

    var identifiedTotal = await parseInt(reports[0].identified) + parseInt(reports2[0].identified)

    await recordsPerOrg.push({org: details.orgName, identified: identifiedTotal, refuses: reports[0].refuses, impressions: reports[0].impressions, nonResponses: reports[0].nonResponses, uniquePeople: reports[0].uniquePeople, total: reports[0].total})
    return recordsPerOrg

    /*var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, $or:[{activityType:'CANVASS'}, {activityType:'PETITION'}]})

    var recordsPerOrg = []

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
            if (reports[i].idResponses[0].responses.toLowerCase().includes('lit') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('imp') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('con') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('spanish') ||
                reports[i].idResponses[0].responses.toLowerCase().includes('und')) {
                impressions = impressions + 1
            }
            if (reports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (reports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
    }

    impressionsCount = impressions + parseInt(identifiedCount)
    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await recordsPerOrg.push({org: details.orgName, identified: identifiedCount, refuses: refusedCount, impressions: impressionsCount, nonResponses: nonResponseCount, total: total})
    return recordsPerOrg*/
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
            if (canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('lit') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('imp') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('con') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('spanish') ||
                canvassActivities[i].activityMetaData.nonResponses[b].toLowerCase().includes('und')) {
                impressions.push(canvassActivities[i].activityMetaData.nonResponses[b])
            }
        }
        var impressionsCount = impressions.length;

        var total = await parseInt(totalIdentified) + parseInt(totalRefused) + parseInt(totalNonResponse)
        await knocks.push({identified: totalIdentified, impressions: impressionsCount, total: total})
    }

    return {knocks: knocks}
}

const getBlockGroupCanvassSummaryReport = async(details) =>{
    var blockGroupRecord = []

    const agg = [
        {
            '$unwind': {
                'path': '$canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': null,
                'records': {
                    '$push': '$address.location.coordinates'
                }
            }
        }
    ];
    var reportsCords = await People.aggregate(agg);

    if (reportsCords.length) {
        const agg2 = [
            {
                '$match': {
                    'geometry': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'MultiPoint',
                                'coordinates': reportsCords[0].records
                            }
                        }
                    }
                }
            }
        ];
        var reportsCords2 = await CensusTract.aggregate(agg2);

        for(var i = 0; i < reportsCords2.length; i++){
            const agg3 = [
                {
                    '$unwind': {
                        'path': '$canvassContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'canvassContactHistory.campaignID': details.campaignID,
                        'canvassContactHistory.orgID': details.orgID
                    }
                }, {
                    '$unwind': {
                        'path': '$canvassContactHistory.idHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'address.location': {
                            '$geoIntersects': {
                                '$geometry': {
                                    'type': 'Polygon',
                                    'coordinates': reportsCords2[i].geometry.coordinates[0]
                                }
                            }
                        }
                    }
                }, {
                    '$facet': {
                        'identified': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': {
                                        '$in': [
                                            'POSITIVE', 'NEUTRAL', 'NEGATIVE'
                                        ]
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'refuses': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'impressions': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.responses': {
                                        '$regex': '(?i)lit|imp|con|spanish|und'
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'nonResponses': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': 'NONRESPONSE'
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'total': [
                            {
                                '$group': {
                                    '_id': null
                                }
                            }
                        ]
                    }
                }, {
                    '$project': {
                        'identified': {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'refuses': {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'impressions': {
                            '$add': [
                                {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$impressions.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$impressions.num', 0
                                            ]
                                        }, 0
                                    ]
                                }
                            ]
                        },
                        'nonResponses': {
                            '$cond': [
                                {
                                    '$size': '$nonResponses'
                                }, {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'total': {
                            '$add': [
                                {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$refuses.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$refuses.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$nonResponses.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$nonResponses.num', 0
                                            ]
                                        }, 0
                                    ]
                                }
                            ]
                        }
                    }
                }
            ];
            var reportsCords3 = await People.aggregate(agg3);

            await blockGroupRecord.push({blockGroup: reportsCords2[i].properties.geoid, identified: reportsCords3[0].identified, refuses: reportsCords3[0].refuses, impressions: reportsCords3[0].impressions, nonResponses: reportsCords3[0].nonResponses, total: reportsCords3[0].total})
        }
        return blockGroupRecord;
    }
    return blockGroupRecord;

    /*******************/

    /*var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, activityType: 'CANVASS'})

    var blockGroupCoordinates = []

    for(var i = 0; i < reports.length; i++){
        if (reports[i].location.coordinates.length) {
            await blockGroupCoordinates.push(reports[i].location.coordinates)
        }
    }

    if(blockGroupCoordinates.length) {
        var blockGroups = await CensusTract.find({
            "geometry": {
                $geoIntersects: {
                    $geometry: {
                        type: "MultiPoint",
                        coordinates: blockGroupCoordinates
                    }
                }
            }
        });
    }

    return blockGroups;*/
}

const getBlockGroupCanvassSummaryReport2 = async(details) =>{
    var blockGroupRecord = []
    var blockGroupReports = []

    var blockGroupReports = await Report.find({
        campaignID: details.campaignID,
        orgID: details.orgID,
        activityType: 'CANVASS',
        "location": {
            $geoIntersects: {
                $geometry: {
                    type: "Polygon",
                    coordinates: details.blockGroup.geometry.coordinates[0]
                }
            }
        }
    });

    var identifiedCount  = 0;
    var refusedCount = 0;
    var nonResponseCount = 0;
    var impressionsCount = 0;
    var impressions = 0;

    for(var i = 0; i < blockGroupReports.length; i++){
        if (blockGroupReports[i].idResponses[0]) {
            if (blockGroupReports[i].idResponses[0].idType === 'POSITIVE' ||
                blockGroupReports[i].idResponses[0].idType === 'NEUTRAL' ||
                blockGroupReports[i].idResponses[0].idType === 'NEGATIVE'
            ) {
                identifiedCount = identifiedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('lit') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('imp') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('con') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('spanish') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('und')) {
                impressions = impressions + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
        if(i === 0){
            console.log(details.blockGroup.properties.geoid)
            console.log(blockGroupReports[i]._id)
            console.log(blockGroupReports[i].location.coordinates)
        }
    }

    impressionsCount = impressions + parseInt(identifiedCount)
    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await blockGroupRecord.push({blockGroup: details.blockGroup.properties.geoid, identified: identifiedCount, refuses: refusedCount, impressions: impressionsCount, nonResponses: nonResponseCount, total: total})

    return blockGroupRecord;
}

const getBlockGroupOrgSummaryReport = async(details) =>{
    var blockGroupRecord = []

    const agg = [
        {
            '$unwind': {
                'path': '$canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': null,
                'records': {
                    '$push': '$address.location.coordinates'
                }
            }
        }
    ];
    var reportsCords = await People.aggregate(agg);

    if (reportsCords.length) {
        const agg2 = [
            {
                '$match': {
                    'geometry': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'MultiPoint',
                                'coordinates': reportsCords[0].records
                            }
                        }
                    }
                }
            }
        ];
        var reportsCords2 = await CensusTract.aggregate(agg2);

        const agg3 = [
            {
                '$unwind': {
                    'path': '$canvassContactHistory',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$match': {
                    'canvassContactHistory.campaignID': details.campaignID,
                    'canvassContactHistory.orgID': details.orgID
                }
            }, {
                '$unwind': {
                    'path': '$canvassContactHistory.idHistory',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$match': {
                    'address.location': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'Polygon',
                                'coordinates': reportsCords2[0].geometry.coordinates[0]
                            }
                        }
                    }
                }
            }, {
                '$facet': {
                    'identified': [
                        {
                            '$match': {
                                'canvassContactHistory.idHistory.idResponses.0.idType': {
                                    '$in': [
                                        'POSITIVE', 'NEUTRAL', 'NEGATIVE'
                                    ]
                                }
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'num': {
                                    '$sum': 1
                                }
                            }
                        }
                    ],
                    'refuses': [
                        {
                            '$match': {
                                'canvassContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'num': {
                                    '$sum': 1
                                }
                            }
                        }
                    ],
                    'impressions': [
                        {
                            '$match': {
                                'canvassContactHistory.idHistory.idResponses.0.responses': {
                                    '$regex': '(?i)lit|imp|con|spanish|und'
                                }
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'num': {
                                    '$sum': 1
                                }
                            }
                        }
                    ],
                    'nonResponses': [
                        {
                            '$match': {
                                'canvassContactHistory.idHistory.idResponses.0.idType': 'NONRESPONSE'
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'num': {
                                    '$sum': 1
                                }
                            }
                        }
                    ],
                    'total': [
                        {
                            '$group': {
                                '_id': null
                            }
                        }
                    ]
                }
            }, {
                '$project': {
                    'identified': {
                        '$cond': [
                            {
                                '$arrayElemAt': [
                                    '$identified.num', 0
                                ]
                            }, {
                                '$arrayElemAt': [
                                    '$identified.num', 0
                                ]
                            }, 0
                        ]
                    },
                    'refuses': {
                        '$cond': [
                            {
                                '$arrayElemAt': [
                                    '$refuses.num', 0
                                ]
                            }, {
                                '$arrayElemAt': [
                                    '$refuses.num', 0
                                ]
                            }, 0
                        ]
                    },
                    'impressions': {
                        '$add': [
                            {
                                '$cond': [
                                    {
                                        '$arrayElemAt': [
                                            '$identified.num', 0
                                        ]
                                    }, {
                                        '$arrayElemAt': [
                                            '$identified.num', 0
                                        ]
                                    }, 0
                                ]
                            }, {
                                '$cond': [
                                    {
                                        '$arrayElemAt': [
                                            '$impressions.num', 0
                                        ]
                                    }, {
                                        '$arrayElemAt': [
                                            '$impressions.num', 0
                                        ]
                                    }, 0
                                ]
                            }
                        ]
                    },
                    'nonResponses': {
                        '$cond': [
                            {
                                '$size': '$nonResponses'
                            }, {
                                '$arrayElemAt': [
                                    '$nonResponses.num', 0
                                ]
                            }, 0
                        ]
                    },
                    'total': {
                        '$add': [
                            {
                                '$cond': [
                                    {
                                        '$arrayElemAt': [
                                            '$identified.num', 0
                                        ]
                                    }, {
                                        '$arrayElemAt': [
                                            '$identified.num', 0
                                        ]
                                    }, 0
                                ]
                            }, {
                                '$cond': [
                                    {
                                        '$arrayElemAt': [
                                            '$refuses.num', 0
                                        ]
                                    }, {
                                        '$arrayElemAt': [
                                            '$refuses.num', 0
                                        ]
                                    }, 0
                                ]
                            }, {
                                '$cond': [
                                    {
                                        '$arrayElemAt': [
                                            '$nonResponses.num', 0
                                        ]
                                    }, {
                                        '$arrayElemAt': [
                                            '$nonResponses.num', 0
                                        ]
                                    }, 0
                                ]
                            }
                        ]
                    }
                }
            }
        ];
        var reportsCords3 = await People.aggregate(agg3);

        await blockGroupRecord.push({blockGroup: reportsCords2[0].properties.geoid, identified: reportsCords3[0].identified, refuses: reportsCords3[0].refuses, impressions: reportsCords3[0].impressions, nonResponses: reportsCords3[0].nonResponses, total: reportsCords3[0].total})
        return blockGroupRecord;
    }
    return blockGroupRecord;

    /*******************/

    /*var blockGroupCoordinates = []

    for(var i = 0; i < reports.length; i++){
        if (reports[i].location.coordinates.length) {
            await blockGroupCoordinates.push(reports[i].location.coordinates)
        }
    }

    if(blockGroupCoordinates.length) {
        var blockGroups = await CensusTract.find({
            "geometry": {
                $geoIntersects: {
                    $geometry: {
                        type: "MultiPoint",
                        coordinates: blockGroupCoordinates
                    }
                }
            }
        });
    }

    return blockGroups;*/
}

const getBlockGroupOrgSummaryReport2 = async(details) =>{
    var blockGroupRecord = []
    var blockGroupReports = []

    var blockGroupReports = await Report.find({
        campaignID: details.campaignID,
        orgID: details.orgID,
        activityType: 'CANVASS',
        "location": {
            $geoIntersects: {
                $geometry: {
                    type: "Polygon",
                    coordinates: details.blockGroup.geometry.coordinates[0]
                }
            }
        }
    });

    var identifiedCount  = 0;
    var refusedCount = 0;
    var nonResponseCount = 0;
    var impressionsCount = 0;
    var impressions = 0;

    for(var i = 0; i < blockGroupReports.length; i++){
        if (blockGroupReports[i].idResponses[0]) {
            if (blockGroupReports[i].idResponses[0].idType === 'POSITIVE' ||
                blockGroupReports[i].idResponses[0].idType === 'NEUTRAL' ||
                blockGroupReports[i].idResponses[0].idType === 'NEGATIVE'
            ) {
                identifiedCount = identifiedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('lit') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('imp') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('con') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('spanish') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('und')) {
                impressions = impressions + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
    }

    impressionsCount = impressions + parseInt(identifiedCount)
    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await blockGroupRecord.push({blockGroup: details.blockGroup.properties.geoid, identified: identifiedCount, refuses: refusedCount, impressions: impressionsCount, nonResponses: nonResponseCount, total: total})

    return blockGroupRecord;
}

const getBlockGroupOverallSummaryReport = async(details) =>{
    var blockGroupRecord = []

    const agg = [
        {
            '$unwind': {
                'path': '$canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': null,
                'records': {
                    '$push': '$address.location.coordinates'
                }
            }
        }
    ];
    var reportsCords = await People.aggregate(agg);

    if (reportsCords.length) {
        const agg2 = [
            {
                '$match': {
                    'geometry': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'MultiPoint',
                                'coordinates': reportsCords[0].records
                            }
                        }
                    }
                }
            }
        ];
        var reportsCords2 = await CensusTract.aggregate(agg2);

        for(var i = 0; i < reportsCords2.length; i++){
            const agg3 = [
                {
                    '$unwind': {
                        'path': '$canvassContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'canvassContactHistory.campaignID': details.campaignID,
                        'canvassContactHistory.orgID': details.orgID
                    }
                }, {
                    '$unwind': {
                        'path': '$canvassContactHistory.idHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'address.location': {
                            '$geoIntersects': {
                                '$geometry': {
                                    'type': 'Polygon',
                                    'coordinates': reportsCords2[i].geometry.coordinates[0]
                                }
                            }
                        }
                    }
                }, {
                    '$facet': {
                        'identified': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': {
                                        '$in': [
                                            'POSITIVE', 'NEUTRAL', 'NEGATIVE'
                                        ]
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'refuses': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'impressions': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.responses': {
                                        '$regex': '(?i)lit|imp|con|spanish|und'
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'nonResponses': [
                            {
                                '$match': {
                                    'canvassContactHistory.idHistory.idResponses.0.idType': 'NONRESPONSE'
                                }
                            }, {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ],
                        'total': [
                            {
                                '$group': {
                                    '_id': null
                                }
                            }
                        ]
                    }
                }, {
                    '$project': {
                        'identified': {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'refuses': {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$refuses.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'impressions': {
                            '$add': [
                                {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$impressions.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$impressions.num', 0
                                            ]
                                        }, 0
                                    ]
                                }
                            ]
                        },
                        'nonResponses': {
                            '$cond': [
                                {
                                    '$size': '$nonResponses'
                                }, {
                                    '$arrayElemAt': [
                                        '$nonResponses.num', 0
                                    ]
                                }, 0
                            ]
                        },
                        'total': {
                            '$add': [
                                {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$identified.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$refuses.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$refuses.num', 0
                                            ]
                                        }, 0
                                    ]
                                }, {
                                    '$cond': [
                                        {
                                            '$arrayElemAt': [
                                                '$nonResponses.num', 0
                                            ]
                                        }, {
                                            '$arrayElemAt': [
                                                '$nonResponses.num', 0
                                            ]
                                        }, 0
                                    ]
                                }
                            ]
                        }
                    }
                }
            ];
            var reportsCords3 = await People.aggregate(agg3);

            await blockGroupRecord.push({blockGroup: reportsCords2[i].properties.geoid, identified: reportsCords3[0].identified, refuses: reportsCords3[0].refuses, impressions: reportsCords3[0].impressions, nonResponses: reportsCords3[0].nonResponses, total: reportsCords3[0].total})
        }
    }

    var blockGroupRecordPet = []

    const aggPet = [
        {
            '$unwind': {
                'path': '$petitionContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'petitionContactHistory.campaignID': details.campaignID,
                'petitionContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$petitionContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': null,
                'records': {
                    '$push': '$address.location.coordinates'
                }
            }
        }, {
            '$project': {
                'records': {
                    '$filter': {
                        'input': '$records',
                        'as': 'item',
                        'cond': {
                            '$arrayElemAt': [
                                '$$item', 0
                            ]
                        }
                    }
                }
            }
        }
    ];
    var reportsCordsPet = await People.aggregate(aggPet);

    if (reportsCordsPet.length) {
        const aggPet2 = [
            {
                '$match': {
                    'geometry': {
                        '$geoIntersects': {
                            '$geometry': {
                                'type': 'MultiPoint',
                                'coordinates': reportsCordsPet[0].records
                            }
                        }
                    }
                }
            }
        ];
        var reportsCordsPet2 = await CensusTract.aggregate(aggPet2);

        for(var j = 0; j < reportsCordsPet2.length; j++){
            const aggPet3 = [
                {
                    '$unwind': {
                        'path': '$petitionContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'petitionContactHistory.campaignID': details.campaignID,
                        'petitionContactHistory.orgID': details.orgID
                    }
                }, {
                    '$unwind': {
                        'path': '$petitionContactHistory.idHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'address.location': {
                            '$geoIntersects': {
                                '$geometry': {
                                    'type': 'Polygon',
                                    'coordinates': reportsCordsPet2[j].geometry.coordinates[0]
                                }
                            }
                        }
                    }
                }, {
                    '$facet': {
                        'identified': [
                            {
                                '$group': {
                                    '_id': null,
                                    'num': {
                                        '$sum': 1
                                    }
                                }
                            }
                        ]
                    }
                }, {
                    '$project': {
                        'identified': {
                            '$cond': [
                                {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, {
                                    '$arrayElemAt': [
                                        '$identified.num', 0
                                    ]
                                }, 0
                            ]
                        }
                    }
                }
            ];
            var reportsCordsPet3 = await People.aggregate(aggPet3);

            await blockGroupRecordPet.push({blockGroup: reportsCordsPet2[j].properties.geoid, identified: reportsCordsPet3[0].identified})
        }
    }

    if(blockGroupRecord.length && blockGroupRecordPet.length) {
        for (let k in blockGroupRecord) {
            for (let l in blockGroupRecordPet) {
                if (blockGroupRecord[k].blockGroup === blockGroupRecordPet[l].blockGroup) {
                    blockGroupRecord[k].identified += await blockGroupRecordPet[l].identified;
                    break
                }
            }
        }
    }

    return blockGroupRecord;

    /*******************/

    /*var reports = await Report.find({campaignID: details.campaignID, orgID: details.orgID, $or:[{activityType:'CANVASS'}, {activityType:'PETITION'}]})

    var blockGroupCoordinates = []

    for(var i = 0; i < reports.length; i++){
        if (reports[i].location.coordinates.length) {
            await blockGroupCoordinates.push(reports[i].location.coordinates)
        }
    }

    if(blockGroupCoordinates.length) {
        var blockGroups = await CensusTract.find({
            "geometry": {
                $geoIntersects: {
                    $geometry: {
                        type: "MultiPoint",
                        coordinates: blockGroupCoordinates
                    }
                }
            }
        });
    }

    return blockGroups;*/
}

const getBlockGroupOverallSummaryReport2 = async(details) =>{
    var blockGroupRecord = []
    var blockGroupReports = []

    var blockGroupReports = await Report.find({
        campaignID: details.campaignID,
        orgID: details.orgID,
        $or:[{activityType:'CANVASS'}, {activityType:'PETITION'}],
        "location": {
            $geoIntersects: {
                $geometry: {
                    type: "Polygon",
                    coordinates: details.blockGroup.geometry.coordinates[0]
                }
            }
        }
    });

    var identifiedCount  = 0;
    var refusedCount = 0;
    var nonResponseCount = 0;
    var impressionsCount = 0;
    var impressions = 0;

    for(var i = 0; i < blockGroupReports.length; i++){
        if (blockGroupReports[i].idResponses[0]) {
            if (blockGroupReports[i].idResponses[0].idType === 'POSITIVE' ||
                blockGroupReports[i].idResponses[0].idType === 'NEUTRAL' ||
                blockGroupReports[i].idResponses[0].idType === 'NEGATIVE'
            ) {
                identifiedCount = identifiedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'REFUSED') {
                refusedCount = refusedCount + 1
            }
            if (blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('lit') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('imp') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('con') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('spanish') ||
                blockGroupReports[i].idResponses[0].responses.toLowerCase().includes('und')) {
                impressions = impressions + 1
            }
            if (blockGroupReports[i].idResponses[0].idType === 'NONRESPONSE') {
                nonResponseCount = nonResponseCount + 1
            }
        }
    }

    impressionsCount = impressions + parseInt(identifiedCount)
    var total = await parseInt(identifiedCount) + parseInt(refusedCount) + parseInt(nonResponseCount)

    await blockGroupRecord.push({blockGroup: details.blockGroup.properties.geoid, identified: identifiedCount, refuses: refusedCount, impressions: impressionsCount, nonResponses: nonResponseCount, total: total})

    return blockGroupRecord;
}

module.exports = {updateReport,
                  getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport,
                  getEventsSummaryReport,
                  getActivitiesSummaryReport,
                  getBlockGroupCanvassSummaryReport,
                  getBlockGroupCanvassSummaryReport2,
                  getBlockGroupOrgSummaryReport,
                  getBlockGroupOrgSummaryReport2,
                  getBlockGroupOverallSummaryReport,
                  getBlockGroupOverallSummaryReport2}
