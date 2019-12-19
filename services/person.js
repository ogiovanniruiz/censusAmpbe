var Person = require('../models/people/person')
var Parcel = require('../models/parcels/parcel')
var NodeGeocoder = require('node-geocoder');
const https = require('https');
const axios = require('axios');
var parser = require('parse-address');
var Org = require('../models/organizations/organization.js') 

var async = require('async');

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAC9-1I1ktfv9eC0THZk8N77-HEd-bcZEY', 
    formatter: null     
  };

const getHouseHold = async(address) => {
    var people = await Person.find({"address.street": address.street, "address.streetNum": address.streetNum});
    try { return people
    } catch(e){
        throw new Error(e.message)
    }
}

const runMatch = async(data)=>{
 
    var strangeFile = data.files[0].buffer.toString('utf8')
    var lines = (strangeFile).split("\r\n");
    var headers = lines[0].split(",");

    for(var i = 0; i < lines.length; i++ ){

        let currentLine = lines[i].split(",")
        if(currentLine.length <= 1){break;}
        var person= await Person.findOne({"firstName": currentLine[0], "middleName": currentLine[1], "lastName": currentLine[2]});
        
        if(person){
            
            for(var j = 0; j < headers.length; j++){ 
                if(headers[j] === "address"){

                    var address = parser.parseLocation(currentLine[j]);  

                    person.address.streetNum = address.number
                    if(address.street) person.address.street = address.street.toUpperCase()
                    if(address.type) person.address.suffix = address.type.toUpperCase()
                    if(address.prefix) person.address.prefix = address.prefix.toUpperCase()                
                }

                if(headers[j] === "unit") {

                    person.address.unit = currentLine[j]
                    for(var k = 0; person.canvassContactHistory.length; k++){
                        person.canvassContactHistory[k].refused = false;
                        person.canvassContactHistory[k].nonResponse = false;
                    } 
                    person.save()

                }  
            }  
            console.log(person)   
        } 
    }
    return    
}

const editPerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});
    
    if(detail.newDetail.firstName) person.firstName = detail.newDetail.firstName
    if(detail.newDetail.lastName) person.lastName = detail.newDetail.lastName
    if(detail.newDetail.middleName) person.middleName = detail.newDetail.middleName
    if(detail.newDetail.email) person.emails = detail.newDetail.email
    if(detail.newDetail.phone) person.phones = detail.newDetail.phone
    
    if(detail.newDetail.streetNum) person.address.streetNum = detail.newDetail.streetNum
    if(detail.newDetail.prefix) person.address.prefix = detail.newDetail.prefix
    if(detail.newDetail.street) person.address.street = detail.newDetail.street
    if(detail.newDetail.suffix) person.address.suffix = detail.newDetail.suffix
    if(detail.newDetail.unit) person.address.unit = detail.newDetail.unit
    if(detail.newDetail.city) person.address.city = detail.newDetail.city
    if(detail.newDetail.county) person.address.county = detail.newDetail.county
    if(detail.newDetail.location) person.address.location = detail.newDetail.location
    if(detail.newDetail.state) person.address.state = detail.newDetail.state
    if(detail.newDetail.zip) person.address.zip = detail.newDetail.zip
    if(detail.newDetail.tags){

    for(var i = 0; i < person.membership.length; i++){
        if(person.membership[i].orgID === detail.newDetail.orgID){
                person.membership[i].tags = detail.newDetail.tags
            }
        }
    }
                    
    if(detail.newDetail.dob) person.demographics.dob = detail.newDetail.dob
    if(detail.newDetail.gender) person.demographics.gender = detail.newDetail.gender
    if(detail.newDetail.htcGroups) person.demographics.htcGroups = detail.newDetail.htcGroups
    if(detail.newDetail.languages) person.demographics.languages = detail.newDetail.languages

    if(detail.newDetail.party) person.voterInfo = {party: detail.newDetail.party}

    return person.save()
}

const createPerson = async(detail) =>{

    var foundPeople = await Person.find({"emails": {$not: {$size: 0}, $ne: ""}, "phones": {$not: {$size: 0}, $ne: ""}, $or: [{"emails": detail.emails}, {"phones": detail.phones}]})

    if(foundPeople.length === 0){

        var person = new Person(detail);

        if(!detail.address.location){

            var addressString = ""

            if(detail.address.streetNum) addressString = addressString + detail.address.streetNum + "+"
            if(detail.address.prefix) addressString = addressString + detail.address.prefix + "+"
            if(detail.address.street) addressString = addressString + detail.address.street.replace(",", "+") + "+"
            if(detail.address.suffix) addressString = addressString + detail.address.suffix + "+"
            if(detail.address.city) addressString = addressString + detail.address.city + "+"
            if(detail.address.zip) addressString = addressString + detail.address.zip
            
            var searchString = "https://nom.ieunited.org/?format=json&addressdetails=2&q=" + addressString + "&format=json&limit=1"
    
            var coordinates = await axios.get(searchString).then(response => {
                return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)]
            }).catch(error => {console.log(error)});
    

            person.address.location.coordinates = coordinates
            person.address.location.type = "Point"

        }

        person.save()
        return {status: "NEWPERSON", person: person};

    } else{
        return {status: "EXISTS", person: foundPeople};
    }
}

const getMembers = async(detail) =>{
    var people = await Person.find({"membership.orgID": detail.orgID})
    return people
}

const uploadMembers = async(detail) =>{

    var geocoder = NodeGeocoder(options);
    var peopleObjs = constructUploadPeopleObjArray(detail);

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

       // console.log(addressString)
        
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

    return {msg: "PROCESSING",  existingPeople: checkResults.existingPeople}


}

const checkExisting = async(people) =>{

    var existingPeople = [];
    var newPeople = [];

    for(var i = 0; i < people.length; i++){

        let existingPerson = await Person.findOne({"phones": people[i].phones})
    
        if(existingPerson){

            if(existingPerson.phones.length > 0){
                existingPeople.push(existingPerson)
            }else{
                newPeople.push(people[i])
            }
        
        } 
        else{

            newPeople.push(people[i])
        }        
    }

    

    return ({existingPeople: existingPeople, newPeople: newPeople})
}

const constructUploadPeopleObjArray = function(data){

    var strangeFile = data.files[0].buffer.toString('utf8')
    var lines = (strangeFile).split("\n");
    var headers = lines[0].split(",");

    var peopleObjs = []

    for(var i = 0; i < lines.length; i++ ){
        let personObj = {address: {}, demographics:{}, voterInfo: {}}
        let currentLine = lines[i].split(",")

        if(currentLine.length <= 1){break;}

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "city") {
                personObj.address["city"] = currentLine[j].toUpperCase()
                break;
            }
        }

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "zip") {
                personObj.address["zip"] = currentLine[j]
                break;
            }
        }

        for(var j = 0; j < headers.length; j++){ 
            if(headers[j] === "unit") {
                personObj.address["unit"] = currentLine[j]
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
                //if(address.sec_unit_type || address.sec_unit_num ){
                  //  personObj['address']['unit'] =  address.sec_unit_type.toUpperCase() + " " + address.sec_unit_num.toUpperCase()
                //}

                break;
            }

        }

        for(var j = 0; j < headers.length; j++){       
            if(headers[j] === "county") {
                personObj["address"]["county"] = currentLine[j].toUpperCase()
            }else if(headers[j] === "gender") {
                personObj['demographics']['gender'] = currentLine[j].toUpperCase()
            }else if(headers[j] === "birthDate") {
                personObj['demographics']["dob"] = currentLine[j]
            }else if(headers[j] === "party") {
                personObj["voterInfo"]["party"] = currentLine[j].toUpperCase()
            }else if (headers[j] === "phones"){
                if(currentLine[j]){personObj[headers[j]] = currentLine[j].replace("(", "").replace(")", "").replace("-","").replace("-","")}
            }else if(headers[j] === "voterID"){
                personObj["voterInfo"]["voterID"] = currentLine[j]
            }else if(headers[j] === "firstName"){
                personObj["firstName"] = currentLine[j]
            }else if(headers[j] === "middleName"){
                personObj["middleName"] = currentLine[j]
            }else if(headers[j] === "lastName"){
                personObj["lastName"] = currentLine[j]
            }
        }

        personObj["membership"] = {orgID: data.body.orgID}

        var selectedTags = data.body.selectedTags.split(",")

       if(data.body.selectedTags){
            personObj['membership']['tags'] = selectedTags
        }

        if(personObj['firstName'] != "firstName" && personObj["firstName"] != "" && personObj ['firstName'] != undefined){
            peopleObjs.push(personObj)
        }
    }


    return peopleObjs
}


const idPerson = async(detail) =>{
    
    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.script._id,
                     idBy: detail.userID,
                     idResponses: detail.idResponses,
                     locationIdentified: detail.location}

    if (detail.activityType === "Phonebank"){

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
    } else if(detail.activityType === "Petition"){
        if(person.petitionContactHistory.length === 0){

            var petitionContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.petitionContactHistory.push(petitionContactHistory)
            return person.save()

        }else{


            for (var i = 0; i < person.petitionContactHistory.length; i++){
                if(person.petitionContactHistory[i].activityID === detail.activityID){
                    person.petitionContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var petitionContactHistory = {
                                            campaignID: detail.campaignID,
                                            activityID: detail.activityID,
                                            orgID: detail.orgID,
                                            idHistory: idHistory
                                        }

            person.petitionContactHistory.push(petitionContactHistory)
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
        
    }else if(detail.activityType === "Petition"){
        for(var i = 0; i < person.petitionContactHistory.length; i++){
            if(person.petitionContactHistory[i].activityID === detail.activityID){
                person.petitionContactHistory[i].identified = true;
                return person.save()
            }
        }
    }
    else if(detail.activityType === "Canvass"){
        for(var i = 0; i < person.canvassContactHistory.length; i++){
            if(person.canvassContactHistory[i].activityID === detail.activityID){
                person.canvassContactHistory[i].identified = true;
                return person.save()
            }
        }
    }
}

const assignPreferredMethodOfContact = async(detail) =>{

    if(detail.preferredMethodOfContact){
        var person = await Person.findOne({"_id": detail.person._id});

        for(var i = 0; i < detail.preferredMethodOfContact.length; i++){
            var method = {orgID: detail.orgID, optInProof: detail.activityID, method: detail.preferredMethodOfContact[i]}
            person.preferredMethodContact.push(method)
        }
    
        person.save()
    }
    
    return 
}

const assignTags = async(detail) =>{
    var person = await Person.findOne({"_id": detail.person._id});

    for(var i = 0; i < person.membership.length; i++){
        if(person.membership[i].orgID === detail.orgID){
            for(var j = 0; j < detail.tags.length; j++){
                person.membership[i].tags.push(detail.tags[j])

            }

        } 
    }

    return person.save()
}


module.exports = {getHouseHold, 
                  editPerson, 
                  createPerson, 
                  idPerson, 
                  getMembers, 
                  uploadMembers, 
                  runMatch, 
                  finishIdentification,
                  assignPreferredMethodOfContact,
                  assignTags}
