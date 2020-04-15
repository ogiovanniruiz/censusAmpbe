const ScriptService = require('../services/script.js')

const createScript = async (req,res,next) =>{
    try{
        res.send(await ScriptService.createScript(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const editScript = async (req,res,next) =>{
    try{
        res.send(await ScriptService.editScript(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getAllScripts = async (req,res,next) =>{
    try{
        res.send(await ScriptService.getAllScripts(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getScript = async (req,res,next) =>{
    try{
        res.send(await ScriptService.getScript(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const deleteScript = async(req,res, next)=>{
    try{
        res.send(await ScriptService.deleteScript(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getActivityScripts = async(req,res, next)=>{
    try{
        res.send(await ScriptService.getActivityScripts(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


const getEveryScript = async(req,res, next)=>{
    try{
        res.send(await ScriptService.getEveryScript(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = { createScript, getAllScripts, getScript, deleteScript, getActivityScripts, editScript, getEveryScript};