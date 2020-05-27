var Organization = require('../models/organizations/organization'); 
var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
const fs = require('fs');
var url = require('url');

const createOrganization = async(newOrgDetail) =>{   
    var orgDetail = { name: newOrgDetail.name,
                      description: newOrgDetail.description,
                      userIDs: [newOrgDetail.userID]
    }

    var organization = new Organization(orgDetail);
    organization.save();

    var person = await Person.findOne({'user._id': newOrgDetail.userID});
    person.user.userOrgs.push({level: "ADMINISTRATOR", orgID: organization._id});

    try {
        return person.save()        
    } catch(e){
        throw new Error(e.message)
    }
}

const editOrganization = async(detail) =>{

    var org = await Organization.findOne({"_id": detail.orgID})

    org.name = detail.name
    org.description = detail.description

    return org.save()
}


const getUserOrganizations = async(userDetail) =>{
    var orgArray = userDetail.user.userOrgs

    var adminOrgIds = orgArray.map(function(org) {
        if (org.level === "ADMINISTRATOR"){
            return org.orgID
        }
    })

    var leadOrgIds = orgArray.map(function(org) {
        if (org.level === "LEAD"){
            return org.orgID
        }
    })

    var volOrgIds = orgArray.map(function(org) {
        if (org.level === "VOLUNTEER"){
            return org.orgID
        }
    })

    var adminOrgs = await Organization.find({_id: {$in: adminOrgIds}})
    var leadOrgs = await Organization.find({_id: {$in: leadOrgIds}})
    var volOrgs = await Organization.find({_id: {$in: volOrgIds}})

    try {
        return {adminOrgs: adminOrgs, leadOrgs: leadOrgs, volOrgs: volOrgs}
    } catch(e){
        throw new Error(e.message)
    } 
}

const getAllOrganizations = async(userDetail) =>{
    var orgs = await Organization.find()

    try {
        return orgs
    } catch(e){
        throw new Error(e.message)
    } 
}

const requestOrganization = async(detail) =>{
    try{
        var person = await Person.findOne({'user._id': detail.userID})
        var org = await Organization.findOne({_id: detail.orgID})
        
        var userExists = await Organization.findOne({userIDs: person.user._id, _id: detail.orgID})
        if (userExists) return {msg:"User already Exists."}
        
        var requestExists = await Organization.findOne({requests: person.user._id, _id: detail.orgID})
        if(requestExists) return {msg:"Already Requested."}
        
        var userID = person.user._id
        org.requests.push(userID)

        return org.save()
        
    } catch(e){
        throw new Error(e.message)
    } 
}

const getOrganization = async(orgDetail) =>{
    try {
        return Organization.findOne({_id: orgDetail.orgID}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

const getOrgMembers = async(orgDetail) =>{

    var members = await Person.find({'user': {$exists: true}, 'user._id': {$in: orgDetail.userIDs}})
    var requests = await Person.find({'user': {$exists: true},'user._id': {$in: orgDetail.requests}})

    var memberList = {members: members, requests: requests}

    try {
        return memberList
    } catch(e){
        throw new Error(e.message)
    }    
}


const updateOrgLevel = async(detail) =>{

    var userID = detail.person.user._id
    var orgID = detail.org._id
    var status = detail.status

    var person = await Person.findOne({'user._id': userID})
    var org = await Organization.findOne({_id: detail.org._id})

    if (org.requests.includes(userID)){
        for( var i = 0; i < org.requests.length; i++){ 
            if (org.requests[i] === userID) {
                org.requests.splice(i, 1); 
            }
        } 
    } 

    for( var i = 0; i < org.userIDs.length; i++){ 
        if (org.userIDs[i] === userID) {
            org.userIDs.splice(i, 1); 
        }
    }

    if (status === "REMOVE"){
        for( var i = 0; i < person.user.userOrgs.length; i++){ 
            if (person.user.userOrgs[i].orgID === orgID) {
                person.user.userOrgs.splice(i,1)
            }
        }
    } else {

        org.userIDs.push(userID)
        var userOrgExists = false

        for( var i = 0; i < person.user.userOrgs.length; i++){ 
            if (person.user.userOrgs[i].orgID === orgID) {
                person.user.userOrgs[i].level = status
                userOrgExists = true
            }
        }

        if (userOrgExists === false){
            person.user.userOrgs.push({level: status, orgID: orgID})
        }
    }

    try {
        person.save()
        return org.save()
    } catch(e){
        throw new Error(e.message)
    }  
   
}


const getCampaignOrgs = async(campaignDetail) =>{
    
    var campaign = await Campaign.findOne({campaignID: campaignDetail.campaignID})
    var orgIDs = campaign.orgIDs
    var orgs = await Organization.find({_id: {$in: orgIDs}})

    try {
        return orgs
    } catch(e){
        throw new Error(e.message)
    }    
}

const dbPatch = async(detail) =>{

    var orgs = await Organization.find();
    var person = await Person.findOne({'user._id': detail.userID});

    try{
        for(var i = 0; i < orgs.length; i++){

            if(orgs[i].userIDs.includes(detail.userID)){
    
            }else{
        
                orgs[i].userIDs.push(detail.userID)
                orgs[i].save()
                person.user.userOrgs.push({level: "ADMINISTRATOR", orgID: orgs[i]._id})
                
            }
        }
        person.save()
    
        return {msg: "processing"}
        
    } catch(e){
        throw new Error(e.message)
    }
}


const createTag= async(detail) =>{
    var org = await Organization.findOne({"_id": detail.orgID})

    org.orgTags.push(detail.tag)
    return org.save()
}

const getOrgTags= async(detail)=>{
    var org = await Organization.findOne({"_id": detail.orgID})
    return org.orgTags
}

const uploadLogo = async(data) =>{

    var imageData = data.files[0].buffer
    if(imageData.length> 100000) return {msg: "Too Big"}
    
    var orgID = data.body.orgID
    var fileDir = 'public/images/' + orgID + ".png"
    
    fs.writeFile(fileDir, imageData, 'binary', function(err){
        if (err) throw err
        console.log('File saved.')
    })

}

const getOrgLogo = async(data) =>{

    try{
        var orgID = data.orgID
        var fileDir = 'public/images/' + orgID + ".png"
        return {image:fs.readFileSync(fileDir)}

    } catch(err){
        if(err.code == 'ENOENT'){
            console.log("No Logo Exists")
        }else{
            console.log(err)
        }
    }
}

const createTwilioSubAccount = async(orgID) =>{
    try{
        var org = await Organization.findOne({"_id": orgID.orgID})
        const superClient = require('twilio')("ACa75c4991d267cf482e49798a667157e1", "f4fbc33e1d6b0fba8d8b0bedd909238a");
        var accountExists = false;
        var existingAccount = {}
        var orgName = org.name.substring(0, 63);
        
        await superClient.api.accounts.list({friendlyName: orgName, status: "active", limit: 20})
                           .then(accounts => accounts.forEach(a => 
                            {
                                accountExists = true
                                existingAccount = a
                            }
                           ));

        if(!accountExists){             
            var account = await superClient.api.accounts.create({friendlyName: orgName}).then(account => {
                return account;
            });

            org.twilioAccount.sid = account.sid;
            org.twilioAccount.authToken = account.authToken;

            var voice_url = process.env.be + '/phonebank/call'
            

            const subClient = require('twilio')(account.sid, account.authToken);

            var app = await subClient.applications.create({voiceMethod: 'POST', voiceUrl: voice_url,friendlyName: 'voice_api'})
                                        .then(application => {
                                            
                                            console.log(application.sid)
                                            return application
                           });
            org.twilioAccount.app_sid = app.sid
            return org.save();

        }else{
            org.twilioAccount.sid = existingAccount.sid;
            org.twilioAccount.authToken = existingAccount.authToken;
            const subClient = require('twilio')(existingAccount.sid, existingAccount.authToken);

            var voice_url = process.env.be + '/phonebank/call'
            var app = await subClient.applications.create({voiceMethod: 'POST', voiceUrl: voice_url, friendlyName: 'voice_api'})
                                        .then(application => {
                                            
                                            console.log(application.sid)
                                            return application
                           });
            org.twilioAccount.app_sid = app.sid
            return org.save();
        }

    } catch(err){
        console.log(err)
        return err
    }
}

const getOrgPhoneNumbers = async(detail) =>{

    var org = await Organization.findOne({"_id": detail.orgID})

    if(org.twilioAccount.sid && org.twilioAccount.authToken){
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var numbers = await client.incomingPhoneNumbers
        .list({limit: 20})
        .then(incomingPhoneNumbers => {return incomingPhoneNumbers//.map(i => i.phoneNumber)
        
        });
        return numbers
    }

    return null
}

const getOrgPhoneNumbersFilter = async(detail) =>{
    const agg = [
        {
            '$match': {
                'orgIDs': detail.orgID
            }
        }, {
            '$unwind': {
                'path': '$textActivities'
            }
        }, {
            '$unwind': {
                'path': '$textActivities.phoneNums'
            }
        }, {
            '$match': {
                'textActivities.phoneNums.number': {
                    '$in': detail.numbers
                },
                'textActivities.activityMetaData.complete': false
            }
        }, {
            '$group': {
                '_id': null,
                'filteredNums': {
                    '$push': '$$ROOT.textActivities.phoneNums.number'
                }
            }
        }
    ];

    var numbers = await Campaign.aggregate(agg);
    return numbers
};

const checkTwilioSubAccount = async(detail) =>{
    var org = await Organization.findOne({"_id": detail.orgID})
    const superClient = require('twilio')("ACa75c4991d267cf482e49798a667157e1", "f4fbc33e1d6b0fba8d8b0bedd909238a");
    var accountExists = false;

    var orgName = org.name.substring(0, 63);
    
    await superClient.api.accounts.list({friendlyName: orgName, status: "active", limit: 20})
                       .then(accounts => accounts.forEach(a => 
                        {
                            accountExists = true
                            existingAccount = a
                        }
                       ));

    if(!accountExists){ 
        return {msg: "Account does not exist", status: false}
    }else{
        return {msg: "Account Exists", status: true}
    }
}

const buyPhoneNumber = async(detail) =>{
    var org = await Organization.findOne({"_id": detail.orgID})

    if(org.twilioAccount.sid && org.twilioAccount.authToken){
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

    await client.incomingPhoneNumbers
      .create({areaCode: detail.areaCode})
      .then(incoming_phone_number => console.log(incoming_phone_number.sid));
    }

    return { msg: "Success", status: true}
}

const enableTexting = async(detail) =>{
    var org = await Organization.findOne({"_id": detail.orgID})

    if(org.twilioAccount.sid && org.twilioAccount.authToken){
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var numbers = await client.incomingPhoneNumbers
        .list({limit: 20})
        .then(incomingPhoneNumbers => {return incomingPhoneNumbers});

        var updatedNumbers = []

        var sms_url = process.env.be + '/texting/receiveTexts'

        for(var i = 0; i < numbers.length; i++){

            var updatedNumber = await client.incomingPhoneNumbers(numbers[i].sid)
            .update({
                smsUrl: sms_url
                //smsUrl: 'https://dev.outreach.be.censusie.org/texting/receiveTexts',
            }).then(incoming_phone_number => {return incoming_phone_number});

            updatedNumbers.push(updatedNumber)
        }

        return updatedNumbers
    
    }
}

const getCities = async(detail) =>{

    var cities = await Person.distinct("address.city", { "membership.orgID": "5d5c37c31cc3b6002356cb1c" })
    return cities

}

module.exports = {
                getCities,
                    createOrganization, 
                  editOrganization,
                  getAllOrganizations, 
                  getOrganization, 
                  requestOrganization, 
                  getUserOrganizations, 
                  getOrgMembers, 
                  updateOrgLevel,
                  getCampaignOrgs,
                  dbPatch,                  
                  getOrgPhoneNumbers,
                  getOrgPhoneNumbersFilter,
                  enableTexting,
                  createTag, getOrgTags, uploadLogo, getOrgLogo, createTwilioSubAccount, checkTwilioSubAccount, buyPhoneNumber}
