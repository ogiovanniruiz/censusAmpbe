var People = require ('../models/people/person');
var Addresses = require ('../models/people/addresses');
var CensusTract = require('../models/censustracts/censustract');
var mongoose = require('mongoose');
var async = require('async');
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

    var index = 0


    async.forever(

        async function(next) {

        const agg = [
            {
                '$match': {
                    'location': {
                        '$exists': false
                    }
                }
            }, {
                '$limit': 100
            }
        ];

        var address = await Addresses.aggregate(agg);
        var addressObject = {addresses: [], id: {}}

        for(var i = 0; i < address.length; i++){

            var addressString = ""

            if(address[i].streetNum) {addressString = addressString + address[i].streetNum + " "}
            if(address[i].prefix) {addressString = addressString + address[i].prefix + " "}
            if(address[i].street) {addressString = addressString + address[i].street + " "}
            if(address[i].suffix) {addressString = addressString + address[i].suffix + " "}
            if(address[i].city) {addressString = addressString + address[i].city + ", CA "}
            if(address[i].zip) {addressString = addressString + address[i].zip}

            addressObject.addresses.push(addressString)
            addressObject.id[addressString] = address[i]._id

        }
        if(address) {
            await geocodio.geocode(addressObject.addresses).then(async response => {

                var bulkArray = [];
                for(var key in addressObject.id){

                    var index = response.results.findIndex(x => x.query === key)

                    if(!response.results[index].response.results[0]){

                        response.results[index].response.results.push({accuracy_type: "none",
                                                                        location:{lat: 0, lng: 0}})

                    }

                    bulkArray.push({ updateOne : {
                            "filter" : { "_id" : mongoose.Types.ObjectId(addressObject.id[key]) },
                            "update" : { $set : {
                                    'accuracyType': response.results[index].response.results[0].accuracy_type,
                                    'location.type': 'Point',
                                    'location.coordinates': [
                                        response.results[index].response.results[0].location.lng,
                                        response.results[index].response.results[0].location.lat
                                        
                                    ],
                            } }
                    }})
                }

                var updated = await Addresses.bulkWrite(bulkArray);
                console.log(updated)

            }).catch(err => {
                console.error(err);
            });


            index = index + 100
            console.log("Geocoded: ", index)

        }else{
            console.log("DONE")
            return callback('stop')
        } 
          
    })

    return {msg: "PROCESSING"}  

}

module.exports = {updateReport,
                  updateImpressions,
                  updateImpressions2,
                  updateImpressions3,
                  updateAddressGeocode}
