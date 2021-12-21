const Queue = require('bull');
const {bullApis,sequelize}= require('../models');

const opt = require('../src/redis-server')



const hitApiQueue= new Queue('last-login',opt);




hitApiQueue.process(async (job)=>{
    try{
        const {apiUrl}= job.data;
        const findApi  = await bullApis.findOne({where:{api:apiUrl}})
        if(!findApi){
            
            const hitapi = await bullApis.create({api:apiUrl})
        }
        
        const count = await bullApis.findAll({
            where:{api:apiUrl},
            attributes: ['count'],
            
        })
        console.log(count[0].dataValues.count)
        const result = await bullApis.update({
            count: count[0].dataValues.count+1,
            
        },{where:{api:apiUrl}})

        return Promise.resolve({result})
    }catch(err){
        Promise.reject(err);
    }
})



const hitAPI = async (req,res,next)=>{
    hitApiQueue.add({apiUrl:req.originalUrl})

    next();
}

module.exports = hitAPI;