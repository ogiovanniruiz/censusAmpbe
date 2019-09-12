var Parcel = require('../models/parcels/parcel')
var Target = require('../models/targets/target')
var CensusTract = require('../models/censustracts/censustract')
var mongoose = require('mongoose');
var IdHistory = require('../models/parcels/idHistory')

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

const createParcel = async(parcelDetail) =>{
    try{
        var parcel = new Parcel(parcelDetail);
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
        idHistory = {idBy: detail.userID, 
                     locationIdentified: detail.locationIdentified}

        var canvassContactHistory = {
                                     campaignID: detail.campaignID,
                                     activityID: detail.activityID,
                                     orgID: detail.orgID,
                                     idHistory: idHistory
                                    }

        parcel.properties.canvassContactHistory.push(canvassContactHistory)
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

const search = async(parcelDetail) => {
    try{
        searchData = {}

        if(parcelDetail.streetNum) searchData['properties.address.streetNum'] = parcelDetail.streetNum
        if(parcelDetail.street) searchData['properties.address.street'] = parcelDetail.street
        if(parcelDetail.city) searchData['properties.address.city'] = parcelDetail.city
        if(parcelDetail.suffix) searchData['properties.address.suffix'] = parcelDetail.suffix
        if(parcelDetail.zip) searchData['properties.address.zip'] = parcelDetail.zip
        
        return Parcel.find(searchData)
    } catch(e){throw new Error(e.message)}
}


module.exports = {getParcels, 
                  editParcel, 
                  createParcel, 
                  createAsset, 
                  getAssets, 
                  deleteAsset, 
                  search, 
                  getCanvassParcels, getNumParcelsWithin, completeHousehold }
