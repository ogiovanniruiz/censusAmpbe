const ReportService = require('../services/report.js')

const updateReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.updateReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getCanvassSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getCanvassSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getPetitionSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getPetitionSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getOverallSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getOverallSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getEventsSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getEventsSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getActivitiesSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getActivitiesSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupCanvassSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupCanvassSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupCanvassSummaryReport2 = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupCanvassSummaryReport2(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupOrgSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupOrgSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupOrgSummaryReport2 = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupOrgSummaryReport2(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupOverallSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupOverallSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getBlockGroupOverallSummaryReport2 = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupOverallSummaryReport2(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {updateReport,
                  getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport,
                  getEventsSummaryReport,
                  getActivitiesSummaryReport,
                  getBlockGroupCanvassSummaryReport,
                  getBlockGroupCanvassSummaryReport2,
                  getBlockGroupOrgSummaryReport,
                  getBlockGroupOrgSummaryReport2,
                  getBlockGroupOverallSummaryReport,
                  getBlockGroupOverallSummaryReport2};
