const targetService = require('../services/target.js')


const getAllTargets = async (req, res, next) => {
    try {
        res.send(await targetService.getAllTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllAssetTargets = async (req, res, next) => {
    try {
        res.send(await targetService.getAllAssetTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const removeTarget = async (req, res, next) => {
    try {
        res.send(await targetService.removeTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const lockTarget = async (req, res, next) => {
    try {
        res.send(await targetService.lockTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createAssetTarget = async (req,res,next) =>{
    try{
        res.send(await targetService.createAssetTarget(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const createTarget = async (req,res,next) =>{
    try{
        res.send(await targetService.createTarget(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = { getAllTargets, lockTarget, removeTarget, createAssetTarget, createTarget, getAllAssetTargets};