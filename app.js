const quizForm=document.getElementById("quizForm"),generateBtn=document.getElementById("generateBtn"),resetBtn=document.getElementById("resetBtn");
const problemIp=document.getElementById("problemIp"),problemPrefix=document.getElementById("problemPrefix");
const timerEl=document.getElementById("timer"),attemptsEl=document.getElementById("attempts"),correctCountEl=document.getElementById("correctCount"),scorePercentEl=document.getElementById("scorePercent");
const reviewScore=document.getElementById("reviewScore"),reviewPercent=document.getElementById("reviewPercent"),reviewAttempts=document.getElementById("reviewAttempts"),reviewTime=document.getElementById("reviewTime"),progressBar=document.getElementById("progressBar");
const validationMessage=document.getElementById("validationMessage"),resultMessage=document.getElementById("resultMessage");
const fields=[
{key:"network",input:"answerNetwork",wrapper:"fieldNetwork",feedback:"feedbackNetwork"},
{key:"mask",input:"answerMask",wrapper:"fieldMask",feedback:"feedbackMask"},
{key:"broadcast",input:"answerBroadcast",wrapper:"fieldBroadcast",feedback:"feedbackBroadcast"},
{key:"firstUsable",input:"answerFirst",wrapper:"fieldFirst",feedback:"feedbackFirst"},
{key:"lastUsable",input:"answerLast",wrapper:"fieldLast",feedback:"feedbackLast"}].map(x=>({...x,inputEl:document.getElementById(x.input),wrapperEl:document.getElementById(x.wrapper),feedbackEl:document.getElementById(x.feedback)}));
let currentProblem=null,attempts=0,elapsedSeconds=0,timerId=null,quizCompleted=false;

function parseIPv4(ip){const p=ip.trim().split(".");if(p.length!==4)return null;const o=p.map(x=>/^\d{1,3}$/.test(x)?Number(x):NaN);return o.some(n=>!Number.isInteger(n)||n<0||n>255)?null:o}
function octetsToUint32(o){return((((o[0]<<24)>>>0)|(o[1]<<16)|(o[2]<<8)|o[3])>>>0)}
function uint32ToIPv4(v){v=v>>>0;return[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255].join(".")}
function prefixToMask(p){return p===0?0:(0xffffffff<<(32-p))>>>0}
function calculateSubnet(ip,prefix){const o=parseIPv4(ip),ipInt=octetsToUint32(o),maskInt=prefixToMask(prefix),wild=(~maskInt)>>>0,networkInt=(ipInt&maskInt)>>>0,broadcastInt=(networkInt|wild)>>>0;return{ip,prefix,network:uint32ToIPv4(networkInt),mask:uint32ToIPv4(maskInt),broadcast:uint32ToIPv4(broadcastInt),firstUsable:uint32ToIPv4((networkInt+1)>>>0),lastUsable:uint32ToIPv4((broadcastInt-1)>>>0)}}
function randomInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function generateRandomIPv4(){let f;do{f=randomInt(1,223)}while(f===127);return[f,randomInt(0,255),randomInt(0,255),randomInt(1,254)].join(".")}
function generateRandomPrefix(){return randomInt(16,30)}
function formatTime(s){return`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`}
function updateTimer(){const v=formatTime(elapsedSeconds);timerEl.textContent=v;reviewTime.textContent=v}
function startTimer(){stopTimer();timerId=setInterval(()=>{if(!quizCompleted){elapsedSeconds++;updateTimer()}},1000)}
function stopTimer(){if(timerId){clearInterval(timerId);timerId=null}}
function clearFeedback(){fields.forEach(f=>{f.wrapperEl.classList.remove("correct","incorrect");f.feedbackEl.textContent=""});validationMessage.classList.add("hidden");resultMessage.className="result-message";resultMessage.textContent="Jawaban belum diperiksa."}
function clearInputs(){fields.forEach(f=>f.inputEl.value="")}
function resetStats(){attempts=0;elapsedSeconds=0;quizCompleted=false;attemptsEl.textContent="0";correctCountEl.textContent="0 / 5";scorePercentEl.textContent="0%";reviewScore.textContent="0 / 5";reviewPercent.textContent="0%";reviewAttempts.textContent="0";progressBar.style.width="0%";updateTimer()}
function generateProblem(){clearFeedback();clearInputs();const ip=generateRandomIPv4(),prefix=generateRandomPrefix();currentProblem=calculateSubnet(ip,prefix);problemIp.textContent=ip;problemPrefix.textContent=`/${prefix}`;resetStats();startTimer();fields[0].inputEl.focus()}
function normalizeIPv4(v){const p=parseIPv4(v);return p?p.join("."):null}
function validateAll(){const bad=fields.filter(f=>normalizeIPv4(f.inputEl.value)===null);if(bad.length){validationMessage.textContent="Isi semua jawaban dengan format IPv4 yang valid, misalnya 192.168.1.0.";validationMessage.classList.remove("hidden");bad[0].inputEl.focus();return false}validationMessage.classList.add("hidden");return true}
function grade(){if(!currentProblem||!validateAll())return;attempts++;let correct=0;fields.forEach(f=>{const ok=normalizeIPv4(f.inputEl.value)===currentProblem[f.key];f.wrapperEl.classList.remove("correct","incorrect");f.wrapperEl.classList.add(ok?"correct":"incorrect");f.feedbackEl.textContent=ok?"✓ Benar":"✗ Belum tepat";if(ok)correct++});const pct=Math.round(correct/5*100);attemptsEl.textContent=attempts;correctCountEl.textContent=`${correct} / 5`;scorePercentEl.textContent=`${pct}%`;reviewScore.textContent=`${correct} / 5`;reviewPercent.textContent=`${pct}%`;reviewAttempts.textContent=attempts;progressBar.style.width=`${pct}%`;if(correct===5){quizCompleted=true;stopTimer();resultMessage.className="result-message perfect";resultMessage.textContent=`Sempurna! Semua jawaban benar. Nilai ${pct}% dalam ${attempts} percobaan, waktu ${formatTime(elapsedSeconds)}.`}else{resultMessage.className="result-message";resultMessage.textContent=`${correct} dari 5 jawaban benar (${pct}%). Perbaiki jawaban yang berwarna merah, lalu periksa kembali.`}}
quizForm.addEventListener("submit",e=>{e.preventDefault();grade()});
generateBtn.addEventListener("click",generateProblem);
resetBtn.addEventListener("click",()=>{clearInputs();clearFeedback();resetStats();startTimer();fields[0].inputEl.focus()});
generateProblem();