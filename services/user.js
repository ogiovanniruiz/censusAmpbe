var Person = require('../models/people/person')
var Campaign = require('../models/campaigns/campaign')
const sha256 =  require('sha256')

const loginUser = async(userDetail) => {

    var person = await Person.findOne({'user.loginEmail': userDetail.email, 'user.password': sha256(userDetail.password)});
    try { return person 
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
        return person.save();

    } catch(e){
        throw new Error(e.message)
    }
}

const getOauth= async(userDetail) =>{
    try{ return Person.findOne({'user.loginEmail': userDetail.email, 
                                'firstName': userDetail.given_name, 
                                'lastName': userDetail.family_name}).exec(); 
    }catch(e){
        throw new Error(e.message)
    }
}

const registerOauth = async(regDetail) => {
    personDetail = {firstName: regDetail.given_name, 
                    lastName: regDetail.family_name,
                    user: {loginEmail: regDetail.email},
                    emails: regDetail.email,
                    creationInfo: {regType: "SELF"}
                    }
    try{ 
        var person = new Person(personDetail);
        return person.save();

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

module.exports = {loginUser, registerUser, getOauth, registerOauth, getAllUsers, updateUserLvl, updateDevStatus, updateAssetMapLvl, getUserProfile, deleteUser}
