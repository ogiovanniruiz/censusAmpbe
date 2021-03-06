const ReportService = require('../services/report.js')

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

const getBlockGroupOverallSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getBlockGroupOverallSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getPhonebankingSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getPhonebankingSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getTextingSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getTextingSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

const getPhonebankingUserSummaryReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.getPhonebankingUserSummaryReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = {getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport,
                  getEventsSummaryReport,
                  getActivitiesSummaryReport,
                  getBlockGroupCanvassSummaryReport,
                  getBlockGroupOverallSummaryReport,
                  getPhonebankingSummaryReport,
                  getTextingSummaryReport,
                  getPhonebankingUserSummaryReport};
