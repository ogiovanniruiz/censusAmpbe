const UpdateService = require('../services/update.js')

const updateReport = async (req,res,next) =>{
    try{
        res.send(await UpdateService.updateReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateImpressions = async (req,res,next) =>{
    try{
        res.send(await UpdateService.updateImpressions(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateImpressions2 = async (req,res,next) =>{
    try{
        res.send(await UpdateService.updateImpressions2(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateImpressions3 = async (req,res,next) =>{
    try{
        res.send(await UpdateService.updateImpressions3(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const updateAddressGeocode = async (req,res,next) =>{
    try{
        res.send(await UpdateService.updateAddressGeocode(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}



module.exports = {updateReport,
                  updateImpressions,
                  updateImpressions2,
                  updateImpressions3,
                  updateAddressGeocode};
