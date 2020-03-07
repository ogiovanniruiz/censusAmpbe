var Person = require('../models/people/person')
var NodeGeocoder = require('node-geocoder');
var parser = require('parse-address');
var jwt = require('jsonwebtoken');
var Campaign = require('../models/campaigns/campaign') 
var Rdr  = require('../models/activities/rdr')
var async = require('async');

const Geocodio = require('geocodio-library-node');
const geocodio = new Geocodio('a6212ea62222f065a52228c6e5fc56ec8e5685f');

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAC9-1I1ktfv9eC0THZk8N77-HEd-bcZEY', 
    formatter: null     
  };

var geocoder = NodeGeocoder(options);

const generateLink = async(petitionDetail) =>{

    var rdr = new Rdr(petitionDetail);
    rdr.exp = Math.floor(Date.now() / 1000) + 2592000
    rdr.save()


    var campaign = await Campaign.findOne({campaignID: petitionDetail.campaignID})

    for(var i = 0; i < campaign.petitionActivities.length; i++){
        if( campaign.petitionActivities[i]._id.toString() === petitionDetail.activityID){
            var url = process.env.fe+ "/petition?dir=" + rdr._id
            campaign.petitionActivities[i].url = url
            campaign.save()
            return {url: url}
        }
    }
    
}

const processLink = async(rdrToken) =>{
    var activityDetails = await Rdr.findOne({_id: rdrToken.linkID})
    return activityDetails
}


const getNumSub = async(detail) =>{
    var query = {'petitionContactHistory.activityID': detail.activityID}

    var total = await Person.find(query).countDocuments();

    return {total:total}

}

const createPerson = async(detail) =>{

    var preExistCheckQuery = {}

    var foundPeople = []

    if(detail.person.emails != "" ) preExistCheckQuery.emails = detail.person.emails
    if(detail.person.phones != "") preExistCheckQuery.phones = detail.person.phones

    if(detail.person.emails != "" || detail.person.phones != ""){
        foundPeople = await Person.find(preExistCheckQuery)
    }


    if(foundPeople.length === 0){

        var person = new Person(detail.person);

        person.address = {city: detail.city.toUpperCase(),
                          county: detail.county,
                          state: "CA",
                          zip: detail.zip }

        if(detail.address != "" && detail.city != "" && detail.zip != ""){

            var fullAddress = detail.address
            if(detail.city) fullAddress = fullAddress + " " + detail.city + " CA"
            if(detail.zip) fullAddress = fullAddress + " " + detail.zip

            var address = parser.parseLocation(fullAddress);

            if(address.number) person.address.streetNum = address.number
            if(address.prefix) person.address.prefix = address.prefix.toUpperCase();
            if(address.street) person.address.street = address.street.toUpperCase();
            if(address.type) person.address.suffix = address.type.toUpperCase();
            if(detail.unit) person.address.unit = detail.unit.toUpperCase()

            var addressToGeocode = detail.address

            if(detail.unit) addressToGeocode = addressToGeocode + " " + detail.unit
            if(detail.city) addressToGeocode = addressToGeocode + " " + detail.city + " CA"
            if(detail.zip) addressToGeocode = addressToGeocode + " " + detail.zip

            /*
            await geocodio.geocode(addressToGeocode).then(response => {
                console.log(response.results[0].location.lat);
                console.log(response.results[0].accuracy_type)
                console.log(response.results[0].location.lng);
                person.address.location = {coordinates: [response.results[0].location.lng, response.results[0].location.lat], type: "Point"}
                person.address.locationAccuracy = response.results[0].accuracy_type
            }).catch(err => {
                console.log("THIS IS A TERRIBLE ERROR")
                console.error(err);
            });
            */
       
            await geocoder.geocode(addressToGeocode, function(err, res) {
                if(err) {console.log(err)}
                if(res) {
                    if(res[0]) {
                        person.address.location = {coordinates: [res[0].longitude, res[0].latitude], type: "Point"}
                        person.save()                        
                    }
                }
            });

           return {status: "NEWPERSON", person: person};
        }
        
        person.save()
        return {status: "NEWPERSON", person: person};
    }
    
    return {status: "EXISTS", person: foundPeople};  
}

const updatePerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});

    var isMember = false;
    
    person.firstName = detail.newDetail.firstName
    person.lastName = detail.newDetail.lastName
    person.middleName = detail.newDetail.middleName
    person.emails = detail.newDetail.email
    person.phones = detail.newDetail.phone

    person.address.city = detail.newDetail.city
    person.address.county = detail.newDetail.county
    person.address.zip = detail.newDetail.zip

    for(var i = 0; i <person.membership.length; i++){
        if(person.membership[i].orgID === detail.newDetail.orgID){
            isMember = true;
            break
        }
    }

    if(!isMember) person.membership.push({orgID: detail.newDetail.orgID})
    if(detail.newDetail.address != "" && detail.newDetail.city != "" && detail.newDetail.zip != ""){

        var fullAddress = detail.newDetail.address + " " + detail.newDetail.city + " CA " + detail.newDetail.zip
        var address = parser.parseLocation(fullAddress);

        if(address.number) person.address.streetNum = address.number
        if(address.street) person.address.street = address.street
        if(address.type) person.address.suffix = address.type

        await geocoder.geocode(fullAddress, function(err, res) {
            if(err) {console.log(err)}
            if(res) {
                if(res[0]) {
                    person.address.location = {coordinates: [res[0].longitude, res[0].latitude], type: "Point"} 
                }
            }
        });
    }
                     
    return person.save()
}


const uploadPetitions = async(data) =>{

    var orgID = data.body.orgID
    var activityID = data.body.activityID
    var userID = data.body.userID
    var campaignID = parseInt(data.body.campaignID)
    var scriptID = data.body.scriptID
        
    var strangeFile = data.files[0].buffer.toString('utf8')
    var lines = (strangeFile).split("\n");
    var headers = lines[0].split(",");
    var peopleObjs = []

    for(var i = 0; i < lines.length; i++ ){
        let personObj = {address: {}, preferredMethodContact: []}
        let currentLine = lines[i].split(",")

        if(currentLine.length <= 1){break}

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "city") {
                personObj.address["city"] = currentLine[j].toUpperCase()
                break
            }
        }

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "zip") {
                personObj.address["zip"] = currentLine[j]
                break
            }
        }

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "unit") {
                personObj.address["unit"] = currentLine[j].toUpperCase()
                break;
            }
        }

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "address"){

                var fullAddressString = currentLine[j] + " " + personObj["address"]["city"] + " " + "CA"
                if(personObj["address"]["zip"]) fullAddressString + " " + personObj["address"]["zip"]

                var address = parser.parseLocation(fullAddressString);     

                personObj.address.streetNum = address.number
                if(address.street) personObj.address.street = address.street.toUpperCase()
                if(address.type) personObj.address.suffix = address.type.toUpperCase()
                if(address.prefix) personObj.address.prefix = address.prefix.toUpperCase()
                //if(address.sec_unit_type && address.sec_unit_num ){personObj['address']['unit'] =  address.sec_unit_type.toUpperCase() + " " + address.sec_unit_num.toUpperCase()}

                break
            }
        }
        
        for(var j = 0; j < headers.length; j++){       
            if(headers[j] === "county") {
                personObj["address"]["county"] = currentLine[j].toUpperCase()
            }else if (headers[j] === "phones"){
                if(currentLine[j]){personObj[headers[j]] = currentLine[j].replace("(", "").replace(")", "").replace("-","").replace("-","")}
            }else if(headers[j] === "firstName"){
                personObj["firstName"] = currentLine[j]
            }else if(headers[j] === "middleName"){
                personObj["middleName"] = currentLine[j]
            }else if(headers[j] === "lastName"){
                personObj["lastName"] = currentLine[j]
            }
        }

        var isoDate;

        
        for(var k = 0; k < headers.length; k++){
            if(headers[k] === "pmc_phone"){
                if(currentLine[k] === "Y"){
                    personObj['preferredMethodContact'].push({orgID: orgID, optInProof: activityID, method: "PHONE"})
                }
            }else if(headers[k] === "pmc_email"){
                if(currentLine[k] === "Y"){
                    personObj['preferredMethodContact'].push({orgID: orgID, optInProof: activityID, method: "EMAIL"})
                }  
            }else if(headers[k] === "pmc_text"){
                if(currentLine[k] === "Y"){
                    personObj['preferredMethodContact'].push({orgID: orgID, optInProof: activityID, method: "TEXT"})
                }
            } else if(headers[k] === "date"){
                if(currentLine[k] != "date" && currentLine[k] != ""){
                    isoDate = new Date(currentLine[k]+"T00:00:00.000Z").toISOString()
                }
            }
        }

        personObj['petitionContactHistory'] = [{  campaignID: campaignID, 
                                                  orgID: orgID, 
                                                  activityID: activityID, 
                                                  identified: true,
                                                  idHistory: [{date: isoDate, 
                                                               scriptID: scriptID, 
                                                               idBy: userID, 
                                                               idResponses: [{question: "Complete the census form", responses: "Yes", idType: "POSITIVE"},
                                                                             {question: "Tell friends and family about census 2020", responses: "Yes", idType: "POSITIVE"}]
                                                              }]
                                                }]

        if(personObj['firstName'] != "firstName" && personObj["firstName"] != "" && personObj ['firstName'] != undefined){
            peopleObjs.push(personObj)
        }
    }

    var checkResults = await checkExisting(peopleObjs)

    for(var j = 0; j < checkResults.newPeople.length; j++){
        var person = new Person(checkResults.newPeople[j])
        person.save()
        checkResults.newPeople[j]._id = person._id
    }

    var fail = 0
    var success = 0

    async.eachSeries(checkResults.newPeople, function(newPerson, next){

        let addressString = ""

        if(newPerson.address.streetNum) addressString = addressString + newPerson.address.streetNum + " "
        if(newPerson.address.prefix) addressString = addressString + newPerson.address.prefix + " "
        if(newPerson.address.street) addressString = addressString + newPerson.address.street.replace(",", " ") + " "
        if(newPerson.address.suffix) addressString = addressString + newPerson.address.suffix + " "
        if(newPerson.address.unit) addressString = addressString + newPerson.address.unit + " "
        if(newPerson.address.city) addressString = addressString + newPerson.address.city + " "
        if(newPerson.address.zip) addressString = addressString + newPerson.address.zip

        geocoder.geocode(addressString, async function(err, res) {
            
            if(err) {
                fail++
                console.log(err)
            }
            if(res) {
                if(res[0]) {
                    success++;
                    
                    let person = await Person.findOne({"_id": newPerson._id})
                    person.address.location = {coordinates: [res[0].longitude, res[0].latitude], type: "Point"}
                    person.save()
                }
                else {
                    fail++
                }
            }
            console.log("SUCCESS: ", success, "FAILED: ", fail)
            next();
        });
    })

    return {msg: "PROCESSING",  existingPeople: checkResults.existingPeople, newPeople: checkResults.newPeople.length}
}

const checkExisting = async(people) =>{

    var existingPeople = [];
    var newPeople = [];

    for(var i = 0; i < people.length; i++){

        let existingPerson = await Person.findOne({"firstName": people[i].firstName, "middleName": people[i].middleName, "lastName": people[i].lastName})
    
        if(existingPerson){
            //if(existingPerson.phones.length > 0){existingPeople.push(existingPerson)
            //}else{newPeople.push(people[i])}
           existingPeople.push(existingPerson)
        }else{
            newPeople.push(people[i])
        }        
    }

    return ({existingPeople: existingPeople, newPeople: newPeople})
}

module.exports = {createPerson, updatePerson, getNumSub, generateLink, processLink, uploadPetitions}