// Stockage des connexions actives par IP
var ipConnections = {};

// Configuration
var MAX_CONNECTIONS_PER_IP = 5;  // Nombre maximum de connexions depuis une même IP
// var WHITELIST = ["127.0.0.1", "::1", "localhost", "172.19.0.1"];  // IPs en liste blanche (illimitées)

/**
 * Récupère l'adresse IP à partir de l'objet connexion
 */
function getIpFromConnection(connection) {
    var ip = 'unknown';
    
    // Plusieurs façons d'obtenir l'IP selon la version de websocket
    if (connection._socket && connection._socket.remoteAddress) {
        ip = connection._socket.remoteAddress;
    } else if (connection.socket && connection.socket.remoteAddress) {
        ip = connection.socket.remoteAddress;
    } else if (connection.remoteAddress) {
        ip = connection.remoteAddress;
    } else if (connection.upgradeReq && connection.upgradeReq.connection) {
        ip = connection.upgradeReq.connection.remoteAddress;
    }
    
    // Dans le contexte Docker, extrait l'IP depuis le message de fermeture
    if (ip === 'unknown' && connection.closeDescription) {
        var match = connection.closeDescription.match(/to\s+(\d+\.\d+\.\d+\.\d+)/);
        if (match && match[1]) {
            ip = match[1];
        }
    }
    
    return ip;
}

/**
 * Vérifie si une IP peut établir une nouvelle connexion
 */
exports.canConnect = function(connection) {
    var ip = getIpFromConnection(connection);
    
    // Si IP inconnue, autoriser par défaut mais avec un avertissement
    if (ip === 'unknown') {
        console.log("[Security] IP non détectable, connexion autorisée par défaut");
        return true;
    }
    
    // IPs en liste blanche toujours autorisées
    if (WHITELIST.indexOf(ip) !== -1) {
        console.log("[Security] IP en liste blanche: " + ip + ", connexion autorisée");
        return true;
    }
    
    // Initialise le compteur pour cette IP si nécessaire
    if (!ipConnections[ip]) {
        ipConnections[ip] = 0;
    }
    
    // Vérifie la limite
    if (ipConnections[ip] >= MAX_CONNECTIONS_PER_IP) {
        console.log("[Security] Limite atteinte pour l'IP: " + ip + " (" + ipConnections[ip] + " connexions)");
        return false;
    }
    
    // Incrémente le compteur et autorise
    ipConnections[ip]++;
    console.log("[Security] Nouvelle connexion acceptée pour IP: " + ip + " (" + ipConnections[ip] + "/" + MAX_CONNECTIONS_PER_IP + ")");
    return true;
};

/**
 * Notifie qu'une connexion a été fermée pour une IP
 */
exports.connectionClosed = function(connection) {
    var ip = getIpFromConnection(connection);
    
    if (ip !== 'unknown' && ipConnections[ip]) {
        ipConnections[ip]--;
        console.log("[Security] Connexion fermée pour IP: " + ip + " (" + ipConnections[ip] + "/" + MAX_CONNECTIONS_PER_IP + ")");
        
        // Nettoyage si plus de connexions
        if (ipConnections[ip] <= 0) {
            delete ipConnections[ip];
        }
    }
};

/**
 * Statistiques sur les connexions
 */
exports.getStats = function() {
    return {
        connectionCount: Object.keys(ipConnections).reduce(function(total, ip) {
            return total + ipConnections[ip];
        }, 0),
        ipCount: Object.keys(ipConnections).length,
        connections: ipConnections
    };
};