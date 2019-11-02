var Person = require('../models/people/person')
var Parcel = require('../models/parcels/parcel')
var Target = require('../models/targets/target')
var async = require('async')


const getCanvassResidents = async(detail) =>{  
    try{
        var targets = await Target.find({"_id": detail.targetIDs})
        var targetCoordinates = []

        var parcelSearchQuery = {"properties.assessorCodes.primary": {$ne: null},
                                 "properties.assessorCodes.realUse": {$ne: null},
                                //"properties.type": "RESIDENTIAL",
                                }
        var personSearchQuery = {}
        var hasQueries = false;

        var people = []
        var parcels = []

        for(var i = 0; i < targets.length; i++){
            if(targets[i]['geometry']){ 
                
                targetCoordinates.push(targets[i]['geometry']['coordinates'][0])
            }

            if(targets[i].properties.queries.length > 0){
                hasQueries  = true;
            }
        }

        if(targetCoordinates.length > 0){

            parcelSearchQuery['properties.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
            coordinates: targetCoordinates}}}

            personSearchQuery['address.location'] = {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
            coordinates: targetCoordinates}}}

        }

        parcels = await Parcel.find(parcelSearchQuery)

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
            return {targetResidents: people, parcels: parcels, nonTargetResidents: []}
        }

        people = await Person.find(personSearchQuery)

        return {nonTargetResidents: people, parcels: parcels, targetResidents: []}

    }catch(e){
        throw new Error(e.message)
    }
}

const idPerson = async(detail)=>{

}

const createPerson = async(detail) =>{
    try{
        var person = new Person(detail);

        person.save()
        return {status: "NEWPERSON", person: person};
    }catch(e){
        throw new Error(e.message)
    }
}





module.exports = {getCanvassResidents, createPerson, idPerson}