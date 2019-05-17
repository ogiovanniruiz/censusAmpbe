var Parcel = require('../models/parcels/parcel')

const getParcels = async(parcelDetail) =>{

    p0 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
    p1 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._northEast.lat]
    p2 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._northEast.lat]
    p3 = [parcelDetail.bounds._northEast.lng, parcelDetail.bounds._southWest.lat]

    p4 = [parcelDetail.bounds._southWest.lng, parcelDetail.bounds._southWest.lat]
    var arrayCoords = [p0, p1, p2, p3, p4]
        
    try{
        
        
        return Parcel.find({$and: [{"properties.assessorCodes.primary": { $ne: null}}, {"properties.assessorCodes.primary":{ $ne: 0}}], 
                      
                            "properties.type": parcelDetail.type, 
                            "properties.location": {$geoWithin: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}})
    }catch(e){throw new Error(e.message)}
}

const editParcel = async(parcelDetail) =>{
    try{
        var parcel = await Parcel.findOne({'properties.location.coordinates': parcelDetail.parcelData.location.coordinates});
        parcel.properties['asset'] = parcelDetail.assetDetail
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
        parcel.properties['asset'] = parcelDetail.assetDetail
        return parcel.save()
    } catch(e){throw new Error(e.message)}
}

module.exports = {getParcels, editParcel, createParcel, createAsset}
