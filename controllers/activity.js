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

const sendSwordOutreach = async (req,res,next) =>{
    try{
        res.send(await activityService.sendSwordOutreach(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const saveSwordOutreachRecord = async (req,res,next) =>{
    try{
        res.send(await activityService.saveSwordOutreachRecord(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {createActivity, getActivities, editActivity, deleteActivity, getActivity, completeActivity, sendSwordOutreach, saveSwordOutreachRecord};
