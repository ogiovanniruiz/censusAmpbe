var CensusTract = require('../models/censustracts/censustract'); 


const getAllCensusTracts= async(tractDetail) =>{
    try {
        //console.log(tractDetail)
        return CensusTract.find({}).exec(); 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllCensusTracts}
