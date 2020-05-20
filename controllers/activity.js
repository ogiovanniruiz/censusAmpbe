const activityService = require('../services/activity.js')


const createActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.createActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getActivities = async (req,res,next) =>{
    try{
        res.send(await activityService.getActivities(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.editActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const deleteActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.deleteActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


const getActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.getActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const completeActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.completeActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const activitySwordOutreachData = async (req,res,next) =>{
    try{
        res.send(await activityService.activitySwordOutreachData(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const sendSwordOutreach = async (req,res,next) =>{
    try{
        res.send(await activityService.sendSwordOutreach(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const activityTextImpressionsSwordOutreachData = async (req,res,next) =>{
    try{
        res.send(await activityService.activityTextImpressionsSwordOutreachData(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const sendTextImpressionsSwordOutreach = async (req,res,next) =>{
    try{
        res.send(await activityService.sendTextImpressionsSwordOutreach(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const releaseNumber = async (req,res,next) =>{
    try{
        res.send(await activityService.releaseNumber(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const resetActivity = async (req,res,next) =>{
    try{
        res.send(await activityService.resetActivity(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getEvents = async (req,res,next) =>{
    try{
        res.send(await activityService.getEvents(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = {getEvents, resetActivity, createActivity, getActivities, editActivity, deleteActivity, getActivity, completeActivity, activitySwordOutreachData, activityTextImpressionsSwordOutreachData, sendSwordOutreach, sendTextImpressionsSwordOutreach, releaseNumber};
