var PasswordReset = require('../models/passwordreset/passwordreset')
var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
var nodeMailer = require('nodemailer');
const sha256 =  require('sha256')
var jwt = require('jsonwebtoken');

const loginUser = async(userDetail) => {
    var person = await Person.findOne({'user.loginEmail': userDetail.email, 'user.password': sha256(userDetail.password)});
    var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
    
    try { 
        
        
        return {person: person, jwt: token} 
    

    } catch(e){
        throw new Error(e.message)
    }
}

const deleteUser = async(userDetail) =>{
    try{
        return Person.remove({_id: userDetail._id}).exec();
    } catch(e){
        throw new Error(e.message)
    }
}

const getUserProfile = async(userDetail) =>{
    var person = await Person.findOne({'user._id': userDetail.user._id});
    person.user.password = "you cant have the password"
    try { return person
    } catch(e){
        throw new Error(e.message)
    }
}

const registerUser = async(regDetail) => {

    var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
    var hashPassword = sha256(regDetail.password)

    var personDetail = {firstName: regDetail.firstName, 
                        lastName: regDetail.lastName,
                        user: { loginEmail: regDetail.email, 
                                password: hashPassword},
                        address:{city: regDetail.city, 
                                 state: "CA", 
                                 zip: regDetail.zip},
                        phones:  regDetail.phone,
                        emails: regDetail.email,
                        creationInfo: {regType: "SELF"}
                        }
    try {
        var person = new Person(personDetail);
        person.save();
        return {person: person, jwt: token}

    } catch(e){
        throw new Error(e.message)
    }
}

const passwordReset = async(email) => {
    var person = await Person.findOne({'user.loginEmail': email.email});

    if (person){
        if (person.user.password) {
            var personEmail = {email: email.email}
            try {
                var reset = new PasswordReset(personEmail);
                reset.save();

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
                    to: reset.email,
                    subject: 'Password Reset Instructions',
                    html: "Someone has requested a password reset for the following account:" + "reset.email" + "<br><br>" +
                        "If this was a mistake, just ignore this email and nothing will happen." + "<br><br>" +
                        "Click this link to set a new password: " + "<a href='https://outreach.censusie.org/passwordreset/?upr="+reset._id+"'>set a password here.</a>"
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });

                return {msg: "Email Sent"}

            } catch(e){
                throw new Error(e.message)
            }
        } else {
            return {msg: "OAuth"}
        }
    } else {
        return {msg: "User not found"}
    }
}


const setNewPassword = async(details) => {
    try{
        var passwordResetItem = await PasswordReset.findOne({'_id': details.upr});
        var person = await Person.findOne({'user.loginEmail': passwordResetItem.email});
        var hashPassword = sha256(details.password)

        person.user.password = hashPassword;
        person.save()

        return PasswordReset.remove({_id: details.upr}).exec();
    }catch(e){
        return ''
    }
}

const getOauth= async(userDetail) =>{
    var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
    var person = await Person.findOne({'user.loginEmail': userDetail.email, 
                                       'firstName': userDetail.given_name, 
                                       'lastName': userDetail.family_name}
                                      );
                                       
    try{ return {person: person, jwt: token}
    }catch(e){
        throw new Error(e.message)
    }
}

const registerOauth = async(regDetail) => {
    personDetail = {
        firstName: regDetail.given_name, 
                lastName: regDetail.family_name,
                    user: {loginEmail: regDetail.email},
                    emails: regDetail.email,
                    creationInfo: {regType: "SELF"}
                    }
    try{ 
        var person = new Person(personDetail);
        person.save();
        var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
        return {person: person, jwt: token}

    } catch(e){
        throw new Error(e.message)
    }
}

const getAllUsers = async(userDetail) =>{
    try{ return Person.find({"user": {$exists: true}}).exec(); 
    }catch(e){
        throw new Error(e.message)
    }
}

const updateUserLvl = async(userDetail) =>{

    var person = await Person.findOne({'user._id': userDetail.newUser._id});
    var campaign = await Campaign.findOne({campaignID: userDetail.campaignID});
    campaign.userIDs.push(userDetail.newUser._id)
    var index = campaign.requests.map(function(e) { return e.loginEmail }).indexOf(person.user.loginEmail)
    campaign.requests.splice(index, 1)
    campaign.save()

    person.user.userCampaigns.push({level:userDetail.newUserLvl, campaignID: userDetail.campaignID})
   

    try{ return person.save() 
    }catch(e){
        throw new Error(e.message)
    }
}

const updateDevStatus = async(userDetail)=>{
    var person = await Person.findOne({"user": {$exists: true}, 'user._id': userDetail.user._id});
    person.user.dev = userDetail.developer
    try{ return person.save()
    }catch(e){
        throw new Error(e.message)
    }
}

const updateAssetMapLvl = async(userDetail)=>{
    var person = await Person.findOne({'user._id': userDetail.person.user._id});
    person.user.assetMapLvl = userDetail.newUserLevel
    try{ return person.save()
    }catch(e){
        throw new Error(e.message)
    }
}

const editUser = async(userDetail) =>{
    console.log(userDetail)
}

const checkVersion = async(app) =>{
    var version = process.env.version

    if(app.version === version){
        return {sync: true, serverVersion: version}
    }

    return {sync: false, serverVersion: version}
}


const submitAgreement = async(data) =>{

    var person = await Person.findOne({"user": {$exists: true}, 'user._id': data.person.user._id});

    person.user.userAgreements.push({version: data.version})
    person.save()
    return {success: true}    
}

const updateDataManager = async(data) =>{
    
    var person = await Person.findOne({"user": {$exists: true}, '_id': data.member._id});

    if(person.user.dataManager.includes(data.campaignID)){
        console.log("EXISTS")
        for(var i = 0; i < person.user.dataManager.length; i++){
            if(person.user.dataManager[i] === data.campaignID){
                person.user.dataManager.splice(i, 1)
                return person.save()
            }
        }
        
    }else{
        console.log("DOES NOT")
        person.user.dataManager.push(data.campaignID)
        return person.save()
    }
}

module.exports = {updateDataManager,
                  submitAgreement,
                  checkVersion,
                  loginUser, 
                  registerUser,
                  passwordReset,
                  setNewPassword,
                  getOauth, 
                  registerOauth, 
                  getAllUsers, 
                  updateUserLvl, 
                  updateDevStatus, 
                  updateAssetMapLvl, 
                  getUserProfile, 
                  deleteUser, 
                  editUser
                }
