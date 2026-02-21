import { SettingsMngr } from '../storageSync/SettingsMngr';

/**
 * Show settings modal
 */
export async function showSettingsModal() {
  const existingModal = document.getElementById('ghstarmngr-settings-modal');
  if (existingModal) existingModal.remove();

  const settings = await SettingsMngr.getSettings();
  const cacheDurationMinutes = Math.round(settings.cacheDurationMs / 60000);

  const modal = document.createElement('div');
  modal.id = 'ghstarmngr-settings-modal';
  const overlayStyle = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
    'background:rgba(0,0,0,0.7);z-index:999999;display:flex;' +
    'align-items:center;justify-content:center;';
  const boxStyle = 'background:#0d1117;border:1px solid #30363d;' +
    'border-radius:8px;padding:24px;max-width:480px;width:90%;color:#c9d1d9;';
  const labelStyle = 'display:block;margin:0 0 8px 0;color:#8b949e;font-size:14px;';
  const inputStyle = 'width:100%;padding:10px 12px;border:1px solid #30363d;' +
    'border-radius:6px;background:#161b22;color:#c9d1d9;font-size:14px;' +
    'box-sizing:border-box;margin-bottom:16px;';
  const btnStyle = 'background:#238636;color:#fff;border:none;' +
    'padding:8px 16px;border-radius:6px;font-size:14px;cursor:pointer;';
  const linkStyle = 'color:#58a6ff;font-size:14px;text-decoration:none;cursor:pointer;';
  const flexStyle = 'display:flex;gap:12px;justify-content:flex-end;' +
    'align-items:center;';

  modal.innerHTML = `
    <div style="${overlayStyle}">
      <div style="${boxStyle}">
        <h2 style="margin:0 0 12px 0;color:#f0f6fc;font-size:20px;">
          Cache Settings
        </h2>
        <p style="margin:0 0 16px 0;color:#8b949e;font-size:14px;">
          Configure how long starred repositories are cached.
        </p>
        <label style="${labelStyle}" for="ghstarmngr-cache-duration">
          Cache duration (minutes)
        </label>
        <input type="number" id="ghstarmngr-cache-duration"
          min="1" value="${cacheDurationMinutes}" style="${inputStyle}">
        <p id="ghstarmngr-settings-error"
          style="color:#f85149;font-size:12px;margin:12px 0 0 0;display:none;">
        </p>
        <div style="${flexStyle}">
          <a id="ghstarmngr-settings-cancel" style="${linkStyle}">Cancel</a>
          <button id="ghstarmngr-settings-save" style="${btnStyle}">Save</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = document.getElementById('ghstarmngr-cache-duration');
  const saveBtn = document.getElementById('ghstarmngr-settings-save');
  const cancelBtn = document.getElementById('ghstarmngr-settings-cancel');
  const errorEl = document.getElementById('ghstarmngr-settings-error');

  const closeModal = () => modal.remove();

  cancelBtn.addEventListener('click', closeModal);

  saveBtn.addEventListener('click', async () => {
    const minutes = parseInt(input.value, 10);
    if (!minutes || minutes < 1) {
      errorEl.textContent = 'Please enter a valid duration (minimum 1 minute)';
      errorEl.style.display = 'block';
      return;
    }

    const cacheDurationMs = minutes * 60000;
    await SettingsMngr.updateSettings({ cacheDurationMs });
    closeModal();
  });

  // Close on overlay click
  modal.querySelector('div[style*="position:fixed"]').addEventListener('click', (e) => {
    if (e.target === modal.querySelector('div[style*="position:fixed"]')) {
      closeModal();
    }
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}
