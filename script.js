// Complaint submission handler
document.getElementById('submitComplaint').addEventListener('click', async function() {
    const complaintText = document.getElementById('complaintText');
    const submitBtn = this;
    const successMessage = document.getElementById('successMessage');

    if (!complaintText.value.trim()) {
        alert('Please enter your complaint text');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        const complaint = {
            id: Date.now(),
            text: complaintText.value, // Arabic text preserved here only
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
        console.error('Error:', error);
        alert('Failed to submit complaint: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Complaint';
    }
});

// Save complaint to GitHub
async function saveComplaint(newComplaint) {
    const token = assembleGitHubToken();
    const fileUrl = `https://api.github.com/repos/${CONFIG.REPO.OWNER}/${CONFIG.REPO.NAME}/contents/${CONFIG.FILE_PATH}`;

    try {
        // 1. Get current file content
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
            throw new Error(`API Error: ${fileResponse.statusText}`);
        }

        // 2. Prepare updated content (English metadata + Arabic complaint)
        const updatedContent = currentContent + 
            `\n\n## Complaint #${newComplaint.id}\n` +
            `**Date:** ${new Date(newComplaint.date).toLocaleString('en-US')}\n` +
            `**Status:** ${newComplaint.status}\n` +
            `**Text:**\n${newComplaint.text}\n` +  // Arabic text preserved here
            `---`;

        // 3. Update file on GitHub
        const updateResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `New complaint added - ID: ${newComplaint.id}`,
                content: btoa(unescape(encodeURIComponent(updatedContent))),
                sha: sha || undefined
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || "Failed to update file");
        }

        return true;
    } catch (error) {
        console.error('API Error Details:', error);
        throw new Error(`Failed to save complaint: ${error.message}`);
    }
}