var CensusTract = require('../models/censustracts/censustract'); 


const getAllCensusTracts= async(parcelDetail) =>{
    try {
        if(parcelDetail.bounds){
            p0 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            p1 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._northEast.lat]
            p2 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._northEast.lat]
            p3 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._southWest.lat]
        
            p4 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
            var arrayCoords = [p0, p1, p2, p3, p4]

            var tracts = await CensusTract.find({"properties.location": {$geoWithin: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}})
            return tracts
        }

    } catch(e){
        throw new Error(e.message)
    }
}



module.exports = {getAllCensusTracts}
