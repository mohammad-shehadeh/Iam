async function saveComplaint(newComplaint) {
    try {
        // 1. تجميع التوكن والتحقق منه
        const token = assembleGitHubToken();
        if (!token || token.length < 30) {
            throw new Error("توكن GitHub غير صالح");
        }

        // 2. التحقق من وجود المستودع
        const repoUrl = `https://api.github.com/repos/${CONFIG.REPO.OWNER}/${CONFIG.REPO.NAME}`;
        const repoResponse = await fetch(repoUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!repoResponse.ok) {
            throw new Error("المستودع غير موجود أو لا يوجد وصول");
        }

        // 3. جلب محتوى الملف الحالي
        const fileUrl = `https://api.github.com/repos/${CONFIG.REPO.OWNER}/${CONFIG.REPO.NAME}/contents/${CONFIG.FILE_PATH}`;
        const fileResponse = await fetch(fileUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let currentContent = '';
        let sha = '';

        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            currentContent = atob(fileData.content.replace(/\s/g, ''));
            sha = fileData.sha;
        } else if (fileResponse.status !== 404) {
            throw new Error("فشل في جلب الملف: " + fileResponse.statusText);
        }

        // 4. إضافة الشكوى الجديدة
        const updatedContent = currentContent + 
            `\n\n## شكوى #${newComplaint.id}\n` +
            `**التاريخ:** ${new Date(newComplaint.date).toLocaleString('ar-EG')}\n` +
            `**الحالة:** ${newComplaint.status}\n` +
            `**النص:**\n${newComplaint.text}\n` +
            `---`;

        // 5. رفع التحديثات
        const updateResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'إضافة شكوى جديدة - ' + new Date().toISOString(),
                content: btoa(unescape(encodeURIComponent(updatedContent))),
                sha: sha || undefined
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || "فشل في حفظ الشكوى");
        }

        return true;
    } catch (error) {
        console.error("Error details:", error);
        throw new Error(`فشل في عملية الحفظ: ${error.message}`);
    }
}