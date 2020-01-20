const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

// Métodos HTTP: GET, POST, PUT, DELETE

// Tipos de parâmetros:

// Query Params: request.query (filtros, ordenação, paginação, ...)
// Route Params: request.params (identificar um recurso na alteração ou remoção)
// Body: request.body (dados para criacao ou alteração de um registro)

// index, show, store, update, destroy

module.exports = {
    async index(request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async show(request, response) {
        const dev = await Dev.findById({
            _id: request.params.id
        });

        return response.json(dev);
    },

    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username });

        if (!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
    
            const { name = login, avatar_url, bio } = apiResponse.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [latitude, longitude],
            }
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            });

            // filtrar as conexoes que estao ha no maximo 10km de dsitancia
            // e que o novo dev tenha pelo menos uma das tecnologias filtradas

            const sendSocketMessageTo = findConnections({
                latitude,
                longitude,
            }, techsArray);

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }
    
        return response.json(dev);
    },

    async update(request, response) {
        const { name, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ _id: request.params.id });

        if (dev) {
            const techsArray = parseStringAsArray(techs);

            const location = {
                type: 'Point',
                coordinates: [latitude, longitude],
            }

            dev = await Dev.findOneAndUpdate({ _id: request.params.id }, { 
                name,
                techs: techsArray,
                location,
            }, { new: true, useFindAndModify: false });
        }

        response.json(dev);
    },

    async destroy(request, response) {
        Dev.findByIdAndDelete({
            _id: request.params.id
        }, (err) => {
            if (err) console.log(err);

            console.log('Success deleted!');
        });

        response.json({ "deleted": `ID ${request.params.id}` });
    },
};