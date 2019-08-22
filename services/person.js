var Person = require('../models/people/person')


const getHouseHold = async(address) => {
    var streetNum = address.streetNum

    var people = await Person.find({"address.street": address.street, "address.streetNum": streetNum});
    try { return people 
    } catch(e){
        throw new Error(e.message)
    }
}

const editPerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});
    person.firstName = detail.newDetail.firstName
    person.lastName = detail.newDetail.lastName
    person.emails = detail.newDetail.email
    person.phones = detail.newDetail.phone

    return person.save()
}

const createPerson = async(detail) =>{
    var person = new Person(detail);
    return person.save();
}

const idPerson = async(detail) =>{
    //console.log(detail)

    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.scriptID,
                     idBy: detail.userID, 
                     idResponses: detail.idResponses, 
                     locationIdentified: detail.location}

    if(detail.activityType === "Canvass"){

        if(person.canvassContactHistory.length === 0){

            var canvassContactHistory = {campaignID: detail.campaignID, 
                activityID: detail.activityID,
                idHistory: idHistory
               }

            person.canvassContactHistory.push(canvassContactHistory)

            return person.save()


        }else{

            for (var i = 0; i < person.canvassContactHistory.length; i++){
                console.log("HERSIS")
    
                if(person.canvassContactHistory[i].activityID === detail.activityID){
                    console.log("Exists")
                    person.canvassContactHistory[i].idHistory.push(idHistory)
    
                } else {
                    console.log("DOES NOT EXIST")
    
                    var canvassContactHistory = {campaignID: detail.campaignID, 
                                                 activityID: detail.activityID,
                                                 idHistory: idHistory
                                                }
    
                    person.canvassContactHistory.push(canvassContactHistory)
    
                }
            }

            return person.save()

        }
    }
}


module.exports = {getHouseHold, editPerson, createPerson, idPerson}