var nodeMailer = require('nodemailer');
var Campaign = require('../models/campaigns/campaign')
var Organization = require('../models/organizations/organization')
var Person = require('../models/people/person')

const sendEmail = async(detail) => {

    var campaign = await Campaign.findOne({"campaignID": detail.campaignID})
    var org = await Organization.findOne({"_id": detail.orgID})

    var dataManagers = await Person.find({"user.dataManager": campaign.campaignID});
    var dataManagersEmails = dataManagers.map(x => {return x.user.loginEmail})

    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'support@ieunited.org',
            pass: '7EA9e666!'
        }
    });

    //if(!detail.isBug){
        //for(var i = 0; i < dataManagersEmails.length; i++){

            let multiMailOptions = {
                to: 'luistirado79@gmail.com',
                subject: detail.subject,
                html:   "First Name: " + detail.userProfile.firstName + "<br>"
                      + "Last Name: " + detail.userProfile.lastName + "<br>"
                      + "Login Email: " + detail.userProfile.user.loginEmail + "<br>"
                      + "Org Name: " + org.name + "<br>"
                      + "Activity ID" + detail.activityID + "<br>"
                      + "Campaign Name: " + campaign.name + "<br>" 
                      + "Message: " + detail.message + "<br>"
                      + "Is a Bug: " + detail.isBug + "<br>"
                      + "HouseHold: " + JSON.stringify(detail.houseHold)
            };

            transporter.sendMail(multiMailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
        //}
    //}

    let mailOptions = {
        to: 'support@ieunited.org',
        subject: detail.subject,
        html:   "First Name: " + detail.userProfile.firstName + "<br>"
              + "Last Name: " + detail.userProfile.lastName + "<br>"
              + "Login Email: " + detail.userProfile.user.loginEmail + "<br>"
              + "Org Name: " + org.name + "<br>"
              + "Activity ID" + detail.activityID + "<br>"
              + "Campaign Name: " + campaign.name + "<br>" 
              + "Message: " + detail.message + "<br>"
              + "Is a Bug: " + detail.isBug + "<br>"
              + "HouseHold: " + JSON.stringify(detail.houseHold)
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
