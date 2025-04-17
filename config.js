const CONFIG = {
    TOKEN_PARTS: {
        PART1: "ghp_UCTgHQsAY5MjZ9AFye5", // الجزء الأول من التوكن
        PART2: "NPKty4Z4nt62H5cta"        // الجزء الثاني
    },
    REPO: {
        OWNER: "mohammad-shehadeh",       // اسم المستخدم على GitHub
        NAME: "otp"                       // اسم المستودع
    },
    FILE_PATH: "Server.md"                // مسار الملف
};

function assembleGitHubToken() {
    if (!CONFIG.TOKEN_PARTS.PART1 || !CONFIG.TOKEN_PARTS.PART2) {
        throw new Error("أجزاء التوكن غير موجودة في ملف الإعدادات");
    }
    return CONFIG.TOKEN_PARTS.PART1 + CONFIG.TOKEN_PARTS.PART2;
}