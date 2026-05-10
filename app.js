let db, lastWonMontanteGain = 0, currentFilter = localStorage.getItem('currentFilter') || 'all';

function showToast(m) { const t = document.createElement('div'); t.className='toast'; t.innerText=m; document.getElementById('toast-container').appendChild(t); setTimeout(()=>t.remove(), 3000); }

function showSuccessModal(title, subtitle, callback, icon = "✨") {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
    modal.style.backdropFilter = 'blur(8px)';
    modal.style.webkitBackdropFilter = 'blur(8px)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';

    const card = document.createElement('div');
    card.className = 'card glass';
    card.style.textAlign = 'center';
    card.style.transform = 'scale(0.8) translateY(20px)';
    card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.maxWidth = '80%';
    card.style.minWidth = '250px';
    card.style.margin = '0';
    card.style.padding = '30px 20px';

    card.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 15px; color: var(--accent); line-height: 1; text-shadow: 0 0 20px rgba(16,185,129,0.4);">${icon}</div>
        <h3 style="margin-bottom: 8px; font-size: 1.3rem;">${title}</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">${subtitle}</p>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
        });
    });

    setTimeout(() => {
        modal.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(-10px)';
        setTimeout(() => {
            modal.remove();
            if(callback) callback();
        }, 300);
    }, 1800);
}

function showConfirmModal(title, subtitle, onConfirm) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
    modal.style.backdropFilter = 'blur(8px)';
    modal.style.webkitBackdropFilter = 'blur(8px)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';

    const card = document.createElement('div');
    card.className = 'card glass';
    card.style.textAlign = 'center';
    card.style.transform = 'scale(0.8) translateY(20px)';
    card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.maxWidth = '80%';
    card.style.minWidth = '250px';
    card.style.margin = '0';
    card.style.padding = '30px 20px';

    card.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 15px; line-height: 1;">⚠️</div>
        <h3 style="margin-bottom: 8px; font-size: 1.3rem;">${title}</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">${subtitle}</p>
        <div style="display: flex; gap: 10px;">
            <button id="btn-cancel" style="background: rgba(120,120,120,0.2); color: var(--text-main); margin: 0;">Annuler</button>
            <button id="btn-confirm" style="background: var(--danger); color: white; margin: 0;">Confirmer</button>
        </div>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
        });
    });

    const closeModal = () => {
        modal.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(-10px)';
        setTimeout(() => modal.remove(), 300);
    };

    document.getElementById('btn-cancel').onclick = closeModal;
    document.getElementById('btn-confirm').onclick = () => {
        closeModal();
        if(onConfirm) onConfirm();
    };
}

function toggleTheme() { 
    document.body.classList.toggle('light-mode'); 
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}
function setFilter(f, el) { 
    currentFilter = f; 
    localStorage.setItem('currentFilter', f);
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active'); loadData();
}

function setToggle(inputId, value, el) {
    document.getElementById(inputId).value = value;
    const parent = el.parentElement;
    parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

// Restore theme
if(localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

// Restore filter visually
window.addEventListener('DOMContentLoaded', () => {
    const activeBtn = document.querySelector(`.filter-btn[onclick="setFilter('${currentFilter}', this)"]`);
    if(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
        activeBtn.classList.add('active');
    }
});

const request = indexedDB.open("BetTrackerDB_V3", 3);
request.onupgradeneeded = e => {
    let d = e.target.result;
    if(!d.objectStoreNames.contains("transactions")) d.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
    if(!d.objectStoreNames.contains("bets")) d.createObjectStore("bets", { keyPath: "id", autoIncrement: true });
    if(!d.objectStoreNames.contains("config")) d.createObjectStore("config", { keyPath: "key" });
    if(!d.objectStoreNames.contains("archives")) d.createObjectStore("archives", { keyPath: "id", autoIncrement: true });
};
request.onsuccess = e => { db = e.target.result; loadConfig(); loadData(); };

function saveConfig() {
    const monTarget = document.getElementById('mon-target');
    if (!monTarget) return;
    const conf = { key: "settings", target: parseFloat(monTarget.value)||1000, cMin: parseFloat(document.getElementById('mon-c-min').value)||1.3, cMax: parseFloat(document.getElementById('mon-c-max').value)||1.8 };
    db.transaction("config", "readwrite").objectStore("config").put(conf);
    loadData();
}

function loadConfig() {
    db.transaction("config").objectStore("config").get("settings").onsuccess = e => {
        const r = e.target.result;
        if(r) { 
            const monTarget = document.getElementById('mon-target');
            if (monTarget) {
                monTarget.value=r.target; 
                document.getElementById('mon-c-min').value=r.cMin; 
                document.getElementById('mon-c-max').value=r.cMax; 
            }
        }
    };
}

function isDateOk(ts) {
    const d = new Date(ts), now = new Date();
    if(currentFilter === 'today') return d.toDateString() === now.toDateString();
    if(currentFilter === 'week') { 
        const tempNow = new Date();
        const start = new Date(tempNow.setDate(tempNow.getDate() - tempNow.getDay() + (tempNow.getDay() === 0 ? -6 : 1)));
        start.setHours(0,0,0,0); return d >= start; 
    }
    if(currentFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
}

function loadData() {
    if(!db) return;
    let absDepG=0, absWitG=0, absWonG=0, absLostG=0, absPendingG=0;
    let absDepM=0, absWitM=0, absWonM=0, absLostM=0, absPendingM=0;
    
    let filWonG=0, filLostG=0, filInvG=0;
    
    let eventsG=[]; 
    let foundMontante = false; lastWonMontanteGain = 0;
    
    const searchInput = document.getElementById('search-bet');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    let blistHTML = ''; let mlistHTML = ''; let tlistHTML = ''; let alistHTML = '';
    let mBets = [];

    const archivesList = document.getElementById('archives-list');
    const storeNames = archivesList ? ["transactions", "bets", "archives"] : ["transactions", "bets"];
    const tx = db.transaction(storeNames, "readonly");
    tx.objectStore("transactions").openCursor(null, "prev").onsuccess = e => {
        const c = e.target.result;
        if(c) {
            const v = c.value;
            const isM = v.target === 'montante';
            if(isM) { if(v.type==='deposit') absDepM+=v.amount; else absWitM+=v.amount; }
            else { 
                if(v.type==='deposit') absDepG+=v.amount; else absWitG+=v.amount; 
                eventsG.push({d: v.date, t: v.type, a: v.amount}); 
            }
            
            tlistHTML += `<div class="list-item glass"><div style="display:flex; justify-content:space-between"><strong>${v.type==='deposit'?'Dépôt':'Retrait'} (${isM?'Montante':'Générale'})</strong><span style="color:${v.type==='deposit'?'var(--accent)':'var(--danger)'}; font-weight:bold;">${v.type==='deposit'?'+':'-'}${v.amount} FC</span></div><small style="margin-top:5px; color:var(--text-muted);">${new Date(v.date).toLocaleString()}</small></div>`;
            c.continue();
        }
    };

    const blist = document.getElementById('bets-list'), mlist = document.getElementById('montante-list'), tlist = document.getElementById('trans-list');

    tx.objectStore("bets").openCursor(null, "prev").onsuccess = e => {
        const c = e.target.result;
        if(c) {
            const v = c.value; const gain = v.stake * v.odds; 
            const okDate = isDateOk(v.date);
            const okSearch = !search || v.match.toLowerCase().includes(search) || (v.tag && v.tag.toLowerCase().includes(search));

            if(v.type === 'montante') {
                if(v.status==='won') { absWonM+=(gain-v.stake); }
                else if(v.status==='lost') absLostM+=v.stake; else absPendingM+=v.stake;
                
                if(!foundMontante) { foundMontante = true; if(v.status==='won') lastWonMontanteGain = gain; }
                
                mBets.push({v, gain});
            } else {
                if(v.status==='won') { absWonG+=(gain-v.stake); eventsG.push({d:v.date+1, t:'won', a:gain}); }
                else if(v.status==='lost') absLostG+=v.stake; else absPendingG+=v.stake;
                eventsG.push({d: v.date, t: 'placed', a: v.stake});

                if(okDate) {
                    if(v.status==='won') { filWonG+=(gain-v.stake); filInvG+=v.stake; }
                    else if(v.status==='lost') { filLostG+=v.stake; filInvG+=v.stake; }
                    
                    if(okSearch) blistHTML += buildCard(v, gain);
                }
            }
            c.continue();
        }
    };

    if (archivesList) {
        tx.objectStore("archives").openCursor(null, "prev").onsuccess = e => {
            const c = e.target.result;
            if(c) {
                const v = c.value;
                alistHTML += `<div class="list-item ${v.result} glass">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                        <strong>Session du ${new Date(v.date).toLocaleDateString()}</strong>
                        <span>${v.result === 'won' ? '🏆 Succès' : '❌ Échec'}</span>
                    </div>
                    <small>Objectif: ${v.target} FC | Résultat: ${v.finalAmount.toFixed(2)} FC</small>
                </div>`;
                c.continue();
            }
        };
    }

    tx.oncomplete = () => {
        if(blist) blist.innerHTML = blistHTML;
        
        mBets.reverse();
        let stepCounter = 1;
        mBets.forEach(item => {
            item.v.step = stepCounter;
            if(item.v.status === 'lost') stepCounter = 1;
            else if(item.v.status === 'won') stepCounter++;
        });
        mBets.reverse();
        mBets.forEach(item => mlistHTML += buildCard(item.v, item.gain));
        
        if(mlist) mlist.innerHTML = mlistHTML;
        if(tlist) tlist.innerHTML = tlistHTML;
        if(archivesList) archivesList.innerHTML = alistHTML;

        const elTotalDep = document.getElementById('ui-total-dep');
        if (elTotalDep) elTotalDep.innerText = (absDepG + absDepM).toFixed(2) + ' FC';
        const elTotalWit = document.getElementById('ui-total-wit');
        if (elTotalWit) elTotalWit.innerText = (absWitG + absWitM).toFixed(2) + ' FC';

        const bkG = absDepG - absWitG + absWonG - absLostG - absPendingG;
        const bkM = absDepM - absWitM + absWonM - absLostM - absPendingM;
        
        const profitFil = filWonG - filLostG;
        const roiFil = filInvG > 0 ? (profitFil / filInvG * 100) : 0;

        const elBkG = document.getElementById('ui-bankroll');
        if (elBkG) elBkG.innerText = bkG.toFixed(2);
        const elProfit = document.getElementById('ui-profit');
        if (elProfit) elProfit.innerText = profitFil.toFixed(2);
        const elRoi = document.getElementById('ui-roi');
        if (elRoi) elRoi.innerText = roiFil.toFixed(1) + "%";
        const elBkM = document.getElementById('ui-bankroll-montante');
        if (elBkM) elBkM.innerText = bkM.toFixed(2);
        
        const elTarget = document.getElementById('mon-target');
        if (elTarget) {
            const target = parseFloat(elTarget.value), cMin = parseFloat(document.getElementById('mon-c-min').value);
            
            const progBar = document.getElementById('mon-progress-bar');
            const progText = document.getElementById('mon-progress-text');
            const pct = Math.max(0, Math.min(100, (bkM / target) * 100));
            if(progBar) progBar.style.width = pct.toFixed(1) + "%";
            if(progText) progText.innerText = pct.toFixed(1) + "%";
            
            const elPred = document.getElementById('ui-prediction');
            if(bkM <= 0) {
                elPred.innerText = "Alimentez la cagnotte pour commencer !";
            } else if(bkM >= target) {
                elPred.innerText = "Objectif Atteint ! 🏆🎉";
            } else {
                const steps = Math.ceil(Math.log(target/bkM)/Math.log(cMin));
                elPred.innerHTML = `🌟 Si vous validez <b>${steps} étapes</b> (cote ${cMin}), l'objectif est atteint !`;
            }
            
            const elMonStake = document.getElementById('mon-stake');
            if(lastWonMontanteGain > 0) elMonStake.value = lastWonMontanteGain.toFixed(2);
            else elMonStake.value = '';
        }
        
        const cv = document.getElementById('chart-main');
        if (cv) drawChart(eventsG);
    };
}

function buildCard(v, gain) {
    return `<div class="list-item ${v.status} glass">
        <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-bottom: 5px;">
            <div style="font-weight:bold; line-height: 1.4; padding-right: 10px; flex-grow: 1;">
                ${v.type==='montante' ? `<span class="step-badge">Étape ${v.step}</span><br>` : ''}
                ${v.match.replace(/\n/g, '<br>')}
            </div>
            <div style="display:flex; align-items:center; gap: 8px;">
                <span>${v.status==='won'?'✅':v.status==='lost'?'❌':'⏳'}</span>
                <button onclick="deleteBet(${v.id})" style="background:transparent; border:none; color:var(--text-muted); padding:5px; margin:0; width:auto; cursor:pointer;" title="Supprimer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
        <div style="margin:5px 0;"><span class="tag">${v.type.toUpperCase()}</span>${(v.tag && v.tag.toLowerCase() !== v.type.toLowerCase())?`<span class="tag">${v.tag}</span>`:''}</div>
        <small>Mise: ${v.stake} FC | Cote: ${v.odds} | Pot: ${gain.toFixed(2)} FC</small>
        ${v.status==='pending'?`<div style="display:flex; gap:10px; margin-top:10px;"><button onclick="setS(${v.id},'won')" style="background:var(--accent); padding:6px; font-size:0.8rem;">Gagné</button><button onclick="setS(${v.id},'lost')" style="background:var(--danger); padding:6px; font-size:0.8rem;">Perdu</button></div>`:''}
    </div>`;
}

function setS(id, s) { const tx = db.transaction("bets", "readwrite"); const st = tx.objectStore("bets"); st.get(id).onsuccess = e => { let d=e.target.result; d.status=s; st.put(d); tx.oncomplete=loadData; }; }

function deleteBet(id) {
    showConfirmModal("Supprimer ce pari ?", "Cette action retirera le pari de l'historique et recalculera automatiquement la Bankroll.", () => {
        db.transaction("bets", "readwrite").objectStore("bets").delete(id).onsuccess = () => {
            showToast("Pari supprimé avec succès");
            loadData();
        };
    });
}

function openHelpModal() {
    const m = document.getElementById('help-modal');
    const s = document.getElementById('help-sheet');
    if(!m || !s) return;
    m.style.pointerEvents = 'auto';
    m.style.opacity = '1';
    s.style.transform = 'translateY(0)';
}
function closeHelpModal() {
    const m = document.getElementById('help-modal');
    const s = document.getElementById('help-sheet');
    if(!m || !s) return;
    s.style.transform = 'translateY(100%)';
    m.style.opacity = '0';
    setTimeout(() => m.style.pointerEvents = 'none', 300);
}

function calcTools() {
    const cs1 = parseFloat(document.getElementById('cov-s1')?.value)||0;
    const co1 = parseFloat(document.getElementById('cov-o1')?.value)||0;
    const co2 = parseFloat(document.getElementById('cov-o2')?.value)||0;
    const cType = document.getElementById('cov-type')?.value;
    
    if(cs1>0 && co1>1 && co2>1) {
        let cs2 = 0, prof = 0;
        if(cType === 'zero') {
            cs2 = cs1 / (co2 - 1);
            prof = (cs1 * co1) - cs1 - cs2;
        } else {
            cs2 = (cs1 * co1) / co2;
            prof = (cs2 * co2) - cs1 - cs2;
        }
        document.getElementById('cov-res-stake').innerText = cs2.toFixed(2) + " FC";
        const pEl = document.getElementById('cov-res-profit');
        pEl.innerText = (prof > 0 ? "+" : "") + prof.toFixed(2) + " FC";
        pEl.style.color = prof > 0 ? "var(--accent)" : "var(--danger)";
    } else {
        const elS = document.getElementById('cov-res-stake');
        if (elS) elS.innerText = "0.00 FC";
        const elP = document.getElementById('cov-res-profit');
        if (elP) { elP.innerText = "0.00 FC"; elP.style.color = "var(--text-main)"; }
    }

    const dbg = parseFloat(document.getElementById('dut-budget')?.value)||0;
    const do1 = parseFloat(document.getElementById('dut-o1')?.value)||0;
    const do2 = parseFloat(document.getElementById('dut-o2')?.value)||0;
    if(dbg>0 && do1>1 && do2>1) {
        const arb = (1/do1) + (1/do2);
        const p1 = (1/do1) / arb;
        const s1 = dbg * p1;
        const s2 = dbg - s1;
        document.getElementById('dut-s1').innerText = s1.toFixed(2) + " FC";
        document.getElementById('dut-s2').innerText = s2.toFixed(2) + " FC";
        
        const ret = s1 * do1;
        const prof = ret - dbg;
        document.getElementById('dut-ret').innerText = ret.toFixed(2) + " FC";
        const pEl = document.getElementById('dut-prof');
        pEl.innerText = `(${(prof>0?'+':'')}${prof.toFixed(2)})`;
        pEl.style.color = prof > 0 ? "var(--accent)" : "var(--danger)";
    } else {
        const elS1 = document.getElementById('dut-s1'); if(elS1) elS1.innerText = "0.00 FC";
        const elS2 = document.getElementById('dut-s2'); if(elS2) elS2.innerText = "0.00 FC";
        const elRet = document.getElementById('dut-ret'); if(elRet) elRet.innerText = "0.00 FC";
        const elProf = document.getElementById('dut-prof'); if(elProf) elProf.innerText = "";
    }

    const kbk = parseFloat(document.getElementById('kel-bk')?.value)||0;
    const ko = parseFloat(document.getElementById('kel-o')?.value)||0;
    const kp = parseFloat(document.getElementById('kel-p')?.value)||0;
    if(kbk>0 && ko>1 && kp>0) {
        const p = kp / 100;
        const q = 1 - p;
        const b = ko - 1;
        const f = (b * p - q) / b;
        if(f > 0) {
            document.getElementById('kel-res').innerText = (kbk * f).toFixed(2) + " FC";
            document.getElementById('kel-pct').innerText = `(${(f*100).toFixed(1)}%)`;
        } else {
            document.getElementById('kel-res').innerText = "0.00 FC";
            document.getElementById('kel-pct').innerText = "(Ne pas parier)";
        }
    } else {
        const elRes = document.getElementById('kel-res'); if(elRes) elRes.innerText = "0.00 FC";
        const elPct = document.getElementById('kel-pct'); if(elPct) elPct.innerText = "(0%)";
    }

    const cvo = parseFloat(document.getElementById('conv-o')?.value)||0;
    if(cvo>1.0) {
        document.getElementById('conv-p').innerText = ((1/cvo)*100).toFixed(1) + "%";
        let us = 0;
        if(cvo >= 2.0) us = (cvo - 1) * 100;
        else us = -100 / (cvo - 1);
        document.getElementById('conv-us').innerText = (us > 0 ? "+" : "") + Math.round(us);
    } else {
        const elP = document.getElementById('conv-p'); if (elP) elP.innerText = "0%";
        const elUs = document.getElementById('conv-us'); if (elUs) elUs.innerText = "0";
    }
}

function setAllInMontante() {
    const bkMText = document.getElementById('ui-bankroll-montante').innerText;
    const bkM = parseFloat(bkMText) || 0;
    const elStake = document.getElementById('mon-stake');
    if (elStake && bkM > 0) elStake.value = bkM.toFixed(2);
}

function resetMontante() {
    showConfirmModal(
        "Archiver la Montante",
        "Voulez-vous archiver cette montante ? La cagnotte sera réinitialisée à 0 FC, mais l'historique sera conservé.",
        () => {
            const bkMText = document.getElementById('ui-bankroll-montante').innerText;
            const bkM = parseFloat(bkMText) || 0;
            const targetText = document.getElementById('mon-target') ? document.getElementById('mon-target').value : 0;
            const target = parseFloat(targetText) || 1000;
            
            if(bkM !== 0) {
                const tx = db.transaction(["transactions", "archives"], "readwrite");
                const d = { target: 'montante', type: bkM > 0 ? 'withdrawal' : 'deposit', amount: Math.abs(bkM), date: Date.now() };
                tx.objectStore("transactions").add(d);
                tx.objectStore("archives").add({ date: Date.now(), finalAmount: bkM, target: target, result: bkM >= target ? 'won' : 'lost' });
                
                tx.oncomplete = () => { 
                    showSuccessModal("Archivage Réussi", "La cagnotte a été remise à zéro.", () => loadData(), "📦");
                };
            } else {
                showToast("La montante est déjà à 0 FC.");
            }
        }
    );
}

function setupListeners() {
    const formBet = document.getElementById('form-bet');
    if (formBet) formBet.onsubmit = e => { e.preventDefault(); addB('general'); e.target.reset(); };

    const formMontante = document.getElementById('form-montante');
    if (formMontante) formMontante.onsubmit = e => { e.preventDefault(); addB('montante'); e.target.reset(); };

    const formTrans = document.getElementById('form-trans');
    if (formTrans) formTrans.onsubmit = e => {
        e.preventDefault();
        const target = document.getElementById('trans-target').value;
        const type = document.getElementById('trans-type').value;
        const amount = parseFloat(document.getElementById('trans-amount').value);
        const d = { target, type, amount, date: Date.now() };
        db.transaction("transactions", "readwrite").objectStore("transactions").add(d).onsuccess = () => { 
            e.target.reset(); 
            const isDep = type === 'deposit';
            const sign = isDep ? '+' : '-';
            showSuccessModal(
                isDep ? "Dépôt Validé" : "Retrait Validé", 
                `<b style="color:${isDep?'var(--accent)':'var(--danger)'}">${sign}${amount} FC</b> sur la ${target==='montante'?'Cagnotte Montante':'Bankroll Générale'}`, 
                () => { window.location.href = 'index.html'; },
                isDep ? "💰" : "💳"
            );
        };
    };
    
    const searchBet = document.getElementById('search-bet');
    if (searchBet) searchBet.addEventListener('input', loadData);
}
window.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    const splash = document.getElementById('splash-screen');
    if(splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.visibility = 'hidden';
            setTimeout(() => splash.remove(), 600);
        }, 1200);
    }
});

function addB(t) {
    const isM = t==='montante';
    
    // Safety check for form elements
    const betTypeEl = document.getElementById('bet-type');
    const betMatchEl = document.getElementById(isM?'mon-match':'bet-match');
    const betTagEl = document.getElementById('bet-tag');
    const betOddsEl = document.getElementById(isM?'mon-odds':'bet-odds');
    const betStakeEl = document.getElementById(isM?'mon-stake':'bet-stake');

    if (!betMatchEl || !betOddsEl || !betStakeEl) return;

    const d = { 
        type: isM?'montante':(betTypeEl ? betTypeEl.value : 'simple'), 
        match: betMatchEl.value, 
        tag: isM?'':(betTagEl ? betTagEl.value.trim() : ''), 
        odds: parseFloat(betOddsEl.value), 
        stake: parseFloat(betStakeEl.value), 
        status: 'pending', date: Date.now() 
    };
    db.transaction("bets", "readwrite").objectStore("bets").add(d).onsuccess = () => { 
        showToast("Pari enregistré"); 
        if(!isM) window.location.href = 'index.html';
        else loadData(); 
    };
}

function drawChart(evs) {
    const cv = document.getElementById('chart-main');
    if(!cv || cv.offsetWidth === 0) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth, H = cv.height = cv.offsetHeight;
    evs.sort((a,b)=>a.d-b.d); let b=0, pts=[{x:0,y:0}];
    evs.forEach((e,i) => { if(e.t==='deposit') b+=e.a; else if(e.t==='withdrawal'||e.t==='placed') b-=e.a; else if(e.t==='won') b+=e.a; pts.push({x:i+1, y:b}); });
    if(pts.length<2) return;
    const maxY=Math.max(...pts.map(p=>p.y)), minY=Math.min(...pts.map(p=>p.y)), r=maxY-minY||1;
    ctx.clearRect(0,0,W,H); ctx.beginPath(); ctx.strokeStyle="#10b981"; ctx.lineWidth=3;
    pts.forEach((p,i)=>{ const x=(i/(pts.length-1))*W, y=H-((p.y-minY)/r)*(H-20)-10; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fillStyle="rgba(16, 185, 129, 0.1)"; ctx.fill();
}

/* --- PWA SYSTEM --- */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'flex';
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('✅ Service Worker enregistré:', reg.scope);
    }).catch(err => console.warn('SW non enregistré:', err));
}
