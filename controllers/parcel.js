const parcelService = require('../services/parcel.js')

const getParcels = async (req, res, next) => {
    try { res.send(await parcelService.getParcels(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAssets = async (req, res, next) => {
    try { res.send(await parcelService.getAssets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editParcel = async (req, res, next) => {
    try { res.send(await parcelService.editParcel(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createParcel = async (req,res, next) =>{
    try {res.send(await parcelService.createParcel(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createAsset = async (req,res,next) =>{
    try {res.send(await parcelService.createAsset(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const deleteAsset = async (req,res,next)=>{
    try {res.send(await parcelService.deleteAsset(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const search = async (req,res,next)=>{
    try {res.send(await parcelService.search(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCanvassParcels = async (req,res,next)=>{
    try {res.send(await parcelService.getCanvassParcels(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getNumParcelsWithin = async (req,res,next)=>{
    try {res.send(await parcelService.getNumParcelsWithin(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const completeHousehold = async (req,res,next)=>{
    try {res.send(await parcelService.completeHousehold(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const tagParcels = async (req,res,next)=>{
    try {res.send(await parcelService.tagParcels(req.body))
    } 
    catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {getParcels, 
                  editParcel, 
                  createParcel, 
                  createAsset, 
                  getAssets, 
                  deleteAsset, 
                  search, 
                  getCanvassParcels,
                  getNumParcelsWithin, completeHousehold, tagParcels};