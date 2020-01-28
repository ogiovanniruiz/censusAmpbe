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

module.exports = {updateReport,
                  getCanvassSummaryReport,
                  getPetitionSummaryReport,
                  getOverallSummaryReport};
