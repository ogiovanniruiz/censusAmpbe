var Person = require('../models/people/person')
var NodeGeocoder = require('node-geocoder');
var parser = require('parse-address');
var jwt = require('jsonwebtoken');
var Campaign = require('../models/campaigns/campaign') 

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAC9-1I1ktfv9eC0THZk8N77-HEd-bcZEY', 
    formatter: null     
  };

var geocoder = NodeGeocoder(options);

const generateLink = async(petitionDetail) =>{

    var campaign = await Campaign.findOne({campaignID: petitionDetail.campaignID})

    for(var i = 0; i < campaign.petitionActivities.length; i++){
        if( campaign.petitionActivities[i]._id.toString() === petitionDetail.activityID){
         
            var token = jwt.sign({ petitionDetail, iat: Math.floor(Date.now() / 1000) + 30 }, 'amplify');
            var url = process.env.fe+ "/petition?dir=" +token
            campaign.petitionActivities[i].url = url
            campaign.save()
            return {url: url}
        }
    }
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

            var fullAddress = detail.address + " " + detail.city + " CA " + detail.zip
            var address = parser.parseLocation(fullAddress);

            if(address.number) person.address.streetNum = address.number
            if(address.prefix) person.address.prefix = address.prefix.toUpperCase();
            if(address.street) person.address.street = address.street.toUpperCase();
            if(address.type) person.address.suffix = address.type.toUpperCase();

            await geocoder.geocode(fullAddress, function(err, res) {
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

module.exports = {createPerson, updatePerson, getNumSub, generateLink}