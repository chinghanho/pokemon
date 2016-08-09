'use strict'

const pogobuf = require('pogobuf')
const POGOProtos = require('node-pogo-protos')
const chalk = require('chalk')

var google = new pogobuf.GoogleLogin()
var client = new pogobuf.Client()

const LAT = 25.000000
const LNG = 121.000000

const REFRESH_TIME_MS = 30 * 1000

google.login('gmail', 'password')
    .then(token => {
        client.setAuthInfo('google', token)
        client.setPosition(LAT, LNG)
        return client.init()
    })
    .then(() => {

        let lastTimestamp = Date.now();
        console.log(`已登入，正在搜尋座標 ${LAT}, ${LNG} 附近 (30s)`);

        global.setInterval(() => {
            const cellIDs = pogobuf.Utils.getCellIDs(LAT, LNG);
            const sinceTimestamps = Array(cellIDs.length).fill(lastTimestamp);
            const dateString = (new Date()).toString();

            console.log(chalk.green(dateString));

            client.getMapObjects(cellIDs, sinceTimestamps)
                .then(mapObjects => mapObjects.map_cells)
                .then(mapCells => mapCells.forEach((cell) => {
                    cell.catchable_pokemons.forEach((pokemon) => {
                        const pokemonName = pogobuf.Utils.getEnumKeyByValue(
                            POGOProtos.Enums.PokemonId,
                            pokemon.pokemon_id
                        );

                        console.log(`  - 附近有一隻 ${pokemonName}！`);
                    });
                }));

            lastTimestamp = Date.now();
        }, REFRESH_TIME_MS);
    })
    .catch((reason) => {
        console.error(reason)
    })
