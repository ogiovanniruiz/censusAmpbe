var People = require ('../models/people/person');
var Addresses = require ('../models/people/addresses');
var CensusTract = require('../models/censustracts/censustract');
var mongoose = require('mongoose');

const Geocodio = require('geocodio-library-node');
const geocodio = new Geocodio('a6212ea62222f065a52228c6e5fc56ec8e5685f');

const updateReport = async(org) => {

    console.log('start')

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
    console.log('done')
    return {}
}

const updateImpressions = async(org) => {

    console.log('start')

    for(var i = 0;; i++){

        const agg = [
            {
                '$match': {
                    'phonebankContactHistory': {
                        '$type': 'array',
                        '$ne': []
                    }
                }
            }, {
                '$project': {
                    '_id': '$_id',
                    'phonebankContactHistory': {
                        '$arrayElemAt': [
                            '$phonebankContactHistory', i
                        ]
                    }
                }
            }, {
                '$match': {
                    'phonebankContactHistory': {
                        '$exists': true
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'records': {
                        '$addToSet': '$_id'
                    }
                }
            }
        ];
        var people = await People.aggregate(agg);

        if(people.length) {
            var updated = await People.update(
                { _id: {$in: people[0].records},  phonebankContactHistory: {$type: 'array', $ne: []} },
                { $set: { ['phonebankContactHistory.'+i+'.impression']: false } },
                { upsert: false, multi: true,}
            );
            console.log(updated)
        } else {
            break
        }
        console.log(i+' A')
    }

    console.log('done')
    return {}
}

const updateImpressions2 = async(org) => {

    console.log('start')

    for(var j = 0;; j++){

        const agg2 = [
            {
                '$match': {
                    'phonebankContactHistory': {
                        '$type': 'array',
                        '$ne': []
                    }
                }
            }, {
                '$project': {
                    '_id': '$_id',
                    'phonebankContactHistory': {
                        '$arrayElemAt': [
                            '$phonebankContactHistory', j
                        ]
                    }
                }
            }, {
                '$unwind': {
                    'path': '$phonebankContactHistory.idHistory',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$match': {
                    'phonebankContactHistory.idHistory.idResponses.0.responses': {
                        '$regex': '(?i)left message'
                    }
                }
            }, {
                '$group': {
                    '_id': '$_id'
                }
            }, {
                '$group': {
                    '_id': null,
                    'records': {
                        '$addToSet': '$_id'
                    }
                }
            }
        ];
        var people2 = await People.aggregate(agg2);

        if(people2.length) {
            var updated2 = await People.update(
                { _id: {$in: people2[0].records},  phonebankContactHistory: {$type: 'array', $ne: []} },
                { $set: { ['phonebankContactHistory.'+j+'.impression']: true } },
                { upsert: false, multi: true,}
            );
            console.log(updated2)
        } else {
            break
        }
        console.log(j+' B')
    }

    console.log('done')
    return {}
}

const updateImpressions3 = async(org) => {

    console.log('start')

    for(var k = 0;; k++){

        const agg3 = [
            {
                '$match': {
                    'phonebankContactHistory': {
                        '$type': 'array',
                        '$ne': []
                    }
                }
            }, {
                '$project': {
                    '_id': '$_id',
                    'phonebankContactHistory': {
                        '$arrayElemAt': [
                            '$phonebankContactHistory', k
                        ]
                    }
                }
            }, {
                '$match': {
                    'phonebankContactHistory.identified': true
                }
            }, {
                '$group': {
                    '_id': '$_id'
                }
            }, {
                '$group': {
                    '_id': null,
                    'records': {
                        '$addToSet': '$_id'
                    }
                }
            }
        ];
        var people3 = await People.aggregate(agg3);

        if(people3.length) {
            var updated3 = await People.update(
                { _id: {$in: people3[0].records},  phonebankContactHistory: {$type: 'array', $ne: []} },
                { $set: { ['phonebankContactHistory.'+k+'.impression']: true } },
                { upsert: false, multi: true,}
            );
            console.log(updated3)
        } else {
            break
        }
        console.log(k+' C')
    }

    console.log('done')
    return {}
}


const updateAddressGeocode = async() =>{
    console.log('start')

    for(var i = 0;; i++){

        const agg = [
            {
                '$match': {
                    'location': {
                        '$exists': false
                    }
                }
            }, {
                '$limit': 100
            }, {
                '$project': {
                    'address': {
                        '$concat': [
                            '$streetNum', {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$streetNum', ''
                                        ]
                                    }, '', ' '
                                ]
                            }, {
                                '$rtrim': {
                                    'input': '$prefix'
                                }
                            }, {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$prefix', ''
                                        ]
                                    }, '', ' '
                                ]
                            }, '$street', {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$street', ''
                                        ]
                                    }, '', ' '
                                ]
                            }, '$suffix', ', ', '$city', ', ', '$state', {
                                '$cond': [
                                    {
                                        '$eq': [
                                            '$state', ''
                                        ]
                                    }, '', ' '
                                ]
                            }, '$zip'
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': null,
                    'id': {
                        '$push': {
                            'k': '$address',
                            'v': '$_id'
                        }
                    },
                    'addresses': {
                        '$addToSet': '$address'
                    }
                }
            }, {
                '$project': {
                    'id': {
                        '$arrayToObject': '$id'
                    },
                    'addresses': 1
                }
            }
        ];
        var address = await Addresses.aggregate(agg);

        if(address.length) {

            await geocodio.geocode(address[0].addresses).then(async response => {

                var bulkArray = [];
                for(var key in address[0].id){

                    var index = response.results.findIndex(x => x.query === key)

                    bulkArray.push({ updateOne : {
                            "filter" : { "_id" : mongoose.Types.ObjectId(address[0].id[key]) },
                            "update" : { $set : {
                                    'accuracyType': response.results[index].response.results[0].accuracy_type,
                                    'location.type': 'Point',
                                    'location.coordinates': [
                                        response.results[index].response.results[0].location.lat,
                                        response.results[index].response.results[0].location.lng
                                    ],
                            } }
                    }})
                }

                var updated = await Addresses.bulkWrite(bulkArray);

                console.log(updated)

            }).catch(err => {
                console.log("THIS IS A TERRIBLE ERROR")
                console.error(err);
            });

        } else {
            break
        }
        //console.log(i+ 'LOOP')
    }

    console.log('done')
    return {}

}

module.exports = {updateReport,
                  updateImpressions,
                  updateImpressions2,
                  updateImpressions3,
                  updateAddressGeocode}
