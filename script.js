document.getElementById('submitComplaint').addEventListener('click', async () => {
    const textarea = document.getElementById('complaintText');
    const button = document.getElementById('submitComplaint');
    const successMessage = document.getElementById('successMessage');

    const text = textarea.value.trim();
    if (!text) {
        alert('يرجى كتابة الشكوى قبل الإرسال.');
        return;
    }

    button.disabled = true;
    button.textContent = 'جارٍ الإرسال...';

    const complaint = {
        id: Date.now(),
        text: text,
        date: new Date().toISOString(),
        status: 'new'
    };

    try {
        await saveComplaintToGitHub(complaint);

        textarea.value = '';
        successMessage.style.display = 'block';
        setTimeout(() => successMessage.style.display = 'none', 3000);
    } catch (err) {
        console.error('خطأ أثناء حفظ الشكوى:', err);
        alert('فشل في إرسال الشكوى: ' + err.message);
    } finally {
        button.disabled = false;
        button.textContent = 'إرسال الشكوى';
    }
});

async function saveComplaintToGitHub(complaint) {
    const token = getGitHubToken();
    const url = `https://api.github.com/repos/${CONFIG.REPO.OWNER}/${CONFIG.REPO.NAME}/contents/${CONFIG.FILE_PATH}`;

    // Step 1: Fetch existing file (if exists)
    let currentContent = '';
    let sha = '';

    const getResponse = await fetch(url, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });

    if (getResponse.ok) {
        const data = await getResponse.json();
        currentContent = decodeBase64(data.content);
        sha = data.sha;
    } else if (getResponse.status !== 404) {
        throw new Error('حدث خطأ في تحميل الملف: ' + getResponse.statusText);
    }

    // Step 2: Prepare new content
    const newSection =
        `\n\n## Complaint #${complaint.id}\n` +
        `**Date:** ${new Date(complaint.date).toLocaleString('ar-EG')}\n` +
        `**Status:** ${complaint.status}\n` +
        `**Text:**\n${complaint.text}\n` +
        `---`;

    const updatedContent = currentContent + newSection;

    // Step 3: Upload new content
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `New complaint submitted (ID: ${complaint.id})`,
            content: encodeBase64(updatedContent),
            sha: sha || undefined
        })
    });

    if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.error('GitHub API Error:', error);
        throw new Error(error.message || 'فشل في تحديث الملف على GitHub.');
    }
}

// Helpers
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str.replace(/\s/g, ''))));
}

function getGitHubToken() {
    const base64 = CONFIG.ENCODED_TOKEN.join('');
    try {
        return atob(base64);
    } catch (err) {
        throw new Error('فشل في فك تشفير مفتاح GitHub.');
    }
}