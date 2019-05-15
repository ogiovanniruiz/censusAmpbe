var Parcel = require('../models/parcels/parcel')

const getParcels = async(parcelDetail) =>{    
    try{return Parcel.find({"properties.address.city": parcelDetail.city, "properties.type": parcelDetail.type}).exec(); 
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
    console.log(parcelDetail)
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
