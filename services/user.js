var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
const sha256 =  require('sha256')
var jwt = require('jsonwebtoken');

const loginUser = async(userDetail) => {
    var person = await Person.findOne({'user.loginEmail': userDetail.email, 'user.password': sha256(userDetail.password)});
    var token = jwt.sign({ version: process.env.version, exp: Math.floor(Date.now() / 1000) + 21600 }, 'amplify');
    
    try { return {person: person, jwt: token} 
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


module.exports = {
                  submitAgreement,
                  checkVersion,
                  loginUser, 
                  registerUser, 
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