var Person = require('../models/people/person')
var Parcel = require('../models/parcels/parcel')
var Target = require('../models/targets/target')
var async = require('async')
var parser = require('parse-address'); 


var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAC9-1I1ktfv9eC0THZk8N77-HEd-bcZEY', 
    formatter: null     
  };

const getCanvassPolygon = async(detail) =>{
    try {
        var targets = await Target.find({"_id": detail.targetIDs})

        return targets

    }catch(e){
        throw new Error(e.message)

    }
}

const getCanvassParcels = async(detail) =>{
    try {
        var targets = await Target.find({"_id": detail.targetIDs})

        var targetCoordinates = []
        var parcelSearchQuery = {
            "properties.assessorCodes.primary": {$ne: null},
            "properties.assessorCodes.realUse": {$ne: null},
            //$or: [{"properties.assessorCodes.realUse":"R1"},{"properties.assessorCodes.realUse":"SFR"}]
            //"properties.type": "RESIDENTIAL",
           }

        for(var i = 0; i < targets.length; i++){
            if(targets[i]['geometry']){
                targetCoordinates.push(targets[i]['geometry']['coordinates'][0])
            }
        }


        if(targetCoordinates.length > 0){
            parcelSearchQuery['properties.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" ,
                                                                                     coordinates: targetCoordinates}}}
        }

        var parcels = await Parcel.find(parcelSearchQuery)

        return parcels

    }catch(e){
        throw new Error(e.message)

    }
}


const getCanvassResidents = async(detail) =>{ 
    
    try{
        var targets = await Target.find({"_id": detail.targetIDs})
        var targetCoordinates = []

        var personSearchQuery = {}
        var hasQueries = false;

        var people = []

        for(var i = 0; i < targets.length; i++){
            if(targets[i]['geometry']){ targetCoordinates.push(targets[i]['geometry']['coordinates'][0])}
            if(targets[i].properties.queries.length > 0){hasQueries  = true;}
        }

        if(targetCoordinates.length > 0){
            personSearchQuery['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
            coordinates: targetCoordinates}}}
        }

        if(hasQueries){
            for(var i = 0; i < targets.length; i++){                                   
                for(var j = 0; j < targets[i].properties.queries.length; j++){
                    if(targets[i].properties.queries[j].queryType === "ORGMEMBERS"){
                        personSearchQuery['membership.orgID'] = targets[i].properties.queries[j].param
                    }
                    if(targets[i].properties.queries[j].queryType === "SCRIPT"){

                    }
    
                    if(targets[i].properties.queries[j].queryType === "TAGS"){
   
                    }
                }                                                             
            }

            people = await Person.find(personSearchQuery)
            return {targetResidents: people, nonTargetResidents: []}
        }

        people = await Person.find(personSearchQuery)

        return {nonTargetResidents: people, targetResidents: []}

    }catch(e){
        throw new Error(e.message)
    }
    
}

const addUnit = async(detail) =>{
    var person = await Person.findOne({"_id": detail.person._id});

    if (!person) person = await Person.findOne({"clientID": detail.person.clientID});
    person.address.unit = detail.unit
    return person.save()
    
}

const idPerson = async(detail)=>{

    var person = await Person.findOne({"_id": detail.person._id});

    if (!person) person = await Person.findOne({"clientID": detail.person.clientID});

    if(person.canvassContactHistory.length === 0){
        person.canvassContactHistory.push(detail.canvassContactHistory)
        console.log("PersonID: ", person._id)
        return person.save()


    }else{
        for (var i = 0; i < person.canvassContactHistory.length; i++){
            if(person.canvassContactHistory[i].activityID === detail.canvassContactHistory.activityID){
                person.canvassContactHistory[i].identified = detail.canvassContactHistory.identified;
                person.canvassContactHistory[i].refused = detail.canvassContactHistory.refused;
                person.canvassContactHistory[i].nonResponse = detail.canvassContactHistory.nonResponse;
                person.canvassContactHistory[i].idHistory.push(detail.canvassContactHistory.idHistory[0])
                console.log("PersonID: ", person._id)
                return person.save()
            }
        }

        person.canvassContactHistory.push(detail.canvassContactHistory)
        console.log("PersonID: ", person._id)
        return person.save()
    }
}

const nonResponse = async(nonResponseData) =>{
    var nonRespondedPeople = []

    for(var i = 0; i < nonResponseData.houseHold.length; i++){

        var person = await Person.findOne({"_id": nonResponseData.houseHold[i]._id});
        if (!person) person = await Person.findOne({"clientID": nonResponseData.houseHold[i].clientID});

        var activityHistoryExists = false;

        for(var j = 0; j < nonResponseData.scripts.length; j++){

            nonResponseData.canvassContactHistory.idHistory[0].scriptID = nonResponseData.scripts[j]._id 

            if(person.canvassContactHistory.length === 0){
                person.canvassContactHistory.push(nonResponseData.canvassContactHistory)
                console.log("PersonID: ", person._id)
                person.save()
                nonRespondedPeople.push(person)
                activityHistoryExists = true;
                
            }else{
                for (var k = 0; k < person.canvassContactHistory.length; k++){
                    if(person.canvassContactHistory[k].activityID === nonResponseData.canvassContactHistory.activityID){
                        activityHistoryExists = true;
                        person.canvassContactHistory[k].identified = nonResponseData.canvassContactHistory.identified;
                        person.canvassContactHistory[k].refused = nonResponseData.canvassContactHistory.refused;
                        person.canvassContactHistory[k].nonResponse = nonResponseData.canvassContactHistory.nonResponse;
                        person.canvassContactHistory[k].idHistory.push(nonResponseData.canvassContactHistory.idHistory[0])
                        console.log("PersonID: ", person._id)
                        person.save()
                        nonRespondedPeople.push(person)
                        break    
                    }
                }
            }
            
            if(!activityHistoryExists){
                console.log("New Activity History")
                person.canvassContactHistory.push(nonResponseData.canvassContactHistory)
                console.log("PersonID: ", person._id)
                person.save()
                nonRespondedPeople.push(person)
            }
        }
    }

    return nonRespondedPeople
}


const editPerson = async (data) =>{
    try{

        var person = await Person.findOne({"_id": data.person._id})
        if (!person) person = await Person.findOne({"clientID": data.person.clientID});

        person.firstName = data.newDetail.firstName;
        person.lastName = data.newDetail.lastName;
        person.phones = data.newDetail.phones;
        person.emails = data.newDetail.emails;
        return person.save()
        
    }catch(e){
        throw new Error(e.message)
    }
}

const createPerson = async(detail) =>{
    try{
        var person = new Person(detail);
        console.log("PersonID: ", person._id)

        person.save()
        return {status: "NEWPERSON", person: person};
    }catch(e){
        throw new Error(e.message)
    }
}

const reverseGeocode = async(detail) =>{
    try{
        var geocoder = NodeGeocoder(options);
        var googleAddress = []
    
        await geocoder.reverse({lat:detail.coordinates[1], lon: detail.coordinates[0]}, function(err, res) {
            if(err){console.log(err)}
            if(res){googleAddress = res}
        }, googleAddress);

        var address = parser.parseLocation(googleAddress[0].formattedAddress); 

        var parcel = await Parcel.findOne({"properties.location.coordinates": detail.coordinates})
    
        if(parcel){
            if(address.number) parcel.properties.address.streetNum = address.number
            if(address.prefix) parcel.properties.address.prefix = address.prefix
            if(address.street) parcel.properties.address.street = address.street.toUpperCase()
            if(address.type) parcel.properties.address.suffix = address.type.toUpperCase()
            if(address.city) parcel.properties.address.city = address.city.toUpperCase()
            if(address.state) parcel.properties.address.state = address.state.toUpperCase()
            if(address.zip) parcel.properties.address.zip = address.zip
            parcel.save()
        }

        var formattedAddress = {}

        if(address){
            if(address.number) formattedAddress.streetNum = address.number
            if(address.prefix) formattedAddress.prefix = address.prefix
            if(address.street) formattedAddress.street = address.street.toUpperCase()
            if(address.type) formattedAddress.suffix = address.type.toUpperCase()
            if(address.city) formattedAddress.city = address.city.toUpperCase()
            if(address.state) formattedAddress.state = address.state.toUpperCase()
            if(address.zip) formattedAddress.zip = address.zip
        }

        return formattedAddress


    }catch(e){

        throw new Error(e.message)
    }
}

const updateMarkerLocation = async(detail) =>{
    var person = await Person.findOne({_id: detail.person.data._id})
    person.address.location = detail.location
    return person.save()
}


module.exports = {getCanvassResidents, createPerson, idPerson, reverseGeocode, getCanvassPolygon, getCanvassParcels, editPerson, addUnit, nonResponse, updateMarkerLocation}

