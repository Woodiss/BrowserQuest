
var fs = require('fs'),
    Metrics = require('./metrics');
    var security = require('./security');
    var Player = require('./player');





function main(config) {
    var ws = require("./ws"),
        WorldServer = require("./worldserver"),
        Log = require('log'),
        _ = require('underscore'),
        server = new ws.MultiVersionWebsocketServer(config.port),
        metrics = config.metrics_enabled ? new Metrics(config) : null;
        worlds = [],
        lastTotalPlayers = 0,
        checkPopulationInterval = setInterval(function() {
            if(metrics && metrics.isReady) {
                metrics.getTotalPlayers(function(totalPlayers) {
                    if(totalPlayers !== lastTotalPlayers) {
                        lastTotalPlayers = totalPlayers;
                        _.each(worlds, function(world) {
                            world.updatePopulation(totalPlayers);
                        });
                    }
                });
            }
        }, 1000);
    
    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
    };
    
    log.info("Starting BrowserQuest game server...");

    server.onConnect(function(connection) {
        // Vérification de sécurité
        if (!security.canConnect(connection)) {
            console.log("Connexion refusée");
            
            // Tentative de fermer proprement la connexion selon le type de bibliothèque
            try {
                if (connection.close) {
                    connection.close(1008, "Trop de connexions depuis cette IP");
                } else if (connection.end) {
                    connection.end();
                } else if (connection.socket && connection.socket.end) {
                    connection.socket.end();
                }
            } catch (e) {
                console.error("Erreur lors de la fermeture de la connexion:", e);
            }
            
            return;
        }
        
        // Gestion du monde pour le joueur
        var world, // le monde dans lequel le joueur sera créé
            connect = function() {
                if (world) {
                    var player = new Player(connection, world);
                    
                    // Important: gestionnaire pour nettoyer à la déconnexion
                    if (player.onDisconnect) {
                        player.onDisconnect(function() {
                            security.connectionClosed(connection);
                        });
                    } else {
                        // Fallback si onDisconnect n'existe pas dans la classe Player
                        // On essaie d'intercepter l'événement de fermeture directement
                        if (connection.on) {
                            connection.on('close', function() {
                                security.connectionClosed(connection);
                            });
                        }
                    }
                    
                    world.connect_callback(player);
                } else {
                    console.log("Aucun monde disponible pour le joueur!");
                    security.connectionClosed(connection);
                }
            };
        
        // Le reste du code reste identique...
        if (metrics) {
            metrics.getOpenWorldCount(function(open_world_count) {
                world = _.min(_.first(worlds, open_world_count), function(w) { return w.playerCount; });
                connect();
            });
        } else {
            world = _.detect(worlds, function(w) {
                return w.playerCount < config.nb_players_per_world;
            });
            
            if (world) {
                if (lastTotalPlayers > 0) {
                    world.updatePopulation(lastTotalPlayers);
                }
                connect();
            } else {
                console.log("Tous les mondes sont pleins!");
                security.connectionClosed(connection);
            }
        }
    });
    
    // server.onConnect(function(connection) {
    //     var world, // the one in which the player will be spawned
    //         connect = function() {
    //             if(world) {
    //                 world.connect_callback(new Player(connection, world));
    //             }
    //         };
        
    //     if(metrics) {
    //         metrics.getOpenWorldCount(function(open_world_count) {
    //             // choose the least populated world among open worlds
    //             world = _.min(_.first(worlds, open_world_count), function(w) { return w.playerCount; });
    //             connect();
    //         });
    //     }
    //     else {
    //         // simply fill each world sequentially until they are full
    //         world = _.detect(worlds, function(world) {
    //             return world.playerCount < config.nb_players_per_world;
    //         });
    //         world.updatePopulation();
    //         connect();
    //     }
    // });


    
    

    server.onError(function() {
        log.error(Array.prototype.join.call(arguments, ", "));
    });
    
    var onPopulationChange = function() {
        metrics.updatePlayerCounters(worlds, function(totalPlayers) {
            _.each(worlds, function(world) {
                world.updatePopulation(totalPlayers);
            });
        });
        metrics.updateWorldDistribution(getWorldDistribution(worlds));
    };

    _.each(_.range(config.nb_worlds), function(i) {
        var world = new WorldServer('world'+ (i+1), config.nb_players_per_world, server);
        world.run(config.map_filepath);
        worlds.push(world);
        if(metrics) {
            world.onPlayerAdded(onPopulationChange);
            world.onPlayerRemoved(onPopulationChange);
        }
    });
    
    server.onRequestStatus(function() {
        return JSON.stringify(getWorldDistribution(worlds));
    });
    
    if(config.metrics_enabled) {
        metrics.ready(function() {
            onPopulationChange(); // initialize all counters to 0 when the server starts
        });
    }
    
    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
    });
}

function getWorldDistribution(worlds) {
    var distribution = [];
    
    _.each(worlds, function(world) {
        distribution.push(world.playerCount);
    });
    return distribution;
}

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.error("Could not open config file:", err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}

var defaultConfigPath = './server/config.json',
    customConfigPath = './server/config_local.json';

process.argv.forEach(function (val, index, array) {
    if(index === 2) {
        customConfigPath = val;
    }
});

getConfigFile(defaultConfigPath, function(defaultConfig) {
    getConfigFile(customConfigPath, function(localConfig) {
        if(localConfig) {
            main(localConfig);
        } else if(defaultConfig) {
            main(defaultConfig);
        } else {
            console.error("Server cannot start without any configuration file.");
            process.exit(1);
        }
    });
});

process.on('SIGINT', function() {
    console.log("Arrêt du serveur...");
    // Nettoyage ici si nécessaire
    process.exit();
});
