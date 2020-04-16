var People = require ('../models/people/person');
var Campaign = require('../models/campaigns/campaign');
var mongoose = require('mongoose');

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
}

const getPetitionSummaryReport = async(details) =>{
    const agg = [
        {
            '$match': {
                'petitionContactHistory.campaignID': details.campaignID,
                'petitionContactHistory.orgID': details.orgID,
            }
        }, {
            '$unwind': {
                'path': '$petitionContactHistory',
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
}

const getOverallSummaryReport = async(details) =>{
    var recordsPerOrg = []

    const agg = [
        {
            '$match': {
                $or: [
                    {
                        $and: [
                            {
                                'canvassContactHistory.campaignID': details.campaignID,
                            }, {
                                'canvassContactHistory.orgID': details.orgID,
                            }
                        ]
                    }, {
                        $and: [
                            {
                                'petitionContactHistory.campaignID': details.campaignID,
                            }, {
                                'petitionContactHistory.orgID': details.orgID,
                            }
                        ]
                    }, {
                        $and: [
                            {
                                'phonebankContactHistory.campaignID': details.campaignID,
                            }, {
                                'phonebankContactHistory.orgID': details.orgID,
                            }
                        ]
                    }, /*{
                        $and: [
                            {
                                'textContactHistory.campaignID': details.campaignID,
                            }, {
                                'textContactHistory.orgID': details.orgID,
                            }
                        ]
                    }*/
                ]
            }
        }, {
            '$facet': {
                'canvass': [
                    {
                        '$match': {
                            'canvassContactHistory.campaignID': details.campaignID,
                            'canvassContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$canvassContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'canvassContactHistory.campaignID': details.campaignID,
                            'canvassContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$canvassContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'canvassGroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.canvassContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$canvassGroups'
                        }
                    }, {
                        '$project': {
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$canvassGroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$canvassGroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$canvassGroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$canvassGroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$canvassGroups.responses",
                                            'regex': '(?i)lit|imp|con|spanish|und'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$canvassGroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ],
                'petitions': [
                    {
                        '$match': {
                            'petitionContactHistory.campaignID': details.campaignID,
                            'petitionContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$petitionContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'petitionContactHistory.campaignID': details.campaignID,
                            'petitionContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$petitionContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'petitionsGroups': {
                                '$push': '$petitionContactHistory.idHistory.idResponses'
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$petitionsGroups'
                        }
                    }, {
                        '$project': {
                            'identified': {
                                '$literal': 1
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'identified': 1,
                            'refuses': {
                                '$literal': 0
                            },
                            'impressions': {
                                '$literal': 0
                            },
                            'nonResponses': {
                                '$literal': 0
                            },
                            'total': {
                                '$literal': 0
                            }
                        }
                    }
                ],
                'phonebank': [
                    {
                        '$match': {
                            'phonebankContactHistory.campaignID': details.campaignID,
                            'phonebankContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$phonebankContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'phonebankContactHistory.campaignID': details.campaignID,
                            'phonebankContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$phonebankContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'phonebankGroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.phonebankContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$phonebankGroups'
                        }
                    }, {
                        '$project': {
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$phonebankGroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$phonebankGroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$phonebankGroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$phonebankGroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$phonebankGroups.responses",
                                            'regex': '(?i)left message'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$phonebankGroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ],
                /*'text': [
                    {
                        '$match': {
                            'textContactHistory.campaignID': details.campaignID,
                            'textContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$textContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'textContactHistory.campaignID': details.campaignID,
                            'textContactHistory.orgID': details.orgID,
                        }
                    }, {
                        '$unwind': {
                            'path': '$textContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'textGroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.textContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$textGroups'
                        }
                    }, {
                        '$project': {
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$textGroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$textGroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$textGroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$textGroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$textGroups.responses",
                                            'regex': '(?i)left message'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$textGroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ]*/
            }
        }
    ];
    var reports = await People.aggregate(agg)

    const report = {
        'identified': 0,
        'refuses': 0,
        'impressions': 0,
        'nonResponses': 0,
        'total': 0,
    };

    if(reports[0].canvass.length) {
        report.identified += await reports[0].canvass[0].identified
        report.refuses += await reports[0].canvass[0].refuses
        report.impressions += await reports[0].canvass[0].impressions
        report.nonResponses += await reports[0].canvass[0].nonResponses
        report.total += await reports[0].canvass[0].total
    }

    if(reports[0].petitions.length) {
        report.identified += await reports[0].petitions[0].identified
        report.impressions += await reports[0].petitions[0].identified
        report.total += await reports[0].petitions[0].identified
    }

    if(reports[0].phonebank.length) {
        report.identified += await reports[0].phonebank[0].identified
        report.refuses += await reports[0].phonebank[0].refuses
        report.impressions += await reports[0].phonebank[0].impressions
        report.nonResponses += await reports[0].phonebank[0].nonResponses
        report.total += await reports[0].phonebank[0].total
    }

    /*if(reports[0].text.length) {
        report.identified += await reports[0].text[0].identified
        report.refuses += await reports[0].text[0].refuses
        report.impressions += await reports[0].text[0].impressions
        report.nonResponses += await reports[0].text[0].nonResponses
        report.total += await reports[0].text[0].total
    }*/

    await recordsPerOrg.push({org: details.orgName, identified: report.identified, refuses: report.refuses, impressions: report.impressions, nonResponses: report.nonResponses, total: report.total})
    return recordsPerOrg
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
    const agg = [
        {
            '$match': {
                'canvassContactHistory.activityID': details.activities._id,
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
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

    var knocksPerOrg = []

    var reports = await People.aggregate(agg)

    await knocksPerOrg.push({identified: reports[0].identified, total: reports[0].total})
    return knocksPerOrg
}

const getBlockGroupCanvassSummaryReport = async(details) =>{
    const agg = [
        {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID,
                'address.blockgroupID': {
                    '$exists': true
                }
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'canvassContactHistory.campaignID': details.campaignID,
                'canvassContactHistory.orgID': details.orgID,
                'address.blockgroupID': {
                    '$exists': true
                }
            }
        }, {
            '$unwind': {
                'path': '$canvassContactHistory.idHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$group': {
                '_id': '$address.blockgroupID',
                'blockgroups': {
                    '$push': {
                        '$arrayElemAt': [
                            '$$ROOT.canvassContactHistory.idHistory.idResponses', 0
                        ]
                    }
                }
            }
        }, {
            '$unwind': {
                'path': '$blockgroups'
            }
        }, {
            '$project': {
                'blockgroups': 1,
                'identified': {
                    '$cond': {
                        'if': {
                            '$or': [
                                {
                                    '$eq': [
                                        '$blockgroups.idType', 'POSITIVE'
                                    ]
                                }, {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEUTRAL'
                                    ]
                                }, {
                                    '$eq': [
                                        '$blockgroups.idType', 'NEGATIVE'
                                    ]
                                }
                            ]
                        },
                        'then': 1,
                        'else': 0
                    }
                },
                'refuses': {
                    '$cond': {
                        'if': {
                            '$eq': [
                                '$blockgroups.idType', 'REFUSED'
                            ]
                        },
                        'then': 1,
                        'else': 0
                    }
                },
                'impressions': {
                    '$cond': {
                        'if': {
                            '$regexFind': {
                                'input': "$blockgroups.responses",
                                'regex': '(?i)lit|imp|con|spanish|und'
                            }
                        },
                        'then': 1,
                        'else': 0
                    }
                },
                'nonResponses': {
                    '$cond': {
                        'if': {
                            '$eq': [
                                '$blockgroups.idType', 'NONRESPONSE'
                            ]
                        },
                        'then': 1,
                        'else': 0
                    }
                }
            }
        }, {
            '$group': {
                '_id': '$_id',
                'identified': {
                    '$sum': {
                        '$add': [
                            '$identified'
                        ]
                    }
                },
                'refuses': {
                    '$sum': {
                        '$add': [
                            '$refuses'
                        ]
                    }
                },
                'impressions': {
                    '$sum': {
                        '$add': [
                            '$impressions', '$identified'
                        ]
                    }
                },
                'nonResponses': {
                    '$sum': {
                        '$add': [
                            '$nonResponses'
                        ]
                    }
                },
                'total': {
                    '$sum': {
                        '$add': [
                            '$identified', '$refuses', '$nonResponses'
                        ]
                    }
                }
            }
        }, {
            '$project': {
                'blockGroup': '$_id',
                'identified': 1,
                'refuses': 1,
                'impressions': 1,
                'nonResponses': 1,
                'total': 1
            }
        }
    ];
    var blockGroupRecord = await People.aggregate(agg);

    return blockGroupRecord;
}

const getBlockGroupOverallSummaryReport = async(details) =>{
    const agg = [
        {
            '$match': {
                $or: [
                    {
                        $and: [
                            {
                                'canvassContactHistory.campaignID': details.campaignID,
                            }, {
                                'canvassContactHistory.orgID': details.orgID,
                            }, {
                                'address.blockgroupID': {
                                    '$exists': true
                                }
                            }
                        ]
                    }, {
                        $and: [
                            {
                                'petitionContactHistory.campaignID': details.campaignID,
                            }, {
                                'petitionContactHistory.orgID': details.orgID,
                            }, {
                                'address.blockgroupID': {
                                    '$exists': true
                                }
                            }
                        ]
                    }, {
                        $and: [
                            {
                                'phonebankContactHistory.campaignID': details.campaignID,
                            }, {
                                'phonebankContactHistory.orgID': details.orgID,
                            }, {
                                'address.blockgroupID': {
                                    '$exists': true
                                }
                            }
                        ]
                    }, /*{
                        $and: [
                            {
                                'textContactHistory.campaignID': details.campaignID,
                            }, {
                                'textContactHistory.orgID': details.orgID,
                            }, {
                                'address.blockgroupID': {
                                    '$exists': true
                                }
                            }
                        ]
                    }*/
                ]
            }
        }, {
            '$facet': {
                'canvass': [
                    {
                        '$match': {
                            'canvassContactHistory.campaignID': details.campaignID,
                            'canvassContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$canvassContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'canvassContactHistory.campaignID': details.campaignID,
                            'canvassContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$canvassContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': '$address.blockgroupID',
                            'blockgroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.canvassContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$blockgroups'
                        }
                    }, {
                        '$project': {
                            'blockgroups': 1,
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$blockgroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$blockgroups.responses",
                                            'regex': '(?i)lit|imp|con|spanish|und'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'blockGroup': '$_id',
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ],
                'petitions': [
                    {
                        '$match': {
                            'petitionContactHistory.campaignID': details.campaignID,
                            'petitionContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$petitionContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'petitionContactHistory.campaignID': details.campaignID,
                            'petitionContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$petitionContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': '$address.blockgroupID',
                            'blockgroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.petitionContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$blockgroups'
                        }
                    }, {
                        '$project': {
                            'blockgroups': 1,
                            'identified': {
                                '$literal': 1
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'blockGroup': '$_id',
                            'identified': 1,
                            'refuses': {
                                '$literal': 0
                            },
                            'impressions': '$identified',
                            'nonResponses': {
                                '$literal': 0
                            },
                            'total': {
                                '$literal': 0
                            }
                        }
                    }
                ],
                'phonebank': [
                    {
                        '$match': {
                            'phonebankContactHistory.campaignID': details.campaignID,
                            'phonebankContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$phonebankContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'phonebankContactHistory.campaignID': details.campaignID,
                            'phonebankContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$phonebankContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': '$address.blockgroupID',
                            'blockgroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.phonebankContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$blockgroups'
                        }
                    }, {
                        '$project': {
                            'blockgroups': 1,
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$blockgroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$blockgroups.responses",
                                            'regex': '(?i)left message'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'blockGroup': '$_id',
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ],
                /*'text': [
                    {
                        '$match': {
                            'textContactHistory.campaignID': details.campaignID,
                            'textContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$textContactHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$match': {
                            'textContactHistory.campaignID': details.campaignID,
                            'textContactHistory.orgID': details.orgID,
                            'address.blockgroupID': {
                                '$exists': true
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$textContactHistory.idHistory',
                            'preserveNullAndEmptyArrays': false
                        }
                    }, {
                        '$group': {
                            '_id': '$address.blockgroupID',
                            'blockgroups': {
                                '$push': {
                                    '$arrayElemAt': [
                                        '$$ROOT.textContactHistory.idHistory.idResponses', 0
                                    ]
                                }
                            }
                        }
                    }, {
                        '$unwind': {
                            'path': '$blockgroups'
                        }
                    }, {
                        '$project': {
                            'blockgroups': 1,
                            'identified': {
                                '$cond': {
                                    'if': {
                                        '$or': [
                                            {
                                                '$eq': [
                                                    '$blockgroups.idType', 'POSITIVE'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEUTRAL'
                                                ]
                                            }, {
                                                '$eq': [
                                                    '$blockgroups.idType', 'NEGATIVE'
                                                ]
                                            }
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'refuses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'REFUSED'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'impressions': {
                                '$cond': {
                                    'if': {
                                        '$regexFind': {
                                            'input': "$blockgroups.responses",
                                            'regex': '(?i)left message'
                                        }
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            },
                            'nonResponses': {
                                '$cond': {
                                    'if': {
                                        '$eq': [
                                            '$blockgroups.idType', 'NONRESPONSE'
                                        ]
                                    },
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '$_id',
                            'identified': {
                                '$sum': {
                                    '$add': [
                                        '$identified'
                                    ]
                                }
                            },
                            'refuses': {
                                '$sum': {
                                    '$add': [
                                        '$refuses'
                                    ]
                                }
                            },
                            'impressions': {
                                '$sum': {
                                    '$add': [
                                        '$impressions', '$identified'
                                    ]
                                }
                            },
                            'nonResponses': {
                                '$sum': {
                                    '$add': [
                                        '$nonResponses'
                                    ]
                                }
                            },
                            'total': {
                                '$sum': {
                                    '$add': [
                                        '$identified', '$refuses', '$nonResponses'
                                    ]
                                }
                            }
                        }
                    }, {
                        '$project': {
                            'blockGroup': '$_id',
                            'identified': 1,
                            'refuses': 1,
                            'impressions': 1,
                            'nonResponses': 1,
                            'total': 1
                        }
                    }
                ]*/
            }
        }, {
            '$project': {
                'blockGroupRecord': {
                    '$setUnion': [
                        '$canvass', '$petitions', '$phonebank', //'$text'
                    ]
                }
            }
        }
    ];
    var blockGroupRecord = await People.aggregate(agg);

    return blockGroupRecord[0].blockGroupRecord;
}

const getPhonebankingSummaryReport = async(details) =>{
    const agg = [
        {
            '$match': {
                'phonebankContactHistory.campaignID': details.campaignID,
                'phonebankContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$phonebankContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'phonebankContactHistory.campaignID': details.campaignID,
                'phonebankContactHistory.orgID': details.orgID
            }
        }, {
            '$addFields': {
                'address.streetNum': {
                    '$ifNull': [
                        '$address.streetNum', 'a'
                    ]
                },
                'address.street': {
                    '$ifNull': [
                        '$address.street', 'a'
                    ]
                },
                'address.suffix': {
                    '$ifNull': [
                        '$address.suffix', 'a'
                    ]
                },
                'address.unit': {
                    '$ifNull': [
                        '$address.unit', 'a'
                    ]
                },
                'address.city': {
                    '$ifNull': [
                        '$address.city', 'a'
                    ]
                },
                'address.state': {
                    '$ifNull': [
                        '$address.state', 'a'
                    ]
                },
                'address.zip': {
                    '$ifNull': [
                        '$address.zip', 'a'
                    ]
                }
            }
        }, {
            '$group': {
                '_id': {
                    '$concat': [
                        '$address.streetNum', '$address.street', '$address.suffix', '$address.unit', '$address.city', '$address.state', '$address.zip'
                    ]
                },
                'identified': {
                    '$push': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$phonebankContactHistory.identified', true
                                ]
                            }, '$$ROOT.phonebankContactHistory', null
                        ]
                    }
                },
                'refused': {
                    '$push': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$phonebankContactHistory.refused', true
                                ]
                            }, '$$ROOT.phonebankContactHistory', null
                        ]
                    }
                },
                'impression': {
                    '$push': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$phonebankContactHistory.impression', true
                                ]
                            }, '$$ROOT.phonebankContactHistory', null
                        ]
                    }
                },
                'nonResponse': {
                    '$push': {
                        '$cond': [
                            {
                                '$eq': [
                                    '$phonebankContactHistory.nonResponse', true
                                ]
                            }, '$$ROOT.phonebankContactHistory', null
                        ]
                    }
                }
            }
        }, {
            '$project': {
                '_id': '$_id',
                'identified': {
                    '$filter': {
                        'input': '$identified',
                        'as': 'ident',
                        'cond': {
                            '$ne': [
                                '$$ident', null
                            ]
                        }
                    }
                },
                'refused': {
                    '$filter': {
                        'input': '$refused',
                        'as': 'ref',
                        'cond': {
                            '$ne': [
                                '$$ref', null
                            ]
                        }
                    }
                },
                'impression': {
                    '$filter': {
                        'input': '$impression',
                        'as': 'imp',
                        'cond': {
                            '$ne': [
                                '$$imp', null
                            ]
                        }
                    }
                },
                'nonResponse': {
                    '$filter': {
                        'input': '$nonResponse',
                        'as': 'nr',
                        'cond': {
                            '$ne': [
                                '$$nr', null
                            ]
                        }
                    }
                }
            }
        }, {
            '$project': {
                '_id': 1,
                'record.identified': {
                    '$cond': {
                        'if': {
                            '$gt': [
                                {
                                    '$size': '$identified'
                                }, 0
                            ]
                        },
                        'then': '$identified',
                        'else': '$$REMOVE'
                    }
                },
                'record.refused': {
                    '$cond': {
                        'if': {
                            '$gt': [
                                {
                                    '$size': '$refused'
                                }, 0
                            ]
                        },
                        'then': '$refused',
                        'else': '$$REMOVE'
                    }
                },
                'record.impression': {
                    '$cond': {
                        'if': {
                            '$gt': [
                                {
                                    '$size': '$impression'
                                }, 0
                            ]
                        },
                        'then': '$impression',
                        'else': '$$REMOVE'
                    }
                },
                'record.nonResponse': {
                    '$cond': {
                        'if': {
                            '$gt': [
                                {
                                    '$size': '$nonResponse'
                                }, 0
                            ]
                        },
                        'then': '$nonResponse',
                        'else': '$$REMOVE'
                    }
                }
            }
        }, {
            '$project': {
                'record': {
                    '$objectToArray': '$record'
                }
            }
        }, {
            '$project': {
                '_id': 1,
                'records': {
                    '$arrayElemAt': [
                        {
                            '$arrayElemAt': [
                                '$record.v', 0
                            ]
                        }, 0
                    ]
                }
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$match': {
                            'records.identified': true
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
                            'records.refused': true
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
                            'records.impression': true
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
                            'records.nonResponse': true
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
    var knocksPerOrg = []

    var reports = await People.aggregate(agg).allowDiskUse(true)

    await knocksPerOrg.push({org: details.orgName, identified: reports[0].identified, refuses: reports[0].refuses, impressions: reports[0].impressions, nonResponses: reports[0].nonResponses, total: reports[0].total})
    return knocksPerOrg
}

const getTextingSummaryReport = async(details) =>{
    const agg = [
        {
            '$match': {
                'textContactHistory.campaignID': details.campaignID,
                'textContactHistory.orgID': details.orgID
            }
        }, {
            '$unwind': {
                'path': '$textContactHistory',
                'preserveNullAndEmptyArrays': false
            }
        }, {
            '$match': {
                'textContactHistory.campaignID': details.campaignID,
                'textContactHistory.orgID': details.orgID
            }
        }, {
            '$facet': {
                'identified': [
                    {
                        '$match': {
                            'textContactHistory.idHistory.idResponses.0.idType': {
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
                            'textContactHistory.idHistory.idResponses.0.idType': 'REFUSED'
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
                            'textContactHistory.impression': true
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
                        }
                    ]
                }
            }
        }
    ];
    var knocksPerOrg = []

    var reports = await People.aggregate(agg)

    await knocksPerOrg.push({org: details.orgName, identified: reports[0].identified, refuses: reports[0].refuses, impressions: reports[0].impressions, total: reports[0].total})
    return knocksPerOrg
}

const getPhonebankingUserSummaryReport = async(details) =>{
    const agg = (() => {
        if (details.date) {
            return [
                {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID
                    }
                }, {
                    '$unwind': {
                        'path': '$phonebankContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID
                    }
                }, {
                    '$addFields': {
                        'address.streetNum': {
                            '$ifNull': [
                                '$address.streetNum', 'a'
                            ]
                        },
                        'address.street': {
                            '$ifNull': [
                                '$address.street', 'a'
                            ]
                        },
                        'address.suffix': {
                            '$ifNull': [
                                '$address.suffix', 'a'
                            ]
                        },
                        'address.unit': {
                            '$ifNull': [
                                '$address.unit', 'a'
                            ]
                        },
                        'address.city': {
                            '$ifNull': [
                                '$address.city', 'a'
                            ]
                        },
                        'address.state': {
                            '$ifNull': [
                                '$address.state', 'a'
                            ]
                        },
                        'address.zip': {
                            '$ifNull': [
                                '$address.zip', 'a'
                            ]
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            '$concat': [
                                '$address.streetNum', '$address.street', '$address.suffix', '$address.unit', '$address.city', '$address.state', '$address.zip'
                            ]
                        },
                        'identified': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.identified', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'refused': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.refused', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'impression': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.impression', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'nonResponse': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.nonResponse', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': '$_id',
                        'identified': {
                            '$filter': {
                                'input': '$identified',
                                'as': 'ident',
                                'cond': {
                                    '$ne': [
                                        '$$ident', null
                                    ]
                                }
                            }
                        },
                        'refused': {
                            '$filter': {
                                'input': '$refused',
                                'as': 'ref',
                                'cond': {
                                    '$ne': [
                                        '$$ref', null
                                    ]
                                }
                            }
                        },
                        'impression': {
                            '$filter': {
                                'input': '$impression',
                                'as': 'imp',
                                'cond': {
                                    '$ne': [
                                        '$$imp', null
                                    ]
                                }
                            }
                        },
                        'nonResponse': {
                            '$filter': {
                                'input': '$nonResponse',
                                'as': 'nr',
                                'cond': {
                                    '$ne': [
                                        '$$nr', null
                                    ]
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'record.identified': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$identified'
                                        }, 0
                                    ]
                                },
                                'then': '$identified',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.refused': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$refused'
                                        }, 0
                                    ]
                                },
                                'then': '$refused',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.impression': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$impression'
                                        }, 0
                                    ]
                                },
                                'then': '$impression',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.nonResponse': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$nonResponse'
                                        }, 0
                                    ]
                                },
                                'then': '$nonResponse',
                                'else': '$$REMOVE'
                            }
                        }
                    }
                }, {
                    '$project': {
                        'record': {
                            '$objectToArray': '$record'
                        }
                    }
                }, {
                    '$project': {
                        '_id': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        {
                                            '$arrayElemAt': [
                                                '$record.v.idHistory.idBy', 0
                                            ]
                                        }, 0
                                    ]
                                }, 0
                            ]
                        },
                        'records': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        '$record.v', 0
                                    ]
                                }, 0
                            ]
                        },
                        'date': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        {
                                            '$arrayElemAt': [
                                                '$record.v.idHistory.date', 0
                                            ]
                                        }, 0
                                    ]
                                }, 0
                            ]
                        }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'records': 1,
                        'date': {
                            '$dateToString': {
                                'format': '%Y-%m-%d',
                                'date': '$date',
                                'timezone': 'America/Los_Angeles'
                            }
                        }
                    }
                }, {
                    '$match': {
                        '_id': {
                            '$in': details.users
                        },
                        'date': details.date
                    }
                }, {
                    '$project':  {
                        '_id': 1,
                        'identified': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.identified', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'refuses': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.refused', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'impressions': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.impression', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'nonResponses': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.nonResponse', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'identified': {
                            '$sum': {
                                '$add': [
                                    '$identified'
                                ]
                            }
                        },
                        'refuses': {
                            '$sum': {
                                '$add': [
                                    '$refuses'
                                ]
                            }
                        },
                        'impressions': {
                            '$sum': {
                                '$add': [
                                    '$impressions', '$identified'
                                ]
                            }
                        },
                        'nonResponses': {
                            '$sum': {
                                '$add': [
                                    '$nonResponses'
                                ]
                            }
                        },
                        'total': {
                            '$sum': {
                                '$add': [
                                    '$identified', '$refuses', '$nonResponses'
                                ]
                            }
                        }
                    }
                }
            ];
        } else {
            return [
                {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID
                    }
                }, {
                    '$unwind': {
                        'path': '$phonebankContactHistory',
                        'preserveNullAndEmptyArrays': false
                    }
                }, {
                    '$match': {
                        'phonebankContactHistory.campaignID': details.campaignID,
                        'phonebankContactHistory.orgID': details.orgID
                    }
                }, {
                    '$addFields': {
                        'address.streetNum': {
                            '$ifNull': [
                                '$address.streetNum', 'a'
                            ]
                        },
                        'address.street': {
                            '$ifNull': [
                                '$address.street', 'a'
                            ]
                        },
                        'address.suffix': {
                            '$ifNull': [
                                '$address.suffix', 'a'
                            ]
                        },
                        'address.unit': {
                            '$ifNull': [
                                '$address.unit', 'a'
                            ]
                        },
                        'address.city': {
                            '$ifNull': [
                                '$address.city', 'a'
                            ]
                        },
                        'address.state': {
                            '$ifNull': [
                                '$address.state', 'a'
                            ]
                        },
                        'address.zip': {
                            '$ifNull': [
                                '$address.zip', 'a'
                            ]
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            '$concat': [
                                '$address.streetNum', '$address.street', '$address.suffix', '$address.unit', '$address.city', '$address.state', '$address.zip'
                            ]
                        },
                        'identified': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.identified', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'refused': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.refused', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'impression': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.impression', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        },
                        'nonResponse': {
                            '$push': {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$phonebankContactHistory.nonResponse', true
                                        ]
                                    }, '$$ROOT.phonebankContactHistory', null
                                ]
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': '$_id',
                        'identified': {
                            '$filter': {
                                'input': '$identified',
                                'as': 'ident',
                                'cond': {
                                    '$ne': [
                                        '$$ident', null
                                    ]
                                }
                            }
                        },
                        'refused': {
                            '$filter': {
                                'input': '$refused',
                                'as': 'ref',
                                'cond': {
                                    '$ne': [
                                        '$$ref', null
                                    ]
                                }
                            }
                        },
                        'impression': {
                            '$filter': {
                                'input': '$impression',
                                'as': 'imp',
                                'cond': {
                                    '$ne': [
                                        '$$imp', null
                                    ]
                                }
                            }
                        },
                        'nonResponse': {
                            '$filter': {
                                'input': '$nonResponse',
                                'as': 'nr',
                                'cond': {
                                    '$ne': [
                                        '$$nr', null
                                    ]
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        '_id': 1,
                        'record.identified': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$identified'
                                        }, 0
                                    ]
                                },
                                'then': '$identified',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.refused': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$refused'
                                        }, 0
                                    ]
                                },
                                'then': '$refused',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.impression': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$impression'
                                        }, 0
                                    ]
                                },
                                'then': '$impression',
                                'else': '$$REMOVE'
                            }
                        },
                        'record.nonResponse': {
                            '$cond': {
                                'if': {
                                    '$gt': [
                                        {
                                            '$size': '$nonResponse'
                                        }, 0
                                    ]
                                },
                                'then': '$nonResponse',
                                'else': '$$REMOVE'
                            }
                        }
                    }
                }, {
                    '$project': {
                        'record': {
                            '$objectToArray': '$record'
                        }
                    }
                }, {
                    '$project': {
                        '_id': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        {
                                            '$arrayElemAt': [
                                                '$record.v.idHistory.idBy', 0
                                            ]
                                        }, 0
                                    ]
                                }, 0
                            ]
                        },
                        'records': {
                            '$arrayElemAt': [
                                {
                                    '$arrayElemAt': [
                                        '$record.v', 0
                                    ]
                                }, 0
                            ]
                        }
                    }
                }, {
                    '$match': {
                        '_id': {
                            '$in': details.users
                        },
                    }
                }, {
                    '$project':  {
                        '_id': 1,
                        'identified': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.identified', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'refuses': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.refused', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'impressions': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.impression', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        },
                        'nonResponses': {
                            '$cond': {
                                'if': {
                                    '$eq': [
                                        '$records.nonResponse', true
                                    ]
                                },
                                'then': 1,
                                'else': 0
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$_id',
                        'identified': {
                            '$sum': {
                                '$add': [
                                    '$identified'
                                ]
                            }
                        },
                        'refuses': {
                            '$sum': {
                                '$add': [
                                    '$refuses'
                                ]
                            }
                        },
                        'impressions': {
                            '$sum': {
                                '$add': [
                                    '$impressions', '$identified'
                                ]
                            }
                        },
                        'nonResponses': {
                            '$sum': {
                                '$add': [
                                    '$nonResponses'
                                ]
                            }
                        },
                        'total': {
                            '$sum': {
                                '$add': [
                                    '$identified', '$refuses', '$nonResponses'
                                ]
                            }
                        }
                    }
                }
            ];
        }
    })();
    var reports = await People.aggregate(agg).allowDiskUse(true)

    const agg2 = [
        {
            '$match': {
                'user._id': {
                    '$in': details.users.map(x => mongoose.Types.ObjectId(x))
                }
            }
        }
    ];

    var reports2 = await People.aggregate(agg2)

    for(var i = 0; i < reports.length; i++){
        var num = await reports2.findIndex(x => x.user._id.toString() === reports[i]._id.toString())
        reports[i]['user'] = reports2[num].firstName + " " + reports2[num].lastName
    }

    return reports
}

module.exports = {getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport,
                  getEventsSummaryReport,
                  getActivitiesSummaryReport,
                  getBlockGroupCanvassSummaryReport,
                  getBlockGroupOverallSummaryReport,
                  getPhonebankingSummaryReport,
                  getTextingSummaryReport,
                  getPhonebankingUserSummaryReport}
