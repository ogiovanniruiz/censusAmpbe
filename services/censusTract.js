var CensusTract = require('../models/censustracts/censustract'); 
var async = require('async');

const getAllCensusTracts= async(parcelDetail) =>{
    try {
        if(parcelDetail.bounds._southWest){
            p0 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            p1 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._northEast.lat]
            p2 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._northEast.lat]
            p3 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._southWest.lat]
        
            p4 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            var arrayCoords = [p0, p1, p2, p3, p4]

            var tracts = await CensusTract.find({"properties.location": {$geoWithin: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}})
            return tracts
        } else {
            //var tracts = await CensusTract.find({"properties.lrs": {$gte: 27.0}})
            var tracts = await CensusTract.find({},{properties:1})
            return tracts
        }

    } catch(e){
        throw new Error(e.message)
    }
}

const getAllBlockGroups = async()=>{
    try {
        var tracts = await CensusTract.find()
        return tracts
    } catch(e){
        throw new Error(e.message)
    }
}

const uploadOccupancy = async(detail) =>{

    try { 
        var stringFile = detail.files[0].buffer.toString('utf8');

        var lines = (stringFile).split("\n");
        var censustracts = await CensusTract.find();
    
        for (var i = 1; i < lines.length; i++) {
            var currentLine = lines[i].split(",");
            for (var j = 0; j < censustracts.length; j++) {
                var geoid = "0" + currentLine[0];
                if (geoid === censustracts[j].properties.geoid && censustracts[j].properties.lrs){
                    censustracts[j].properties.numOccupiedUnits = Number(currentLine[1]);
                    censustracts[j].save();
                    break;
                }
            }   
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllCensusTracts, uploadOccupancy, getAllBlockGroups}
