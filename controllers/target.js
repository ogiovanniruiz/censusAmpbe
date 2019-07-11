const targetService = require('../services/target.js')

const createCensusTarget = async (req, res, next) => {
    try {
        res.send(await targetService.createCensusTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllTargets = async (req, res, next) => {
    try {
        res.send(await targetService.getAllTargets(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const removeCensusTarget = async (req, res, next) => {
    try {
        res.send(await targetService.removeCensusTarget(req.body))
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}

const lockCensusTarget = async (req, res, next) => {
    try {
        res.send(await targetService.lockCensusTarget(req.body))
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



module.exports = {createCensusTarget, getAllTargets, lockCensusTarget, removeCensusTarget, createAssetTarget};