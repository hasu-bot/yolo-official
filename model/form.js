(function () {
  var host = document.querySelector('.model-entry .model-wrap');
  if (!host || !window.supabase || !window.supabase.createClient) return;

  var SUPABASE_URL = 'https://vfvxvpuqkljtlkzncggf.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JKqT3cV6-W-9yra5gRoBVQ_rjGv6vhm';
  var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  host.innerHTML = `
    <p class="kicker">Entry</p>
    <h2>サイトから、そのまま応募できます。</h2>
    <p class="entry-lead">必要事項と写真2枚を送信してください。応募内容を確認し、審査後にご連絡します。</p>

    <form class="application-form" id="model-application-form" novalidate>
      <section class="form-section" aria-labelledby="basic-info-title">
        <h3 id="basic-info-title">基本情報</h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="app-name">氏名<span class="form-required">必須</span></label>
            <input id="app-name" name="name" type="text" autocomplete="name" maxlength="100" required />
          </div>
          <div class="form-field">
            <label for="app-age">年齢<span class="form-required">必須</span></label>
            <input id="app-age" name="age" type="number" min="16" max="120" inputmode="numeric" required />
            <p class="form-help">16歳以上の方が対象です。</p>
          </div>
          <div class="form-field">
            <label for="app-residence">居住エリア<span class="form-required">必須</span></label>
            <input id="app-residence" name="residence" type="text" maxlength="120" placeholder="例：熊本市" required />
          </div>
          <div class="form-field">
            <label for="app-height">身長（cm）</label>
            <input id="app-height" name="height_cm" type="number" min="50" max="250" inputmode="numeric" placeholder="例：165" />
          </div>
          <div class="form-field full" id="guardian-wrap" hidden>
            <p class="guardian-note">16〜17歳の方は、保護者の方の同意が必要です。</p>
            <div class="form-grid">
              <div class="form-field">
                <label for="app-guardian-name">保護者の氏名<span class="form-required">必須</span></label>
                <input id="app-guardian-name" name="guardian_name" type="text" maxlength="100" />
              </div>
              <div class="form-field">
                <label for="app-guardian-contact">保護者の連絡先<span class="form-required">必須</span></label>
                <input id="app-guardian-contact" name="guardian_contact" type="text" maxlength="320" placeholder="電話番号またはメールアドレス" />
                <p class="form-help">確認のためご連絡する場合があります。</p>
              </div>
            </div>
            <label class="consent-box">
              <input id="app-guardian-consent" name="guardian_consent" type="checkbox" />
              <span>保護者として、本人がYOLOのモデル／俳優に応募し、上記の内容で審査を受けることに同意します。<span class="form-required">必須</span></span>
            </label>
          </div>

          <div class="form-field full">
            <label for="app-email">連絡用メールアドレス<span class="form-required">必須</span></label>
            <input id="app-email" name="contact_email" type="email" autocomplete="email" maxlength="320" required />
            <p class="form-help">審査結果や確認事項の連絡に使用します。</p>
          </div>
        </div>
      </section>

      <section class="form-section" aria-labelledby="activity-title">
        <h3 id="activity-title">希望する活動</h3>
        <fieldset class="form-field full" style="border:0;padding:0;margin:0">
          <legend>希望<span class="form-required">必須</span></legend>
          <div class="form-choice-row">
            <label class="form-choice"><input type="radio" name="activity_type" value="model" required /> モデル</label>
            <label class="form-choice"><input type="radio" name="activity_type" value="actor" required /> 俳優</label>
            <label class="form-choice"><input type="radio" name="activity_type" value="both" required /> 両方</label>
          </div>
        </fieldset>
        <div class="form-field">
          <label for="app-experience">これまでの活動経験</label>
          <textarea id="app-experience" name="experience" maxlength="2000" placeholder="未経験の場合は「なし」で大丈夫です"></textarea>
        </div>
        <div class="form-field">
          <label for="app-aspirations">今後やってみたいこと<span class="form-required">必須</span></label>
          <textarea id="app-aspirations" name="aspirations" maxlength="2000" required placeholder="作品出演、広告モデル、演技など、興味のあることを自由に書いてください"></textarea>
        </div>
        <div class="form-field">
          <label for="app-pr">自己PR</label>
          <textarea id="app-pr" name="self_pr" maxlength="2000"></textarea>
        </div>
      </section>

      <section class="form-section" aria-labelledby="profile-title">
        <h3 id="profile-title">活動情報</h3>
        <div class="form-grid">
          <div class="form-field">
            <label for="app-instagram">Instagram / SNS</label>
            <input id="app-instagram" name="instagram" type="text" maxlength="255" placeholder="@creative.yolo またはURL" />
          </div>
          <div class="form-field">
            <label for="app-agency">現在の事務所所属<span class="form-required">必須</span></label>
            <select id="app-agency" name="agency_status" required>
              <option value="none">所属なし</option>
              <option value="affiliated">所属あり</option>
            </select>
          </div>
          <div class="form-field full" id="agency-name-wrap" hidden>
            <label for="app-agency-name">所属事務所名</label>
            <input id="app-agency-name" name="agency_name" type="text" maxlength="255" />
          </div>
          <div class="form-field">
            <label for="app-area">活動可能エリア</label>
            <input id="app-area" name="activity_area" type="text" maxlength="500" placeholder="例：熊本県内、九州圏内" />
          </div>
          <div class="form-field">
            <label for="app-availability">活動可能な曜日・時間帯</label>
            <input id="app-availability" name="availability" type="text" maxlength="500" placeholder="例：土日中心、平日18時以降" />
          </div>
        </div>
      </section>

      <section class="form-section" aria-labelledby="photo-title">
        <h3 id="photo-title">写真</h3>
        <p class="form-help">JPEG / PNG / WebP、1枚10MBまで。加工の強い写真や複数人で写っている写真は避けてください。</p>
        <div class="photo-fields">
          <label class="photo-field" for="app-face-photo">
            <strong>顔が分かる写真<span class="form-required">必須</span></strong>
            <span class="form-help">正面に近く、顔がはっきり確認できるもの</span>
            <input id="app-face-photo" name="face_photo" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <label class="photo-field" for="app-full-photo">
            <strong>全身写真<span class="form-required">必須</span></strong>
            <span class="form-help">頭から足元まで確認できるもの</span>
            <input id="app-full-photo" name="full_photo" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
        </div>
      </section>

      <div class="form-honeypot" aria-hidden="true">
        <label for="app-website">Website</label>
        <input id="app-website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>

      <label class="consent-box">
        <input id="app-consent" name="privacy_consent" type="checkbox" required />
        <span>応募内容・写真を、YOLOにおけるモデル／俳優の登録審査、本人確認、連絡およびキャスティング検討のために利用することに同意します。<span class="form-required">必須</span></span>
      </label>

      <div class="form-actions">
        <button class="button button-primary button-large" type="submit" id="application-submit">応募を送信する</button>
        <p class="form-status" id="application-status" role="status" aria-live="polite"></p>
      </div>
    </form>

    <p class="entry-note">※応募＝登録・所属・出演決定ではありません。審査後に登録可否をご連絡します。<br />※16歳以上の方が対象です。16〜17歳の方は、この応募フォームで保護者の同意をいただきます。</p>
  `;

  var form = document.getElementById('model-application-form');
  var submitButton = document.getElementById('application-submit');
  var statusEl = document.getElementById('application-status');
  var ageInput = document.getElementById('app-age');
  var guardianWrap = document.getElementById('guardian-wrap');
  var guardianName = document.getElementById('app-guardian-name');
  var guardianContact = document.getElementById('app-guardian-contact');
  var guardianConsent = document.getElementById('app-guardian-consent');
  var agencySelect = document.getElementById('app-agency');

  // 16〜17歳のときだけ保護者欄を出して必須にする（23 §4-1）。
  // 18歳以上・未入力のときは値ごと消す——一度入力してから年齢を変えた人の情報を残さない
  function syncGuardian() {
    var age = Number(ageInput.value);
    var needsGuardian = ageInput.value !== '' && age >= 16 && age <= 17;
    guardianWrap.hidden = !needsGuardian;
    guardianName.required = needsGuardian;
    guardianContact.required = needsGuardian;
    guardianConsent.required = needsGuardian;
    if (!needsGuardian) {
      guardianName.value = '';
      guardianContact.value = '';
      guardianConsent.checked = false;
    }
  }
  ageInput.addEventListener('input', syncGuardian);
  ageInput.addEventListener('change', syncGuardian);
  syncGuardian();
  var agencyNameWrap = document.getElementById('agency-name-wrap');
  var agencyNameInput = document.getElementById('app-agency-name');

  agencySelect.addEventListener('change', function () {
    var affiliated = agencySelect.value === 'affiliated';
    agencyNameWrap.hidden = !affiliated;
    agencyNameInput.required = affiliated;
    if (!affiliated) agencyNameInput.value = '';
  });

  function getExt(file) {
    var map = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return map[file.type] || '';
  }

  // 入力内容の誤りは、そのまま画面に出してよいものとして投げる。
  // Supabase 側のエラーはそのまま見せない（技術的すぎて本人には直せない）
  function inputError(message) {
    var e = new Error(message);
    e.userFacing = true;
    return e;
  }

  function validatePhoto(file, label) {
    if (!file) throw inputError(label + 'を選択してください。');
    if (!getExt(file)) throw inputError(label + 'はJPEG・PNG・WebPで送信してください。');
    if (file.size > 10 * 1024 * 1024) throw inputError(label + 'は10MB以下にしてください。');
  }

  // 年齢と保護者同意の検査（23-OFFICIAL-MODEL-PROGRAM §4-1）。
  // 15歳以下は登録できない。16〜17歳は保護者の氏名・連絡先・同意が必須
  function validateAge(age, guardian) {
    if (!Number.isFinite(age)) throw inputError('年齢を入力してください。');
    if (age < 16) throw inputError('応募は16歳以上の方が対象です。');
    if (age > 17) return;
    if (!guardian.name) throw inputError('保護者の氏名を入力してください。');
    if (!guardian.contact) throw inputError('保護者の連絡先を入力してください。');
    if (!guardian.consent) throw inputError('保護者の同意にチェックをお願いします。');
  }

  function setStatus(message, state) {
    statusEl.textContent = message || '';
    if (state) statusEl.dataset.state = state;
    else delete statusEl.dataset.state;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setStatus('', '');

    if (!form.reportValidity()) return;

    var data = new FormData(form);
    if (String(data.get('website') || '').trim()) {
      setStatus('応募を受け付けました。', 'success');
      form.reset();
      return;
    }

    var faceFile = data.get('face_photo');
    var fullFile = data.get('full_photo');

    var guardian = {
      name: String(data.get('guardian_name') || '').trim(),
      contact: String(data.get('guardian_contact') || '').trim(),
      consent: data.get('guardian_consent') === 'on'
    };

    try {
      validateAge(Number(data.get('age')), guardian);
      validatePhoto(faceFile, '顔写真');
      validatePhoto(fullFile, '全身写真');

      submitButton.disabled = true;
      submitButton.textContent = '送信中…';
      setStatus('写真をアップロードしています…');

      var applicationId = crypto.randomUUID();
      var facePath = applicationId + '/face.' + getExt(faceFile);
      var fullPath = applicationId + '/full.' + getExt(fullFile);

      var faceResult = await client.storage
        .from('model-applications')
        .upload(facePath, faceFile, { cacheControl: '3600', upsert: false, contentType: faceFile.type });
      if (faceResult.error) throw faceResult.error;

      var fullResult = await client.storage
        .from('model-applications')
        .upload(fullPath, fullFile, { cacheControl: '3600', upsert: false, contentType: fullFile.type });
      if (fullResult.error) throw fullResult.error;

      setStatus('応募内容を送信しています…');

      var age = Number(data.get('age'));
      var heightRaw = String(data.get('height_cm') || '').trim();
      var payload = {
        id: applicationId,
        name: String(data.get('name') || '').trim(),
        age: age,
        residence: String(data.get('residence') || '').trim(),
        height_cm: heightRaw ? Number(heightRaw) : null,
        activity_type: String(data.get('activity_type') || ''),
        experience: String(data.get('experience') || '').trim() || null,
        aspirations: String(data.get('aspirations') || '').trim(),
        self_pr: String(data.get('self_pr') || '').trim() || null,
        instagram: String(data.get('instagram') || '').trim() || null,
        agency_status: String(data.get('agency_status') || 'none'),
        agency_name: String(data.get('agency_name') || '').trim() || null,
        activity_area: String(data.get('activity_area') || '').trim() || null,
        availability: String(data.get('availability') || '').trim() || null,
        contact_email: String(data.get('contact_email') || '').trim(),
        is_minor: age < 18,
        guardian_name: guardian.name || null,
        guardian_contact: guardian.contact || null,
        guardian_consent: guardian.consent,
        privacy_consent: data.get('privacy_consent') === 'on',
        face_photo_path: facePath,
        full_photo_path: fullPath,
        website: ''
      };

      var insertResult = await client.from('model_applications').insert(payload);
      if (insertResult.error) throw insertResult.error;

      host.innerHTML = `
        <p class="kicker">Entry Complete</p>
        <h2>応募を受け付けました。</h2>
        <div class="form-success">
          <h3>ご応募ありがとうございます。</h3>
          <p>内容を確認のうえ、審査を進めます。<br />確認事項や結果について、入力いただいたメールアドレス等へご連絡します。</p>
          <p>応募番号：<strong>${applicationId.slice(0, 8).toUpperCase()}</strong></p>
        </div>
      `;
      host.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('Model application submit failed:', error);
      setStatus(
        error && error.userFacing
          ? error.message
          : '送信できませんでした。通信状況をご確認のうえ、もう一度お試しください。',
        'error'
      );
      submitButton.disabled = false;
      submitButton.textContent = '応募を送信する';
    }
  });
})();
