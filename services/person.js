var Person = require('../models/people/person')
var Parcel = require('../models/parcels/parcel')
var NodeGeocoder = require('node-geocoder');

var async = require('async');

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyAQmji7d5aXw_uf2sCsBGJxWcVrVmDmfxE ', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
  };

const getHouseHold = async(address) => {
    var people = await Person.find({"address.street": address.street, "address.streetNum": address.streetNum});
    try { return people
    } catch(e){
        throw new Error(e.message)
    }
}

const runMatch = async()=>{

     var zips = await Parcel.aggregate(     [
        {$match: {"properties.assessorCodes.realUse": "R1"}},
        {$group : { _id : "$properties.address.zip"}}

      ])

    for(var i = 0; i < 4; i++){
        var parcels = await Parcel.find({"properties.address.zip": zips[i]._id})
    }

    for(var j = 0; j < parcels.length; j++){
        console.log("Parcel Number: ", j)
        console.log("Total: ", parcels.length)
       var peopleCount = await Person.find({"address.streetNum": parcels[j].properties.address.streetNum, "address.street": parcels[j].properties.address.street}).count()

    }
    return {peopleCount: peopleCount}
}

const editPerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});
    person.firstName = detail.newDetail.firstName
    person.lastName = detail.newDetail.lastName
    person.emails = detail.newDetail.email
    person.phones = detail.newDetail.phone
    person.address = {
                      streetNum: detail.newDetail.streetNum,
                      prefix: detail.newDetail.prefix,
                      street: detail.newDetail.street,
                      suffix : detail.newDetail.suffix,
                      unit: detail.newDetail.unit,
                      city: detail.newDetail.city,
                      county: detail.newDetail.county
                    }
    person.demographics = {dob: detail.newDetail.dob,
        gender: detail.newDetail.gender
    }

    person.voterInfo = {party: detail.newDetail.party}


    return person.save()
}

const createPerson = async(detail) =>{
/*
    console.log(detail)
    var geocoder = NodeGeocoder(options);

    geocoder.geocode('29 champs elysée paris').then(function(res) {
    console.log(res);})
  .catch(function(err) {
    console.log(err);
  });

*/

    var person = new Person(detail);
    return person.save();
}

const getMembers = async(detail) =>{
    var people = await Person.find({"membership": detail.orgID})
    return people
}

const uploadMembers = async(detail) =>{

    var stringFile = detail.files[0].buffer.toString('utf8');

    var lines = (stringFile).split("\n");
    var headers = lines[0].split(",");
    counter = 0

    async.eachLimit(lines, 100, function(line, callback){

        var obj = {}
        var currentLine = line.split(",")

        if(currentLine.length === 1){
           return 
        }

        for(var j = 0; j < headers.length; j++){

            // BEGINNING OF ADDRESS
            if(headers[j] === "address"){

                var brokenAddy = currentLine[j].split(" ")
                for (let m = 0; m < brokenAddy.length; m++) {
                    if (typeof brokenAddy[m] === 'string') {
                        brokenAddy[m] = brokenAddy[m].toUpperCase();
                    }
                }
                obj["address.streetNum"] = brokenAddy[0]

                var prefices = ["E", "N", "W", "S", "NW", "NE"]
                var suffices = ["AVE","BLVD","BRG","CIR","CRK","CRST","CT","CTR","CV","CYN","DR","EXPY","FLDS","FLTS","HL","HLS","HTS","HWY","IS","LN","LOOP","LP","MDW","ML","PARK","PASS","PATH","PK","PKWY","PL","PLZ","PT","RD","RDG","RUN","SQ","ST","TER","TRL","VIS","VLY","VW","WALK","WAY","XING","AVENUE","BOULEVARD","BRIDGE","CIRCLE","CREEK","CREST","COURT","CENTER","COVE","CANYON","DRIVE","EXPRESSWAY","FIELDS","FLATS","HILL","HILLS","HEIGHTS","HIGHWAY","ISLAND","LANE","MEADOW","MILL","PARKS","PARK","PARKWAY","PLACE","PLAZA","POINT","ROAD","RIDGE","SQUARE","STREET","TERRACE","TRAIL","VISTA","VIEW"]
                var units = ["APARTMENT","BLDG","FLOOR","SUITE","UNIT","ROOM","DEPARTMENT","RM","DEPT","FL","STE","APT","#"]

                var p
                if (prefices.includes(brokenAddy[1])) {
                    obj["address.prefix"] = brokenAddy[1]
                    p = 1
                }
                else {
                    obj["address.prefix"] = ""
                    p = 0
                }

                for (var s = brokenAddy.length - 1; s > 0; s = s - 1) {
                    if (suffices.includes(brokenAddy[s])) {
                        break
                    }
                    else {s = -1}
                }

                for (var u = brokenAddy.length - 1; u > 0; u = u - 1) {
                    if (units.includes(brokenAddy[u])) {
                        return u
                    }
                    else {
                        u = -1
                        obj["address.unit"] = ""
                    }
                }

                var u1 = brokenAddy.findIndex(element => element.includes("#"))
                var u2 = brokenAddy.findIndex(element => element.includes("APT"))

                if (p == 1 && s != -1) {
                    var street1 = brokenAddy.slice(2, s)
                    obj["address.street"] = street1.join()
                    obj["address.suffix"] = brokenAddy[s]

                    if (u != -1) {
                        var unit1 = brokenAddy.slice(s+1, brokenAddy.length)
                        obj["address.unit"] = unit1.join()
                    }
                }

                else if (p == 0 && s != -1) {
                    var street2 = brokenAddy.slice(1, s)
                    obj["address.street"] = street2.join()
                    obj["address.suffix"] = brokenAddy[s]

                    if (u != -1) {
                        var unit2 = brokenAddy.slice(s+1, brokenAddy.length)
                        obj["address.unit"] = unit2.join()
                    }
                }

                else if (p == 1 && s == -1) {
                    if (u != -1) {
                        var unit3 = brokenAddy.slice(u, brokenAddy.length)
                        obj["address.unit"] = unit3.join()
                        var street3 = brokenAddy.slice(2, u)
                        obj["address.street"] = street3.join()
                    }
                    else if (u == -1 && u1 == -1 && u2 == -1) {
                        var street4 = brokenAddy.slice(2, brokenAddy.length)
                        obj["address.street"] = street4.join()
                    }
                    else if (u == -1 && u1 != -1) {
                        var unit31 = brokenAddy.slice(u1, brokenAddy.length)
                        obj["address.unit"] = unit31.join()
                        var street41 = brokenAddy.slice(2, u1)
                        obj["address.street"] = street41.join()
                    }
                    else if (u == -1 && u2 != -1) {
                        var unit32 = brokenAddy.slice(u2, brokenAddy.length)
                        obj["address.unit"] = unit32.join()
                        var street42 = brokenAddy.slice(2, u2)
                        obj["address.street"] = street42.join()
                    }
                }

                else if (p == 0 && s == -1) {
                    if (u != -1) {
                        var unit4 = brokenAddy.slice(u, brokenAddy.length)
                        obj["address.unit"] = unit4.join()
                        var street5 = brokenAddy.slice(1, u)
                        obj["address.street"] = street5.join()
                    }
                    else if (u == -1) {
                        var street6 = brokenAddy.slice(1, brokenAddy.length)
                        obj["address.street"] = street6.join()
                    }
                    else if (u == -1 && u1 != -1) {
                        var unit41 = brokenAddy.slice(u1, brokenAddy.length)
                        obj["address.unit"] = unit41.join()
                        var street61 = brokenAddy.slice(1, u1)
                        obj["address.street"] = street61.join()
                    }
                    else if (u == -1 && u2 != -1) {
                        var unit42 = brokenAddy.slice(u2, brokenAddy.length)
                        obj["address.unit"] = unit42.join()
                        var street62 = brokenAddy.slice(1, u2)
                        obj["address.street"] = street62.join()
                    }
                }

            }

            else if(headers[j] === "city") {
                obj["address.city"] = currentLine[j].toUpperCase()
            }

            else if(headers[j] === "county") {
                obj["address.county"] = currentLine[j].toUpperCase()
            }

            else if(headers[j] === "gender") {
                obj["demographics.gender"] = currentLine[j].toUpperCase()
            }

            else if(headers[j] === "birthDate") {
                obj["demographics.dob"] = currentLine[j]
            }

            else if(headers[j] === "party") {
                obj["voterInfo.party"] = currentLine[j].toUpperCase()
            }

            else if (headers[j] === "phones"){

                if(currentLine[j]){
                    obj[headers[j]] = currentLine[j].replace("(", "").replace(")", "").replace("-","")
                }

            } else{
                obj[headers[j]] = currentLine[j]
            }
        }

        obj["membership"] = detail.body.orgID

        if(detail.body.selectedTag){
            obj['tags'] = detail.body.selectedTag
        }

        if(obj['firstName'] != "firstName" && obj["firstName"] != "" && obj ['firstName'] != undefined){
            var person = new Person(obj)

            person.save()

        }


        callback();
    })

}

const idPerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.script._id,
                     idBy: detail.userID,
                     idResponses: detail.idResponses,
                     locationIdentified: detail.location}

    if(detail.activityType === "Canvass"){

        if(person.canvassContactHistory.length === 0){

            var canvassContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.canvassContactHistory.push(canvassContactHistory)
            return person.save()

        }else{


            for (var i = 0; i < person.canvassContactHistory.length; i++){
                if(person.canvassContactHistory[i].activityID === detail.activityID){
                    person.canvassContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var canvassContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.canvassContactHistory.push(canvassContactHistory)
            return person.save()

        }
    } else if (detail.activityType === "Phonebank"){

        if(person.phonebankContactHistory.length === 0){

            var phonebankContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.phonebankContactHistory.push(phonebankContactHistory)
            return person.save()

        }else{


            for (var i = 0; i < person.phonebankContactHistory.length; i++){
                if(person.phonebankContactHistory[i].activityID === detail.activityID){
                    person.phonebankContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var phonebankContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.phonebankContactHistory.push(phonebankContactHistory)
            return person.save()

        }
    } else if (detail.activityType === "Texting"){

        if(person.textContactHistory.length === 0){

            var textContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.textContactHistory.push(textContactHistory)
            return person.save()

        }else{


            for (var i = 0; i < person.textContactHistory.length; i++){
                if(person.textContactHistory[i].activityID === detail.activityID){
                    person.textContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var textContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.textContactHistory.push(textContactHistory)
            return person.save()

        }
    }

}

const finishIdentification = async(detail) => {

    var person = await Person.findOne({"_id": detail.person._id})

    if(detail.activityType === "Phonebank"){
        for(var i = 0; i < person.phonebankContactHistory.length; i++){

            if(person.phonebankContactHistory[i].activityID === detail.activityID){
                person.phonebankContactHistory[i].identified = true;
                return person.save()
            }
        }
    } else if(detail.activityType === "Texting"){
        for(var i = 0; i < person.textContactHistory.length; i++){

            if(person.textContactHistory[i].activityID === detail.activityID){
                person.textContactHistory[i].identified = true;
                return person.save()
            }
        }
    }
}


module.exports = {getHouseHold, editPerson, createPerson, idPerson, getMembers, uploadMembers, runMatch, finishIdentification}
