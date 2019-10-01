var Person = require('../models/people/person')
var Target = require('../models/targets/target')

var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var ClientCapability = require('twilio').jwt.ClientCapability;
const  app_sid  = 'APcfa84370fade47d9de6493f08e73b6fa'
const accountSid = 'ACaa2284052d10b1610817013666b0ca9d';
const authToken = 'cb57765af76625d6ed79376cc411a2ca';

const getHouseHold = async(detail) => {
    var targets = await Target.find({"_id":{ $in: detail.targetIDs}})
    var searchParameters = {"phonebankContactHistory": {$not:{ $elemMatch: {activityID: detail.activityID, identified: true}}}}

    for(var i = 0; i < targets.length; i++){
        if(targets[i].properties.params.targetType === "ORGMEMBERS"){
            searchParameters['membership'] = targets[i].properties.params.id;
        }
    }

    var people = await Person.aggregate([ 
        {$match: searchParameters},
        {$group : { _id : {streetNum: "$address.streetNum", street: "$address.street"}, people: { $push: {firstName: '$firstName',
                                                               lastName: '$lastName', 
                                                               phones: '$phones',
                                                               emails: '$emails',
                                                               address: '$address',
                                                               phonebankContactHistory: '$phonebankContactHistory',
                                                               _id: "$_id"}}}}
        ]).allowDiskUse(true)
    
    console.log(people)
    try { return people[0] 
    } catch(e){
        throw new Error(e.message)
    } 
}


const getTwilioToken = async(detail) =>{

    var capability = new ClientCapability({
        accountSid: accountSid,
        authToken: authToken
      });
    
    capability.addScope(new ClientCapability.OutgoingClientScope({applicationSid: app_sid}));
    
    var token = capability.toJwt();

    return {token: token}
}

const call = async(detail) =>{

    console.log("Calling...");
    
    var number = detail.number;
  
    var twiml = new VoiceResponse();
    var dial = twiml.dial({callerId : detail.origin});
    
    dial.number(number);

    return twiml.toString();
}

module.exports = {getHouseHold, call, getTwilioToken}