var Script = require ('../models/campaigns/script')

const createScript = async(detail) => {
    var script = new Script(detail)
    return script.save()
}

const editScript = async(editedScript) => {
    var script = await Script.findOne({_id: editedScript.scriptID});
    script.title = editedScript.script.title
    script.initMessage = editedScript.script.initMessage
    script.questions = editedScript.script.questions
    return script.save()
}

const getAllScripts = async(detail) =>{
    var scripts = await Script.find({$or: [{orgID: detail.orgID}, {campaignID: detail.campaignID}]});
    return scripts
}

const getScript = async(script) =>{
    var script = await Script.findOne({_id: script._id});
    return script
}

const deleteScript = async(script) =>{
    return Script.remove({_id: script._id}).exec();
}

const getActivityScripts = async(scriptIDs) =>{
    var scripts = await Script.find({"_id": scriptIDs});
    return scripts
}


module.exports = {createScript, getAllScripts, getScript, deleteScript, getActivityScripts, editScript}