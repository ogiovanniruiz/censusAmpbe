var Parcel = require('../models/parcels/parcel')
var Target = require('../models/targets/target')
var CensusTract = require('../models/censustracts/censustract')
var mongoose = require('mongoose');
var IdHistory = require('../models/parcels/idHistory')
var Person = require('../models/people/person')
var async = require('async')
var parser = require('parse-address')
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https', 
    apiKey: 'AIzaSyAC9-1I1ktfv9eC0THZk8N77-HEd-bcZEY', 
    formatter: null     
  };
var geocoder = NodeGeocoder(options);

const getParcels = async(parcelDetail) =>{
    try{

        if(parcelDetail.bounds){
            p0 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            p1 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._northEast.lat]
            p2 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._northEast.lat]
            p3 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._southWest.lat]
        
            p4 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            var arrayCoords = [p0, p1, p2, p3, p4]

            return Parcel.find({$and: [{"properties.assessorCodes.primary": { $ne: null}}, {"properties.assessorCodes.primary":{ $ne: 0}}], 
                                        "properties.type": parcelDetail.type, 
                                        "properties.location": {$geoWithin: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}})

           // return Parcel.find({ "properties.location": {$geoWithin: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}})
        }
    }catch(e){throw new Error(e.message)}
}

const getCanvassParcels = async(parcelDetail) =>{

    try{

        var targets = await Target.find({"_id": parcelDetail.targetIDs})
        var targetCoordinates = []

        for(var i = 0; i < targets.length; i++){
            if(targets[i]['geometry']){
                targetCoordinates.push(targets[i]['geometry']['coordinates'][0])
            }
        }

        return Parcel.find({"properties.type": parcelDetail.type, "properties.assessorCodes.realUse": "R1",
                                "properties.location": {$geoIntersects: {$geometry: {type: "MultiPolygon" , 
                                                                                     coordinates: targetCoordinates}}}})
       
    }catch(e){throw new Error(e.message)}
}

const getNumParcelsWithin = async(parcelDetail) =>{

    try{
        var blockGroup = await CensusTract.findOne({"properties.geoid": parcelDetail.geoid})

        if(blockGroup['geometry']){
            var parcelCount = await Parcel.find({"properties.type": parcelDetail.type,  "properties.assessorCodes.realUse": "R1",
                         "properties.location": {$geoIntersects: {$geometry: {type: "Polygon" , 
                                                                              coordinates: blockGroup['geometry']['coordinates'][0]}}}}).countDocuments()
            return {parcelCount: parcelCount}
        }

    }catch(e){throw new Error(e.message)}
}


const getAssets = async(detail) =>{
    
    try{
        if (Object.entries(detail).length === 0 && detail.constructor === Object){
            return Parcel.find({"properties.asset": { $exists: true}})
        
        } else{

            var filteredAssets = []
            var assets = await Parcel.find({"properties.asset": { $exists: true}})

            for (var i = 0; i < assets.length; i++){
                for(var j = 0; j < assets[i].properties.asset.idResponses.length;  j++){

                    if(detail.locationType){
                        if(assets[i].properties.asset.idResponses[j].question === "Location Type" && detail.locationType.includes(assets[i].properties.asset.idResponses[j].responses)){
                            filteredAssets.push(assets[i])
                        }
                    }

                    if(detail.languageCapacity){
                        if(assets[i].properties.asset.idResponses[j].question === "Language Capacity"  && detail.languageCapacity.some(v=> assets[i].properties.asset.idResponses[j].responses.indexOf(v) !== -1)){
                            filteredAssets.push(assets[i])
                        }
                    }
                }
            }

            return filteredAssets

        }
    }catch(e){throw new Error(e.message)}
}

const editParcel = async(parcelDetail) =>{
    try{
        var parcel = await Parcel.findOne({'properties.location.coordinates': parcelDetail.properties.location.coordinates});
        parcel.properties['address'] = parcelDetail.address
        return parcel.save()
    } catch(e){throw new Error(e.message)}
}

const createParcel = async(detail) =>{
    try{

    var parcel = new Parcel(detail.parcelData);
    
    parcel.properties.address = {city: detail.address.city, 
                                 state: detail.address.state, 
                                 zip: detail.address.zip, 
                                 county: detail.address.county}

    var fullAddressString = detail.address.address + " " + detail.address.city + " " + detail.address.state + " " + detail.address.zip

    var address = parser.parseLocation(fullAddressString); 

    parcel.properties.address.unit =  detail.address.unit
    parcel.properties.address.streetNum = address.number
    if(address.street) parcel.properties.address.street = address.street.toUpperCase()
    if(address.type) parcel.properties.address.suffix = address.type.toUpperCase()
    if(address.prefix) parcel.properties.address.prefix = address.prefix.toUpperCase()

    parcel.properties.address.location = parcel.properties.location 

    return parcel.save();

    } catch(e){throw new Error(e.message)}

    
}

const createAsset = async(parcelDetail) => {

    try{
        var parcel = await Parcel.findOne({'properties.location.coordinates': parcelDetail.parcelData.location.coordinates});
        var idHistory = new IdHistory(parcelDetail.assetDetail)

        if(!parcel.properties.asset){
            parcel.properties.asset = idHistory
            return parcel.save()

        }else{
            parcel.properties.asset.locationIdentified = idHistory.locationIdentified
            parcel.properties.asset.scriptID = idHistory.scriptID
            parcel.properties.asset.comment = idHistory.comment
            parcel.properties.asset.idBy = idHistory.idBy
            parcel.properties.asset.idResponses = idHistory.idResponses

            return parcel.save()
        }

    } catch(e){throw new Error(e.message)}
}

const completeHousehold = async(detail) => {

    try{
        var parcel = await Parcel.findOne({'properties.location.coordinates': detail.parcel.properties.location.coordinates});
        parcel.properties.canvassContactHistory.push(detail.canvassContactHistory)
        return parcel.save()

    } catch(e){throw new Error(e.message)}
}

const deleteAsset = async(assetDetail) => {
    try{
        var parcel = await Parcel.findOne({'properties.location.coordinates': assetDetail.properties.location.coordinates});
        parcel.properties['asset'] = undefined
        return parcel.save()
    } catch(e){throw new Error(e.message)}
}

const search = async(address) => {
    try{

        var coords = []
        var status = ""
        var formattedAddress = ""
        await geocoder.geocode(address, async function(err, res) {
            if(err) {
                status = "Fail"   
            }
            if(res) {
                if(res[0]) {
                    console.log(res)
                    coords = [res[0].longitude, res[0].latitude]
                    formattedAddress = res[0].formattedAddress
                    status = "Success"
                }
                else {
                    status = "Fail"
                }
            }
        });

        return {coords: coords, status: status, formattedAddress: formattedAddress}
    } catch(e){throw new Error(e.message)}
}

const tagParcels = async (detail) =>{

    var people = await Person.find({"membership.orgID": detail.orgID})

    var matched = 0
    var failed = 0

    try{
        //for(var i = 0; i < people.length; i++){
        async.forEachLimit(people, 1000, function(person, callback){

            if(person.address.location.coordinates.length > 0){
                var parcelSearchQuery = {//"properties.type": "RESIDENTIAL",
                                        //$or: [{"properties.assessorCodes.realUse": "R1"}, {"properties.assessorCodes.realUse": "R2"}, {"properties.assessorCodes.realUse": "RC"}],
                                        //"properties.address.city": person.address.city,
                                        "properties.address.streetNum":person.address.streetNum,
                                        //"properties.address.street": person.address.street,
                                        "geometry": {$geoIntersects: {$geometry: {type: "Point" , 
                                                                                  coordinates: person.address.location.coordinates}}}}
                
        

                Parcel.findOne(parcelSearchQuery).exec(function (errr, parcel){
                    //console.log(detail.orgID)
                  
                    if(parcel) {
                        matched++;
                        //parcel.properties.membership = {orgID: detail.orgID}
                        //parcel.save()
                    }
                    if(!parcel) {failed++;
                        console.log(person.address)
                    
                    
                    }
                    console.log("Matched: ", matched, "Failed: ", failed, "Total: ", people.length)
                    return callback()
                    
                })
            }
        }, function(error){ console.log("DONE")})

        return {msg: "PROCESSING"}


    } catch(e){throw new Error(e.message)}


}




module.exports = {getParcels, 
                  editParcel, 
                  createParcel, 
                  createAsset, 
                  getAssets, 
                  deleteAsset, 
                  search, 
                  getCanvassParcels, getNumParcelsWithin, completeHousehold , tagParcels}
