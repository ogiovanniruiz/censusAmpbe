var nodeMailer = require('nodemailer');
var Campaign = require('../models/campaigns/campaign')
var Organization = require('../models/organizations/organization')

const sendEmail = async(detail) => {

    var campaign = await Campaign.findOne({"campaignID": detail.campaignID})
    var org = await Organization.findOne({"_id": detail.orgID})

    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'support@ieunited.org',
            pass: '7EA9e666!'
        }
    });

    let mailOptions = {
        to: 'support@ieunited.org',
        subject: detail.subject,
        html:   "First Name: " + detail.userProfile.firstName + "<br>"
              + "Last Name: " + detail.userProfile.lastName + "<br>"
              + "Login Email: " + detail.userProfile.user.loginEmail + "<br>"
              + "Asset Map Level: " + detail.userProfile.user.assetMapLvl + "<br>"
              + "Org Name: " + org.name + "<br>"
              + "Campaign Name: " + campaign.name + "<br>" 
              + "Message: " + detail.message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });

    return {msg: "Email Sent"}
    
}



module.exports = {sendEmail}