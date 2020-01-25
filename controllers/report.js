const ReportService = require('../services/report.js')

const updateReport = async (req,res,next) =>{
    try{
        res.send(await ReportService.updateReport(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}

module.exports = { updateReport};