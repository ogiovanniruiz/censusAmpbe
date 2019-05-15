var Person = require('../models/people/person')


const getUser = async(userDetail) =>{
    try{ return Person.findOne({'user.loginEmail': userDetail.email, 'user.password': userDetail.password}).exec(); 
    }catch(e){
        throw new Error(e.message)
    }
}

const registerUser = async(regDetail) => {
    personDetail = {firstName: regDetail.firstName, 
                    lastName: regDetail.lastName,
                    user: { loginEmail: regDetail.email, 
                            password: regDetail.password,
                            userCampaigns: [{campaignID: 0 , level: "TRIAL"}]
                          },
                    phone:  regDetail.phone,
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
                    user: {loginEmail: regDetail.email,
                           userCampaigns: [{campaignID: 000 , level: "TRIAL"}]},
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
    try{ return Person.find().exec(); 
    }catch(e){
        throw new Error(e.message)
    }
}

const updateUser = async(userDetail) =>{
    
    //console.log(userDetail.user)
    //console.log(userDetail.newUserLevel)
    //console.log(userDetail.userCampaign)

    var person = await Person.findOne({'user._id': userDetail.user._id});

    //console.log(person)

    for (var i = 0; i < person.user.userCampaigns.length; i++){
        console.log(person.user.userCampaigns[i].campaignID)
        console.log(userDetail.userCampaign.campaignID)
        if (person.user.userCampaigns[i].campaignID === userDetail.userCampaign.campaignID){
            console.log(person.user.userCampaigns[i])
            person.user.userCampaigns[i].level = userDetail.newUserLevel
        }
 
    }

    console.log(person)

    
    try{ return person.save()
    }catch(e){
        throw new Error(e.message)
    }
    
}

module.exports = {getUser, registerUser, getOauth, registerOauth, getAllUsers, updateUser}
