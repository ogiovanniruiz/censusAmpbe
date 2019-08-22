const contactService = require('../services/contact.js')


const sendEmail = async (req,res,next) =>{
    try{
        res.send(await contactService.sendEmail(req.body))
    } catch(e){
        console.log(e.message)
        res.sendStatus(500)
    }
}


module.exports = {sendEmail};