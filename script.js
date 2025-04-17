// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    const complaintText = document.getElementById('complaintText');
    const submitBtn = document.getElementById('submitComplaint');
    const successMessage = document.getElementById('successMessage');

    submitBtn.addEventListener('click', async function() {
        if (!complaintText.value.trim()) {
            alert('الرجاء كتابة نص الشكوى');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'جاري الإرسال...';
            
            const complaint = {
                id: Date.now(),
                text: complaintText.value,
                date: new Date().toISOString(),
                status: 'new'
            };

            await saveComplaint(complaint);
            
            complaintText.value = '';
            successMessage.style.display = 'block';
            
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            alert('حدث خطأ أثناء إرسال الشكوى: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'إرسال الشكوى';
        }
    });
});

// حفظ الشكوى على GitHub
async function saveComplaint(newComplaint) {
    // جلب البيانات الحالية
    const response = await fetch(`https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/Server.md`, {
        headers: {
            'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    let currentContent = '';
    let sha = '';

    if (response.ok) {
        const data = await response.json();
        currentContent = atob(data.content);
        sha = data.sha;
    }

    // إضافة الشكوى الجديدة
    const updatedContent = currentContent + 
        `\n\n## شكوى #${newComplaint.id}\n` +
        `**التاريخ:** ${new Date(newComplaint.date).toLocaleString('ar-EG')}\n` +
        `**الحالة:** ${newComplaint.status}\n` +
        `**النص:**\n${newComplaint.text}\n` +
        `---`;

    // رفع التحديثات
    const updateResponse = await fetch(`https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/Server.md`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'إضافة شكوى جديدة',
            content: btoa(unescape(encodeURIComponent(updatedContent))),
            sha: sha
        })
    });

    if (!updateResponse.ok) {
        throw new Error('فشل في حفظ الشكوى');
    }
}
