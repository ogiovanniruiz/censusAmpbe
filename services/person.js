var Person = require('../models/people/person')
var async = require('async');

const getHouseHold = async(address) => {
    var people = await Person.find({"address.street": address.street, "address.streetNum": address.streetNum});
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

const getMembers = async(detail) =>{
    var people = await Person.find({"membership": detail.orgID})
    return people
}

const uploadMembers = async(detail) =>{
    var stringFile = detail.files[0].buffer.toString('utf8');

    var lines = (stringFile).split("\n");
    var headers = lines[0].split(",");
    var counter = 0;

    async.eachLimit(lines, 100, function(line, callback){

        var obj = {}
        var currentLine = line.split(",")

        for(var j = 0; j < headers.length; j++){
            
            if(headers[j] === "address"){


            } else if (headers[j] === "phones"){

                if(currentLine[j]){
                    obj[headers[j]] = currentLine[j].replace("(", "").replace(")", "").replace("-","")
                }

            } else{
                obj[headers[j]] = currentLine[j]
            }
        }

        obj["membership"] = detail.body.orgID

        if(obj['firstName'] != "firstName" && obj["firstName"] != "" && obj ['firstName'] != undefined){
            var person = new Person(obj)

            person.save(function(err){
                if (err) console.log(err);
                else {
                    counter++;
                    console.log(counter);
                }
            })
        }

        callback();
    })
 
}



const idPerson = async(detail) =>{

    var person = await Person.findOne({"_id": detail.person._id});

    var idHistory = {scriptID: detail.script._id,
                     idBy: detail.userID, 
                     idResponses: detail.idResponses, 
                     locationIdentified: detail.location}

    if(detail.activityType === "Canvass"){

        if(person.canvassContactHistory.length === 0){

            var canvassContactHistory = {
                                            campaignID: detail.campaignID, 
                                            activityID: detail.activityID,
                                            idHistory: idHistory
                                        }

            person.canvassContactHistory.push(canvassContactHistory)
            return person.save()

        }else{

            
            for (var i = 0; i < person.canvassContactHistory.length; i++){    
                if(person.canvassContactHistory[i].activityID === detail.activityID){
                    person.canvassContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var canvassContactHistory = {
                                            campaignID: detail.campaignID, 
                                            activityID: detail.activityID,
                                            idHistory: idHistory
                                        }

            person.canvassContactHistory.push(canvassContactHistory)
            return person.save()
            
        }
    } else if (detail.activityType === "Texting"){

        if(person.textContactHistory.length === 0){

            var textContactHistory = {
                                            campaignID: detail.campaignID, 
                                            activityID: detail.activityID,
                                            idHistory: idHistory
                                        }

            person.textContactHistory.push(textContactHistory)
            return person.save()

        }else{

            
            for (var i = 0; i < person.textContactHistory.length; i++){    
                if(person.textContactHistory[i].activityID === detail.activityID){
                    person.textContactHistory[i].idHistory.push(idHistory)
                    return person.save()
                }
            }

            var textContactHistory = {
                                            campaignID: detail.campaignID, 
                                            activityID: detail.activityID,
                                            idHistory: idHistory
                                        }

            person.textContactHistory.push(textContactHistory)
            return person.save()
            
        }
    }
}


module.exports = {getHouseHold, editPerson, createPerson, idPerson, getMembers, uploadMembers}