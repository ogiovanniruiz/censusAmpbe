const targetService = require('../services/target.js')

const getAllTargetProperties = async (req, res, next) => {
    try {
        res.send(await targetService.getAllTargetProperties(req.body))
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

const createTarget = async (req,res,next) =>{
    try{
        res.send(await targetService.createTarget(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editTarget = async (req,res,next) =>{
    try{
        res.send(await targetService.editTarget(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const unlockTarget = async (req, res, next) =>{

    try{
        res.send(await targetService.unlockTarget(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOrgTargets = async (req, res, next) =>{

    try{
        res.send(await targetService.getOrgTargets(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getParties = async (req, res, next) =>{

    try{
        res.send(await targetService.getParties(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = { getAllTargetProperties, 
                   lockTarget, 
                   removeTarget, 
                   createTarget, 
                   editTarget,
                   getAllTargets,
                   unlockTarget,
                   getOrgTargets,
                    getParties
                };