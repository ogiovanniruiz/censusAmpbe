var Parcel = require('../models/parcels/parcel')

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

const getAssets = async() =>{
    try{
        return Parcel.find({"properties.asset": { $exists: true}})
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
        parcel.properties['asset'] = parcelDetail.assetDetail
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

    searchData = {}

    if(parcelDetail.streetNum) searchData['properties.address.streetNum'] = parcelDetail.streetNum
    if(parcelDetail.street) searchData['properties.address.street'] = parcelDetail.street
    if(parcelDetail.city) searchData['properties.address.city'] = parcelDetail.city
    if(parcelDetail.suffix) searchData['properties.address.suffix'] = parcelDetail.suffix
    if(parcelDetail.zip) searchData['properties.address.zip'] = parcelDetail.zip

    try{
        return Parcel.find(searchData)
    } catch(e){throw new Error(e.message)}
}

module.exports = {getParcels, editParcel, createParcel, createAsset, getAssets, deleteAsset, search}
