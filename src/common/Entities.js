class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}

class App {
    constructor(domain, appId, fieldCodes, apiToken = undefined, spaceId = undefined) {
        this.domain = domain;
        this.appId = appId;
        this.fieldCodes = fieldCodes;
        this.apiToken = apiToken;
        this.spaceId = spaceId;
    }
}

module.exports = {
    User,
    App,
};
