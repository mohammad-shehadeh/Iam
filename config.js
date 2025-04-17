const CONFIG = {
    S1: "Z2hwX1VD",
    S2: "VGdIUXNBWT",
    S3: "VNalpaOUF",
    S4: "5TlBLdHk0Wj",
    S5: "RudDYySDVjdGE=",
    REPO_INFO: {
        U: "mohammad-shehadeh",
        R: "Iam"
    },
    PATH: "Server.md",
    getToken() {
        const base64 = this.S1 + this.S2 + this.S3 + this.S4 + this.S5;
        return atob(base64);
    }
};