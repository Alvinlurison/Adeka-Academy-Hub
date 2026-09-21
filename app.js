async function register(){

const fullName =
document.getElementById("fullName").value;

const email =
document.getElementById("email").value;

const phoneNumber =
document.getElementById("phoneNumber").value.trim();

const password =
document.getElementById("password").value;

const role =
document.getElementById("userRole").value;

try{

const userCredential =
await window.createUserWithEmailAndPassword(
window.auth,
email,
password
);

const user = userCredential.user;

await window.setDoc(
window.doc(
window.db,
"user",
user.uid
),
{
fullName: fullName,
email: email,
phoneNumber: phoneNumber,
role: role
}
);

localStorage.setItem(
"studentName",
fullName
);

localStorage.setItem(
"studentEmail",
email
);

localStorage.setItem(
"studentPhone",
phoneNumber
);

localStorage.setItem(
"studentRole",
role
);

if(document.getElementById("rememberMe").checked){
localStorage.setItem("rememberedEmail", email);
localStorage.setItem("rememberedName", fullName);
}else{
localStorage.removeItem("rememberedEmail");
localStorage.removeItem("rememberedName");
}

document.getElementById("profileName").innerText = fullName;
document.getElementById("profileEmail").innerText = email;

document.getElementById("auth").style.display = "none";
document.getElementById("dashboard").classList.remove("hidden");
/* profileSection removed */
document.getElementById("dashboardHome").classList.remove("hidden");

showChatBubble();
startGlobalDmListener();
showLogoutButton();
showQuickAccessButtons();
renderGreeting();
setTimeout(showAIGreetingCard, 1200);
updateMiniProfile();

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

document.getElementById("message").innerText =
"Account created successfully!";

setTimeout(() => {
    document.getElementById("message").innerText = "";
}, 3000);
    }catch(error){

        showToast(error.message);
}

 }

  // Hides every dashboard sub-section. Used by all the "open___()" functions
  // below so they don't each have to repeat the same list of IDs.
  function hideAllSections(){

// The conversation-list and thread listeners are screen-specific and
// stop here. The globalDmUnsubscribe listener (for notifications) is
// separate and keeps running in the background regardless — see
// startGlobalDmListener().
if(typeof conversationListUnsubscribe !== "undefined" && conversationListUnsubscribe){
conversationListUnsubscribe();
conversationListUnsubscribe = null;
}

if(typeof threadUnsubscribe !== "undefined" && threadUnsubscribe){
threadUnsubscribe();
threadUnsubscribe = null;
}

document.getElementById("dashboardHome").classList.add("hidden");
document.getElementById("tasksSection").classList.add("hidden");
document.getElementById("badgesSection").classList.add("hidden");
document.getElementById("progressSection").classList.add("hidden");
document.getElementById("notesSection").classList.add("hidden");
document.getElementById("aiTutorSection").classList.add("hidden");
document.getElementById("meetingSection").classList.add("hidden");
document.getElementById("audioSection").classList.add("hidden");
document.getElementById("settingsSection").classList.add("hidden");
document.getElementById("quizSection").classList.add("hidden");
document.getElementById("messagesSection").classList.add("hidden");
document.getElementById("gesSection").classList.add("hidden");
document.getElementById("searchSection").classList.add("hidden");
document.getElementById("filesSection").classList.add("hidden");
document.getElementById("officeSection").classList.add("hidden");
document.getElementById("privacySection").classList.add("hidden");
document.getElementById("learningHubSection").classList.add("hidden");
document.getElementById("toolsHubSection").classList.add("hidden");

}

  // Closes the side menu without ever re-opening it (unlike toggleMenu()).
  function closeMenu(){

document.getElementById("sideMenu").classList.remove("show");

}

  // The floating "Back" button is shown for every sub-section and always
  // sits in the same spot (top-left), so it's predictable no matter which
  // page you're on.
  function showBackButton(){

document.getElementById("floatingBack").classList.remove("hidden");

}

function hideBackButton(){

document.getElementById("floatingBack").classList.add("hidden");

}

function showLogoutButton(){

document.getElementById("floatingLogout").classList.remove("hidden");

}

function hideLogoutButton(){

document.getElementById("floatingLogout").classList.add("hidden");

}

function showQuickAccessButtons(){

// The floating Notes/Audio/Quiz shortcut tiles were removed from the
// UI (kept only the chat bubble) — this is now a no-op so any
// existing call sites elsewhere don't break.

}

function hideQuickAccessButtons(){

}

function toggleHelp(){

document.getElementById("helpModal").classList.toggle("show");

}

function viewProfilePicture(){

const pic = localStorage.getItem("profilePicture") || document.getElementById("profileImage").src;

if(!pic || pic.indexOf("data:") !== 0){
showToast("No profile picture set yet");
return;
}

document.getElementById("lightboxImage").src = pic;

document.getElementById("picLightbox").classList.add("show");

}

function closeLightbox(){

document.getElementById("picLightbox").classList.remove("show");

}

// ---- Live Class Chat ----
// A single shared chat room that every logged-in student can read and
// post to. Uses Firestore's real-time listener (onSnapshot) so new
// messages appear instantly without anyone needing to refresh.

let chatUnsubscribe = null;
let isInitialClassChatLoad = true;

// ---- Notifications (free, foreground version) ----
// True background push (notifying even when the app/tab is fully
// closed) needs Firebase Cloud Messaging + a server trigger, which
// needs the paid Blaze plan. This version works while the app is open
// in any tab (even unfocused) — it just can't wake up a closed app.

function showAppNotification(title, body, onClick){

if(localStorage.getItem("notificationsEnabled") !== "on") return;
if(!("Notification" in window) || Notification.permission !== "granted") return;

try{

const notification = new Notification(title, { body: body, icon: "icon-192.png" });

if(onClick){

notification.onclick = function(){
window.focus();
notification.close();
onClick();
};

}

}catch(error){
console.log("Notification error:", error);
}

}

async function toggleNotifications(){

const wantsOn = document.getElementById("notifSwitch").checked;

if(!wantsOn){
localStorage.setItem("notificationsEnabled", "off");
document.getElementById("notifStatus").innerText =
"Notifications turned off.";
return;
}

if(!("Notification" in window)){
document.getElementById("notifSwitch").checked = false;
document.getElementById("notifStatus").innerText =
"Sorry, your browser doesn't support notifications.";
return;
}

const permission = await Notification.requestPermission();

if(permission === "granted"){

localStorage.setItem("notificationsEnabled", "on");

document.getElementById("notifStatus").innerText =
"✅ Notifications on — works while the app is open (even in another tab).";

}else{

document.getElementById("notifSwitch").checked = false;
localStorage.setItem("notificationsEnabled", "off");

document.getElementById("notifStatus").innerText =
"Blocked — enable notifications for this site in your browser settings if you change your mind.";

}

}

function loadNotificationPref(){

const isOn = localStorage.getItem("notificationsEnabled") === "on"
&& "Notification" in window
&& Notification.permission === "granted";

document.getElementById("notifSwitch").checked = isOn;

}

function showChatBubble(){

document.getElementById("chatBubble").classList.remove("hidden");

}

function hideChatBubble(){

document.getElementById("chatBubble").classList.add("hidden");
document.getElementById("chatPanel").classList.remove("show");

}

function toggleChatPanel(){

document.getElementById("chatPanel").classList.toggle("show");

}

// Class Chat is shared by EVERY account on the app, worldwide — not
// just your students. This requires a PIN before it opens, and (most
// importantly) the same check is enforced in your Firestore Security
// Rules, not just here in the UI — so it's real access control, not
// just something a stranger could bypass by poking around with dev
// tools. See the rule snippet provided alongside this update.
function openClassChatGuarded(){

if(document.getElementById("chatPanel").classList.contains("show")){
toggleChatPanel();
return;
}

if(localStorage.getItem("classChatVerified") === "yes"){
startChatListener();
toggleChatPanel();
return;
}

document.getElementById("classPinModalError").innerText = "";
document.getElementById("classPinModalInput").value = "";
document.getElementById("classPinModal").classList.add("show");

}

function closeClassPinModal(){

document.getElementById("classPinModal").classList.remove("show");

}

async function submitClassPin(){

const enteredPin = document.getElementById("classPinModalInput").value.trim();

if(!enteredPin) return;

const errorEl = document.getElementById("classPinModalError");

try{

const pinDoc = await window.getDoc(
window.doc(window.db, "settings", "classChat")
);

const correctPin = pinDoc.exists() ? pinDoc.data().pin : null;

if(!correctPin){
errorEl.innerText = "No class PIN has been set up yet. Ask your app admin to set one under Settings.";
return;
}

if(enteredPin !== correctPin){
errorEl.innerText = "Incorrect PIN. Try again.";
return;
}

const user = window.auth.currentUser;

if(user){

await window.setDoc(
window.doc(window.db, "user", user.uid),
{ classChatVerified: true },
{ merge: true }
);

}

localStorage.setItem("classChatVerified", "yes");

closeClassPinModal();
startChatListener();
toggleChatPanel();

}catch(error){

errorEl.innerText = "Couldn't verify PIN right now: " + error.message;

}

}

// Lightweight, non-blocking toast — replaces plain showToast(...) calls
// (which used to be alert()) so warnings/errors don't show the
// "yoursite.github.io says" browser branding either.
function showToast(message){

let toast = document.getElementById("appToast");

if(!toast){
toast = document.createElement("div");
toast.id = "appToast";
document.body.appendChild(toast);
}

toast.innerText = message;
toast.classList.add("show");

clearTimeout(window._toastTimeout);

window._toastTimeout = setTimeout(() => {
toast.classList.remove("show");
}, 3200);

}

// Generic replacements for confirm() and prompt() so every yes/no
// choice or text-entry dialog in the app looks the same (and never
// shows browser branding).
let genericConfirmCallback = null;
let genericPromptCallback = null;

function showConfirmModal(message, yesLabel, onYes){

document.getElementById("genericConfirmText").innerText = message;
document.getElementById("genericConfirmYesBtn").innerText = yesLabel || "Yes";
genericConfirmCallback = onYes;

document.getElementById("genericConfirmModal").classList.add("show");

}

function genericConfirmYes(){

const callback = genericConfirmCallback;
closeGenericConfirm();

if(callback) callback();

}

function closeGenericConfirm(){

genericConfirmCallback = null;
document.getElementById("genericConfirmModal").classList.remove("show");

}

function showPromptModal(message, defaultValue, onSubmit){

document.getElementById("genericPromptText").innerText = message;
document.getElementById("genericPromptInput").value = defaultValue || "";
genericPromptCallback = onSubmit;

document.getElementById("genericPromptModal").classList.add("show");

}

function genericPromptSubmit(){

const value = document.getElementById("genericPromptInput").value;
const callback = genericPromptCallback;

closeGenericPrompt();

if(callback) callback(value);

}

function closeGenericPrompt(){

genericPromptCallback = null;
document.getElementById("genericPromptModal").classList.remove("show");

}

// Lets a user set a local-only nickname for someone they're messaging
// — same idea as saving a contact name in WhatsApp. It's stored only
// on this device and never changes the other person's actual account.
function openEditNicknameModal(){

if(!currentThreadOtherUid) return;

const existing = localStorage.getItem("contactNickname_" + currentThreadOtherUid) || "";

document.getElementById("editNicknameInput").value = existing;
document.getElementById("editNicknameModal").classList.add("show");

}

function closeEditNicknameModal(){

document.getElementById("editNicknameModal").classList.remove("show");

}

function saveNickname(){

if(!currentThreadOtherUid) return;

const value = document.getElementById("editNicknameInput").value.trim();

if(value){
localStorage.setItem("contactNickname_" + currentThreadOtherUid, value);
document.getElementById("chatThreadTitle").innerText = value;
}

closeEditNicknameModal();

}

function resetNickname(){

if(!currentThreadOtherUid) return;

localStorage.removeItem("contactNickname_" + currentThreadOtherUid);

const convo = lastLoadedConversations.find((c) => c.id === currentConversationId);

if(convo && convo.participantNames){
document.getElementById("chatThreadTitle").innerText =
convo.participantNames[currentThreadOtherUid] || "Direct Chat";
}

closeEditNicknameModal();

}

async function setClassChatPin(){

const newPin = document.getElementById("classChatPinInput").value.trim();

if(!newPin){
showToast("Enter a PIN first");
return;
}

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

try{

await window.setDoc(
window.doc(window.db, "settings", "classChat"),
{ pin: newPin },
{ merge: true }
);

document.getElementById("classChatPinInput").value = "";

document.getElementById("message").innerText = "Class Chat PIN updated!";

setTimeout(() => {
document.getElementById("message").innerText = "";
}, 3000);

}catch(error){

showToast(error.message);

}

}

// Prevents one student's message from breaking the page or injecting
// code into everyone else's chat window.
function escapeHtml(str){

const div = document.createElement("div");
div.innerText = str;
return div.innerHTML;

}

// Firestore's native auto-delete (TTL) feature requires a paid plan,
// so this does the same job for free: any message older than the
// lifetime below gets deleted whenever someone opens the chat. Can be
// turned off in Settings.
const CHAT_MESSAGE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

function isAutoDeleteEnabled(){
return localStorage.getItem("autoDeleteMessages") !== "off"; // on by default
}

async function cleanupOldChatMessages(){

if(!isAutoDeleteEnabled()) return;

try{

const cutoff = new Date(Date.now() - CHAT_MESSAGE_LIFETIME_MS);

const q = window.query(
window.collection(window.db, "classChat"),
window.where("createdAt", "<", cutoff)
);

const querySnapshot = await window.getDocs(q);

for(const docSnap of querySnapshot.docs){
await window.deleteDoc(
window.doc(window.db, "classChat", docSnap.id)
);
}

}catch(error){

console.log("Chat cleanup error:", error);

}

}

async function cleanupOldThreadMessages(conversationId){

if(!isAutoDeleteEnabled()) return;

try{

const cutoff = new Date(Date.now() - CHAT_MESSAGE_LIFETIME_MS);

const q = window.query(
window.collection(window.db, "conversations", conversationId, "messages"),
window.where("createdAt", "<", cutoff)
);

const querySnapshot = await window.getDocs(q);

for(const docSnap of querySnapshot.docs){
await window.deleteDoc(
window.doc(window.db, "conversations", conversationId, "messages", docSnap.id)
);
}

}catch(error){

console.log("Thread cleanup error:", error);

}

}

function loadAutoDeletePref(){

document.getElementById("autoDeleteSwitch").checked = isAutoDeleteEnabled();

}

function toggleAutoDelete(){

const isOn = document.getElementById("autoDeleteSwitch").checked;

localStorage.setItem("autoDeleteMessages", isOn ? "on" : "off");

}

function clearChatHistory(){

showConfirmModal(
"Clear the entire class chat for everyone? This can't be undone.",
"Clear Chat",
async () => {

try{

const querySnapshot = await window.getDocs(
window.collection(window.db, "classChat")
);

for(const docSnap of querySnapshot.docs){
await window.deleteDoc(
window.doc(window.db, "classChat", docSnap.id)
);
}

}catch(error){

showToast(error.message);

}

}
);

}

function startChatListener(){

if(chatUnsubscribe){
return; // already listening, no need to attach twice
}

cleanupOldChatMessages();

isInitialClassChatLoad = true;

const q = window.query(
window.collection(window.db, "classChat"),
window.orderBy("createdAt", "asc"),
window.limit(50)
);

chatUnsubscribe = window.onSnapshot(q, (querySnapshot) => {

// Notify about genuinely new messages (skip the initial historical
// batch that fires the moment we first attach this listener).
if(!isInitialClassChatLoad){

const user = window.auth.currentUser;

querySnapshot.docChanges().forEach((change) => {

if(change.type !== "added") return;

const data = change.doc.data();

if(user && data.uid === user.uid) return; // it was me, skip

const chatIsOpenAndFocused =
document.getElementById("chatPanel").classList.contains("show") &&
document.hasFocus();

if(chatIsOpenAndFocused) return;

const preview = data.audioData ? "🎤 Voice message" : (data.imageData ? "📷 Photo" : (data.text || "New message"));

showAppNotification("💬 " + (data.name || "Class Chat"), preview);

});

}

isInitialClassChatLoad = false;

const currentUid = window.auth.currentUser ? window.auth.currentUser.uid : null;

let html = "";
lastLoadedChatMessages = {};

querySnapshot.forEach((docSnap) => {

const data = docSnap.data();

lastLoadedChatMessages[docSnap.id] = data;

html += renderMessageBubble("classChat", docSnap.id, data, currentUid);

});

const messagesDiv = document.getElementById("chatMessages");
messagesDiv.innerHTML = html;
messagesDiv.scrollTop = messagesDiv.scrollHeight;

}, (error) => {

console.log("Chat listener error:", error);

});

}

function stopChatListener(){

if(chatUnsubscribe){
chatUnsubscribe();
chatUnsubscribe = null;
}

document.getElementById("chatMessages").innerHTML = "";

}

async function sendChatMessage(){

const input = document.getElementById("chatInput");
const text = input.value.trim();

if(!text) return;

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

const name = getSavedStudentName();

try{

if(activeEdit && activeEdit.scope === "classChat"){

await window.updateDoc(
window.doc(window.db, "classChat", activeEdit.docId),
{ text: text, edited: true }
);

cancelComposerContext("classChat");
return;

}

const messageData = {
uid: user.uid,
name: name,
text: text,
createdAt: new Date()
};

if(activeReply && activeReply.scope === "classChat"){
messageData.replyToName = activeReply.name;
messageData.replyToText = activeReply.text;
}

await window.addDoc(
window.collection(window.db, "classChat"),
messageData
);

input.value = "";
cancelComposerContext("classChat");

}catch(error){

showToast(error.message);

}

}

// ---- Emoji picker, stickers & image sending ----
// Shared between Class Chat and private Message threads. Images are
// stored as compressed base64 text directly inside the chat message
// (no Firebase Storage / paid plan needed) — this keeps it free, at
// the cost of modest image quality.

let activeEmojiTarget = null;

const EMOJI_LIST = ["😀","😁","😂","🤣","😊","😍","😘","😜","🤔","😎","🙄","😢","😭","😡","🥳","😴","👍","👎","👏","🙏","💪","🤝","✌️","🤞","❤️","💛","💚","💙","💜","🔥","✨","🎉","🎓","📚","✅","❌","⭐","💯","🙌","👀","🤗","😬","😅","🥺","😇","🤩","🫡","🤓","😏","🚀","💡","📌","⏰","☀️","🌙","☕","🍎","⚽","🏀","🎵","💬","📷","👋","🤦"];
const STICKER_LIST = ["🎉","🔥","💯","👍","❤️","😂","🥳","🙌","👏","💪","🎓","✅","😍","🤩","🚀","⭐"];

function toggleEmojiPicker(targetInputId){

const picker = document.getElementById("emojiPicker");

if(!targetInputId){
picker.classList.remove("show");
activeEmojiTarget = null;
return;
}

if(picker.classList.contains("show") && activeEmojiTarget === targetInputId){
picker.classList.remove("show");
activeEmojiTarget = null;
return;
}

activeEmojiTarget = targetInputId;
renderEmojiGrid();
renderStickerGrid();
showEmojiTab("emoji");
picker.classList.add("show");

}

function showEmojiTab(tab){

document.getElementById("emojiTabEmoji").classList.toggle("active", tab === "emoji");
document.getElementById("emojiTabStickers").classList.toggle("active", tab === "stickers");

}

function renderEmojiGrid(){

let html = "";

EMOJI_LIST.forEach((e) => {
html += `<button onclick="insertEmoji('${e}')">${e}</button>`;
});

document.getElementById("emojiTabEmoji").innerHTML = html;

}

function renderStickerGrid(){

let html = "";

STICKER_LIST.forEach((e) => {
html += `<button onclick="sendSticker('${e}')" style="font-size:2rem;">${e}</button>`;
});

document.getElementById("emojiTabStickers").innerHTML = html;

}

function insertEmoji(emoji){

if(!activeEmojiTarget) return;

const input = document.getElementById(activeEmojiTarget);
input.value += emoji;
input.focus();

}

function sendSticker(emoji){

if(activeEmojiTarget === "chatInput"){
document.getElementById("chatInput").value = emoji;
sendChatMessage();
}else if(activeEmojiTarget === "threadInput"){
document.getElementById("threadInput").value = emoji;
sendThreadMessage();
}

toggleEmojiPicker();

}

// A message that's short and has no regular letters/numbers in it is
// treated as "just an emoji" and rendered bigger, like a sticker.
function isEmojiOnlyMessage(text){

if(!text) return false;

const trimmed = text.trim();

if(trimmed.length === 0 || trimmed.length > 10) return false;

return !/[a-zA-Z0-9]/.test(trimmed);

}

// ---- Message bubbles: reply, edit, delete ----
// A cache of the currently-rendered messages (keyed by doc id) so the
// reply/edit/delete buttons can look up the real message content
// safely, instead of embedding user-typed text directly inside onclick
// attributes (which would be fragile and a potential injection risk).

let lastLoadedChatMessages = {};
let lastLoadedThreadMessages = {};
let activeReply = null; // { scope, name, text }
let activeEdit = null;  // { scope, docId }

function getMessageCache(scope){
return scope === "classChat" ? lastLoadedChatMessages : lastLoadedThreadMessages;
}

function renderMessageBubble(scope, docId, data, currentUid){

if(data.hiddenFor && data.hiddenFor.includes(currentUid)){
return "";
}

const isMine = data.uid === currentUid;
const side = isMine ? "mine" : "theirs";

const time = data.createdAt
? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
: "";

if(data.deleted){
return `
<div class="msg-row ${side}">
<div class="msg-bubble ${side}" data-doc-id="${docId}">
<p class="msg-deleted">🚫 This message was deleted</p>
<div class="msg-time">${time}</div>
</div>
</div>
`;
}

let bodyHtml;

if(data.audioData){
bodyHtml = `<audio controls src="${data.audioData}" style="max-width:220px;height:36px;"></audio>`;
}else if(data.imageData){
bodyHtml = `<img src="${data.imageData}" style="max-width:200px;border-radius:10px;display:block;">`;
}else if(isEmojiOnlyMessage(data.text)){
bodyHtml = `<p class="emoji-only-msg">${escapeHtml(data.text)}</p>`;
}else{
bodyHtml = `<p>${escapeHtml(data.text || "")}</p>` + (data.edited ? `<span style="font-size:.65rem;opacity:.5;"> (edited)</span>` : "");
}

let replyHtml = "";

if(data.replyToText){
replyHtml = `<div class="msg-reply-quote">↩ <strong>${escapeHtml(data.replyToName || "")}</strong>: ${escapeHtml(data.replyToText.slice(0,60))}</div>`;
}

const senderHtml = isMine ? "" : `<span class="msg-sender">${escapeHtml(data.name || "Student")}</span>`;

let reactionsHtml = "";

if(data.reactions && Object.keys(data.reactions).length > 0){

const counts = {};

Object.values(data.reactions).forEach((emoji) => {
counts[emoji] = (counts[emoji] || 0) + 1;
});

const badges = Object.entries(counts)
.map(([emoji, count]) => emoji + (count > 1 ? " " + count : ""))
.join("  ");

reactionsHtml = `<div class="msg-reactions">${badges}</div>`;

}

return `
<div class="msg-row ${side}">
<div class="msg-bubble ${side}" data-doc-id="${docId}">
${senderHtml}
${replyHtml}
${bodyHtml}
${reactionsHtml}
<div class="msg-time">${time}</div>
</div>

</div>
`;

}

// Tap-to-reply instead of true swipe-to-reply: a real swipe gesture is
// hard to make feel right without testing on an actual phone, and a
// clumsy swipe is worse than a reliable tap. This button achieves the
// same result — quoting a specific message — without that risk.
function startReply(scope, docId){

const cache = getMessageCache(scope);
const data = cache[docId];

if(!data) return;

activeEdit = null;

activeReply = {
scope: scope,
name: data.name || "Student",
text: data.imageData ? "📷 Photo" : (data.text || "")
};

const barId = scope === "classChat" ? "chatReplyBar" : "threadReplyBar";
const textId = scope === "classChat" ? "chatReplyText" : "threadReplyText";
const inputId = scope === "classChat" ? "chatInput" : "threadInput";

document.getElementById(textId).innerText =
"Replying to " + activeReply.name + ": " + activeReply.text.slice(0, 50);

document.getElementById(barId).classList.add("show");
document.getElementById(inputId).focus();

}

function startEditMessage(scope, docId){

const cache = getMessageCache(scope);
const data = cache[docId];

if(!data || !data.text) return;

activeReply = null;
activeEdit = { scope: scope, docId: docId };

const inputId = scope === "classChat" ? "chatInput" : "threadInput";
const barId = scope === "classChat" ? "chatReplyBar" : "threadReplyBar";
const textId = scope === "classChat" ? "chatReplyText" : "threadReplyText";

document.getElementById(inputId).value = data.text;
document.getElementById(inputId).focus();

document.getElementById(textId).innerText = "✏️ Editing your message...";
document.getElementById(barId).classList.add("show");

}

function cancelComposerContext(scope){

activeReply = null;
activeEdit = null;

const barId = scope === "classChat" ? "chatReplyBar" : "threadReplyBar";
const inputId = scope === "classChat" ? "chatInput" : "threadInput";

document.getElementById(barId).classList.remove("show");
document.getElementById(inputId).value = "";

}

// ---- Custom modals (replace native confirm()/prompt() entirely) ----
// Native browser dialogs always show "yoursite.github.io says" — that
// can't be removed, it's a browser security feature. These custom
// modals replace them everywhere in the chat so there's no more of
// that branding, and the buttons can say exactly what they do.

let actionSheetContext = null; // { scope, docId, isMine }
let deleteChoiceContext = null; // { scope, docId }

function openMessageActionSheet(scope, docId){

const cache = getMessageCache(scope);
const data = cache[docId];

if(!data || data.deleted) return;

const currentUid = window.auth.currentUser ? window.auth.currentUser.uid : null;
const isMine = data.uid === currentUid;

actionSheetContext = { scope: scope, docId: docId, isMine: isMine };

document.getElementById("actionSheetEditBtn").classList.toggle(
"hidden",
!(isMine && data.text && !data.imageData)
);

document.getElementById("messageActionSheet").classList.add("show");

}

function closeActionSheet(){

actionSheetContext = null;
document.getElementById("messageActionSheet").classList.remove("show");

}

function actionSheetReply(){

if(!actionSheetContext) return;

startReply(actionSheetContext.scope, actionSheetContext.docId);
closeActionSheet();

}

function actionSheetEdit(){

if(!actionSheetContext) return;

startEditMessage(actionSheetContext.scope, actionSheetContext.docId);
closeActionSheet();

}

function actionSheetDelete(){

if(!actionSheetContext) return;

openDeleteChoiceModal(actionSheetContext.scope, actionSheetContext.docId, actionSheetContext.isMine);
closeActionSheet();

}

function actionSheetReact(){

if(!actionSheetContext) return;

openReactionPicker(actionSheetContext.scope, actionSheetContext.docId);
closeActionSheet();

}

// ---- Message reactions (tap-and-hold, WhatsApp-style) ----
let reactionContext = null; // { scope, docId }

function openReactionPicker(scope, docId){

reactionContext = { scope: scope, docId: docId };
document.getElementById("reactionPicker").classList.add("show");

}

function closeReactionPicker(){

reactionContext = null;
document.getElementById("reactionPicker").classList.remove("show");

}

async function sendReaction(emoji){

if(!reactionContext) return;

const scope = reactionContext.scope;
const docId = reactionContext.docId;
const user = window.auth.currentUser;

if(!user){
closeReactionPicker();
return;
}

try{

const cache = getMessageCache(scope);
const data = cache[docId] || {};
const reactions = Object.assign({}, data.reactions || {});

// Tapping the same reaction you already left removes it (toggle).
if(reactions[user.uid] === emoji){
delete reactions[user.uid];
}else{
reactions[user.uid] = emoji;
}

await window.updateDoc(getMessageDocRef(scope, docId), { reactions: reactions });

}catch(error){

showToast(error.message);

}

closeReactionPicker();

}

function openDeleteChoiceModal(scope, docId, isMine){

deleteChoiceContext = { scope: scope, docId: docId };

document.getElementById("deleteChoiceTitle").innerText = isMine
? "Delete this message"
: "Delete for you only? (They'll still see it on their side.)";

document.getElementById("deleteForEveryoneBtn").classList.toggle("hidden", !isMine);

document.getElementById("deleteChoiceModal").classList.add("show");

}

function closeDeleteChoiceModal(){

deleteChoiceContext = null;
document.getElementById("deleteChoiceModal").classList.remove("show");

}

function executeDeleteChoice(type){

if(!deleteChoiceContext) return;

if(type === "everyone"){
deleteMessageForEveryone(deleteChoiceContext.scope, deleteChoiceContext.docId);
}else{
deleteMessageForMe(deleteChoiceContext.scope, deleteChoiceContext.docId);
}

closeDeleteChoiceModal();

}

// ---- Swipe-to-reply ----
// Uses event delegation (one listener per chat container) since
// messages get fully re-rendered on every update — per-message
// listeners would just get thrown away each time.
function attachSwipeHandlers(containerId, scope){

const container = document.getElementById(containerId);

if(!container || container.dataset.swipeAttached) return;
container.dataset.swipeAttached = "true";

let startX = 0;
let currentBubble = null;
let currentDocId = null;
let swiped = false;
let longPressTimer = null;
let longPressFired = false;

container.addEventListener("touchstart", (e) => {

const bubble = e.target.closest(".msg-bubble");
if(!bubble) return;

currentBubble = bubble;
currentDocId = bubble.dataset.docId;
startX = e.touches[0].clientX;
swiped = false;
longPressFired = false;
currentBubble.style.transition = "none";

// Long-press (hold still for ~500ms) opens the reaction picker,
// same idea as WhatsApp.
longPressTimer = setTimeout(() => {

if(!swiped && currentDocId){
longPressFired = true;
openReactionPicker(scope, currentDocId);
}

}, 500);

}, { passive: true });

container.addEventListener("touchmove", (e) => {

if(!currentBubble) return;

const deltaX = e.touches[0].clientX - startX;
const clamped = Math.max(-70, Math.min(70, deltaX));

if(Math.abs(deltaX) > 10){
swiped = true;
clearTimeout(longPressTimer);
}

currentBubble.style.transform = "translateX(" + clamped + "px)";

}, { passive: true });

container.addEventListener("touchend", () => {

clearTimeout(longPressTimer);

if(!currentBubble) return;

const match = /translateX\(([-0-9.]+)px\)/.exec(currentBubble.style.transform);
const deltaX = match ? parseFloat(match[1]) : 0;

currentBubble.style.transition = "transform .2s ease";
currentBubble.style.transform = "translateX(0)";

if(!longPressFired && Math.abs(deltaX) > 45 && currentDocId){
startReply(scope, currentDocId);
}

currentBubble = null;
currentDocId = null;

}, { passive: true });

// Taps (not swipes, not long-presses) open the action sheet.
container.addEventListener("click", (e) => {

const bubble = e.target.closest(".msg-bubble");
if(!bubble) return;

if(swiped || longPressFired){
swiped = false;
longPressFired = false;
return;
}

const docId = bubble.dataset.docId;
if(docId){
openMessageActionSheet(scope, docId);
}

});

}

function getMessageDocRef(scope, docId){

if(scope === "classChat"){
return window.doc(window.db, "classChat", docId);
}

return window.doc(window.db, "conversations", currentConversationId, "messages", docId);

}

async function deleteMessageForEveryone(scope, docId){

try{

await window.updateDoc(getMessageDocRef(scope, docId), {
deleted: true,
text: "",
imageData: ""
});

}catch(error){

showToast(error.message);

}

}

async function deleteMessageForMe(scope, docId){

try{

const cache = getMessageCache(scope);
const data = cache[docId];
const user = window.auth.currentUser;

const existingHidden = (data && data.hiddenFor) ? data.hiddenFor.slice() : [];

if(!existingHidden.includes(user.uid)){
existingHidden.push(user.uid);
}

await window.updateDoc(getMessageDocRef(scope, docId), {
hiddenFor: existingHidden
});

}catch(error){

showToast(error.message);

}

}

// Shrinks an image client-side (via canvas) and returns it as a base64
// JPEG string, small enough to fit directly inside a Firestore message
// document — this avoids needing Firebase Storage (which requires a
// paid plan) for something as simple as a chat photo.
function compressImageToBase64(file, maxWidth, quality){

return new Promise((resolve, reject) => {

const reader = new FileReader();

reader.onload = function(e){

const img = new Image();

img.onload = function(){

let width = img.width;
let height = img.height;

if(width > maxWidth){
height = Math.round(height * (maxWidth / width));
width = maxWidth;
}

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, width, height);

resolve(canvas.toDataURL("image/jpeg", quality));

};

img.onerror = reject;
img.src = e.target.result;

};

reader.onerror = reject;
reader.readAsDataURL(file);

});

}

async function sendChatImage(event){

const file = event.target.files[0];

if(!file) return;

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
event.target.value = "";
return;
}

const name = getSavedStudentName();

try{

const base64 = await compressImageToBase64(file, 550, 0.6);

if(base64.length > 700000){
showToast("That image is too large even after compressing. Try a smaller photo.");
event.target.value = "";
return;
}

await window.addDoc(
window.collection(window.db, "classChat"),
{
uid: user.uid,
name: name,
imageData: base64,
createdAt: new Date()
}
);

}catch(error){

showToast("Couldn't send image: " + error.message);

}

event.target.value = "";

}

async function sendThreadImage(event){

const file = event.target.files[0];

if(!file || !currentConversationId) return;

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
event.target.value = "";
return;
}

const name = getSavedStudentName();

try{

const base64 = await compressImageToBase64(file, 550, 0.6);

if(base64.length > 700000){
showToast("That image is too large even after compressing. Try a smaller photo.");
event.target.value = "";
return;
}

await window.addDoc(
window.collection(window.db, "conversations", currentConversationId, "messages"),
{
uid: user.uid,
name: name,
imageData: base64,
createdAt: new Date()
}
);

await window.updateDoc(
window.doc(window.db, "conversations", currentConversationId),
{
lastMessage: "📷 Photo",
lastMessageAt: new Date(),
lastMessageSenderUid: user.uid
}
);

}catch(error){

showToast("Couldn't send image: " + error.message);

}

event.target.value = "";

}

// ---- Voice messages ----
// Records with the browser's MediaRecorder API (opus codec — already
// fairly compact) and stores the result as base64 directly inside the
// message, same free-storage trick as photos. Capped at 60 seconds so
// recordings stay comfortably under Firestore's per-document limit.

let voiceMediaRecorder = null;
let voiceRecordedChunks = [];
let voiceRecordingScope = null;
let voiceRecordingTimer = null;
let voiceRecordingSeconds = 0;
const MAX_VOICE_RECORDING_SECONDS = 60;

async function toggleVoiceRecording(scope){

if(voiceMediaRecorder && voiceMediaRecorder.state === "recording"){
stopVoiceRecording();
return;
}

if(!navigator.mediaDevices || !window.MediaRecorder){
showToast("Voice messages aren't supported on this browser.");
return;
}

try{

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

voiceRecordedChunks = [];
voiceRecordingScope = scope;
voiceRecordingSeconds = 0;

voiceMediaRecorder = new MediaRecorder(stream);

voiceMediaRecorder.ondataavailable = (e) => {
if(e.data.size > 0) voiceRecordedChunks.push(e.data);
};

voiceMediaRecorder.onstop = () => {

stream.getTracks().forEach((track) => track.stop());

const blob = new Blob(voiceRecordedChunks, { type: voiceMediaRecorder.mimeType || "audio/webm" });

sendVoiceMessage(blob, voiceRecordingScope);

};

voiceMediaRecorder.start();
updateMicButton(scope, true, 0);

voiceRecordingTimer = setInterval(() => {

voiceRecordingSeconds++;
updateMicButton(scope, true, voiceRecordingSeconds);

if(voiceRecordingSeconds >= MAX_VOICE_RECORDING_SECONDS){
stopVoiceRecording();
}

}, 1000);

}catch(error){

showToast("Microphone access denied or unavailable.");

}

}

function stopVoiceRecording(){

if(voiceMediaRecorder && voiceMediaRecorder.state === "recording"){
voiceMediaRecorder.stop();
}

clearInterval(voiceRecordingTimer);
voiceRecordingTimer = null;

updateMicButton(voiceRecordingScope, false);

}

function updateMicButton(scope, isRecording, seconds){

const btn = document.getElementById("micBtn-" + (scope === "classChat" ? "chatInput" : "threadInput"));

if(!btn) return;

if(isRecording){

const mins = Math.floor((seconds || 0) / 60);
const secs = (seconds || 0) % 60;

btn.innerText = "⏹ " + mins + ":" + (secs < 10 ? "0" : "") + secs;
btn.classList.add("btn-danger");

}else{

btn.innerText = "🎤";
btn.classList.remove("btn-danger");

}

}

function blobToBase64(blob){

return new Promise((resolve, reject) => {

const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(blob);

});

}

async function sendVoiceMessage(blob, scope){

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

if(blob.size > 700000){
showToast("That recording is too long. Try a shorter one.");
return;
}

const name = getSavedStudentName();

try{

const base64 = await blobToBase64(blob);

if(scope === "classChat"){

await window.addDoc(
window.collection(window.db, "classChat"),
{
uid: user.uid,
name: name,
audioData: base64,
createdAt: new Date()
}
);

}else{

if(!currentConversationId) return;

await window.addDoc(
window.collection(window.db, "conversations", currentConversationId, "messages"),
{
uid: user.uid,
name: name,
audioData: base64,
createdAt: new Date()
}
);

await window.updateDoc(
window.doc(window.db, "conversations", currentConversationId),
{
lastMessage: "🎤 Voice message",
lastMessageAt: new Date(),
lastMessageSenderUid: user.uid
}
);

}

}catch(error){

showToast("Couldn't send voice message: " + error.message);

}

}

// ---- Chat wallpaper ----
// ---- Custom image wallpaper ----
// User picks any photo from their device and it becomes the chat
// background — same approach as WhatsApp. Stored compressed in
// localStorage so it persists between sessions with no server needed.

function applyChatWallpaper(base64){

const chatEl = document.getElementById("chatMessages");
const threadEl = document.getElementById("threadMessages");

if(base64){

const style = "url('" + base64 + "')";

chatEl.style.backgroundImage = style;
chatEl.classList.add("chat-wallpaper-img");

threadEl.style.backgroundImage = style;
threadEl.classList.add("chat-wallpaper-img");

}else{

chatEl.style.backgroundImage = "";
chatEl.classList.remove("chat-wallpaper-img");

threadEl.style.backgroundImage = "";
threadEl.classList.remove("chat-wallpaper-img");

}

}

async function setChatWallpaperFromFile(event){

const file = event.target.files[0];

if(!file) return;

try{

const base64 = await compressImageToBase64(file, 800, 0.65);

localStorage.setItem("chatWallpaper", base64);

applyChatWallpaper(base64);

showToast("Chat wallpaper updated!");

}catch(error){

showToast("Couldn't set wallpaper: " + error.message);

}

event.target.value = "";

}

function removeChatWallpaper(){

localStorage.removeItem("chatWallpaper");

applyChatWallpaper(null);

showToast("Wallpaper removed.");

}

function loadWallpaperPref(){

const saved = localStorage.getItem("chatWallpaper");

applyChatWallpaper(saved || null);

}

  function openProgress(){

hideAllSections();

document
.getElementById("progressSection")
.classList.remove("hidden");

loadNotes(); // refresh the notes count shown here

closeMenu();
showBackButton();

}

   async function saveProfilePicture(event){

const file = event.target.files[0];

if(!file) return;

const alreadyEarned = !!localStorage.getItem("profileBadge");

try{

// Reusing the same compression helper as chat images — keeps profile
// pictures small enough to store directly in Firestore (so OTHER
// people can see them too, e.g. in Messages) without needing paid
// file storage.
const compressed = await compressImageToBase64(file, 300, 0.7);

document.getElementById("profileImage").src = compressed;

localStorage.setItem("profilePicture", compressed);

document.getElementById("profileStatus").innerText = "Yes";

localStorage.setItem("profileBadge", "earned");

if(!alreadyEarned){
playBadgeSound();
}

updateMiniProfile();

const user = window.auth.currentUser;

if(user){

await window.setDoc(
window.doc(window.db, "user", user.uid),
{ profilePicture: compressed },
{ merge: true }
);

}

}catch(error){

showToast("Couldn't save picture: " + error.message);

}

}

  function clearDraft(){

localStorage.removeItem("draftNote");

document.getElementById("noteText").value = "";

updateCharCount();

}

async function login(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

try{

const userCredential =
await window.signInWithEmailAndPassword(
window.auth,
email,
password
);

const user = userCredential.user;

const docRef = window.doc(
window.db,
"user",
user.uid
);

const docSnap = await window.getDoc(docRef);

if(docSnap.exists()){

const data = docSnap.data();

document.getElementById("profileName").innerText =
data.fullName;

document.getElementById("profileEmail").innerText =
data.email;

  document.getElementById("message").innerText =
"Welcome back, " + data.fullName + "!";

localStorage.setItem(
"studentName",
data.fullName
);

localStorage.setItem(
"studentEmail",
data.email
);

localStorage.setItem(
"studentPhone",
data.phoneNumber || ""
);
  if(document.getElementById("rememberMe").checked){

localStorage.setItem("rememberedEmail", email);
localStorage.setItem("rememberedName", data.fullName || "");

}else{

localStorage.removeItem("rememberedEmail");
localStorage.removeItem("rememberedName");

}

}else{

console.log("Document NOT found");

}

document.getElementById("auth")
.style.display = "none";

document.getElementById("dashboard")
.classList.remove("hidden");

/* profileSection removed */

document.getElementById("dashboardHome")
.classList.remove("hidden");

showChatBubble();

if(localStorage.getItem("classChatVerified") === "yes"){
startChatListener();
}

startGlobalDmListener();
showLogoutButton();
showQuickAccessButtons();
renderGreeting();
setTimeout(showAIGreetingCard, 1200);
updateMiniProfile();
  const savedPic =
localStorage.getItem("profilePicture");

if(savedPic){

document.getElementById("profileImage").src =
savedPic;

document.getElementById("profileStatus").innerText =
"Yes";
localStorage.setItem(
"profileBadge",
"earned"
);
}

window.scrollTo({
top:0,
behavior:"smooth"
});

setTimeout(() => {
document.getElementById("message").innerText = "";
}, 3000);

}catch(error){

showToast(error.message);

}

}

async function logout(){

try{

await window.signOut(window.auth);

localStorage.removeItem("studentName");
localStorage.removeItem("studentEmail");
localStorage.removeItem("studentPhone");
localStorage.removeItem("rememberedEmail");
localStorage.removeItem("rememberedName");

document.getElementById("fullName").value = "";
document.getElementById("email").value = "";
document.getElementById("password").value = "";

document.getElementById("profileName").innerText = "";
document.getElementById("profileEmail").innerText = "";

document.getElementById("dashboard")
.classList.add("hidden");

/* profileSection removed */

document.getElementById("auth")
.style.display = "block";

hideAllSections();
hideBackButton();
hideLogoutButton();
hideMiniProfile();
hideQuickAccessButtons();
leaveMeeting();
leaveAudioRoom();
hideChatBubble();
stopChatListener();
stopGlobalDmListener();
stopAllBackgroundListeners();

document.getElementById("message").innerText =
"Logged out successfully!";

setTimeout(() => {
    document.getElementById("message").innerText = "";
}, 3000);

}catch(error){

showToast(error.message);

}

}

  function toggleMenu(){

document
.getElementById("sideMenu")
.classList.toggle("show");

}

let aiChatHistory = []; // sent in full to the API each time — no server-side memory
let aiPendingAttachment = null; // {kind:"image"|"document"|"text", mediaType, data, name}

// Shared free-tier Google AI (Gemini) key baked in so the AI Tutor works
// for every student out of the box. Anyone can add their own personal key
// in Settings, which takes priority over this one.
const DEFAULT_AI_KEY = "AQ.Ab8RN6L45y_kk3H7_ZxqN3e9gCkhf--9Ftv3Uw2f3BDppcYPjw";

function getAiApiKey(){
return localStorage.getItem("aiApiKey") || DEFAULT_AI_KEY;
}

function openAITutor(){

hideAllSections();

document
.getElementById("aiTutorSection")
.classList.remove("hidden");

showBackButton();

document.getElementById("aiKeyWarning").classList.add("hidden");

document.getElementById("aiVoiceToggle").innerText =
"🔊 Read replies aloud: " + (localStorage.getItem("aiVoiceReplies") === "on" ? "On" : "Off");

if(aiChatHistory.length === 0){
document.getElementById("aiChatMessages").innerHTML =
"<p style='opacity:.7;'>AI Tutor ready — ask a question below.</p>";
}

}

function handleAiAttachment(event){

const file = event.target.files[0];

if(!file){
return;
}

const reader = new FileReader();

reader.onload = () => {

if(file.type.startsWith("image/")){

aiPendingAttachment = {
kind: "image",
mediaType: file.type,
data: reader.result.split(",")[1],
name: file.name
};

}else if(file.type === "application/pdf"){

aiPendingAttachment = {
kind: "document",
mediaType: "application/pdf",
data: reader.result.split(",")[1],
name: file.name
};

}else{

aiPendingAttachment = {
kind: "text",
data: reader.result,
name: file.name
};

}

document.getElementById("aiAttachPreviewName").innerText = "📎 " + file.name;
document.getElementById("aiAttachPreview").classList.remove("hidden");

};

if(file.type.startsWith("image/") || file.type === "application/pdf"){
reader.readAsDataURL(file);
}else{
reader.readAsText(file);
}

}

function clearAiAttachment(){

aiPendingAttachment = null;
document.getElementById("aiAttachInput").value = "";
document.getElementById("aiAttachPreview").classList.add("hidden");

}

function renderAiChatMessage(role, text, attachmentName){

const container = document.getElementById("aiChatMessages");

const row = document.createElement("div");
row.className = "msg-row " + (role === "user" ? "mine" : "theirs");

const bubble = document.createElement("div");
bubble.className = "msg-bubble " + (role === "user" ? "mine" : "theirs");

if(attachmentName){
const att = document.createElement("div");
att.style.opacity = ".8";
att.style.fontSize = ".8rem";
att.style.marginBottom = "4px";
att.innerText = "📎 " + attachmentName;
bubble.appendChild(att);
}

const textEl = document.createElement("div");
textEl.innerText = text;
bubble.appendChild(textEl);

row.appendChild(bubble);
container.appendChild(row);
container.scrollTop = container.scrollHeight;

return bubble;

}

async function askAI(){

const apiKey = getAiApiKey();

const question = document.getElementById("userQuestion").value.trim();
const attachment = aiPendingAttachment;

if(!question && !attachment){
return;
}

const userParts = [];

if(attachment){

if(attachment.kind === "image" || attachment.kind === "document"){
userParts.push({
inline_data: { mime_type: attachment.mediaType, data: attachment.data }
});
}else if(attachment.kind === "text"){
userParts.push({
text: "Attached file \"" + attachment.name + "\":\n\n" + attachment.data
});
}

}

userParts.push({ text: question || "Please help me with the attached file." });

aiChatHistory.push({ role: "user", parts: userParts });

const messagesEl = document.getElementById("aiChatMessages");
if(messagesEl.innerText.includes("AI Tutor ready")){
messagesEl.innerHTML = "";
}

renderAiChatMessage("user", question || "(sent a file)", attachment ? attachment.name : null);

document.getElementById("userQuestion").value = "";
clearAiAttachment();

const thinkingBubble = renderAiChatMessage("assistant", "Thinking...");

try{

const response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
{
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({ contents: aiChatHistory })
}
);

const data = await response.json();

if(!response.ok){
throw new Error((data.error && data.error.message) || "Request failed");
}

const candidate = data.candidates && data.candidates[0];

const replyText = candidate && candidate.content && candidate.content.parts
? candidate.content.parts.map((part) => part.text || "").join("\n")
: "";

aiChatHistory.push({ role: "model", parts: [{ text: replyText }] });

thinkingBubble.querySelector("div:last-child").innerText = replyText || "(no response)";

if(replyText && localStorage.getItem("aiVoiceReplies") === "on"){
speakText(replyText);
}

}catch(error){

thinkingBubble.querySelector("div:last-child").innerText =
"⚠️ Couldn't reach the AI (" + error.message + "). Check your API key in Settings.";

aiChatHistory.pop(); // drop the failed turn so retrying doesn't confuse the conversation

}

}

// ---- Voice assistance for the AI Tutor: speech-to-text for asking a
// question out loud, and text-to-speech for hearing the answer. Both
// use the browser's own built-in APIs — no extra key or cost. ----

function speakText(text){

if(!("speechSynthesis" in window)){
return;
}

window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(text);
window.speechSynthesis.speak(utterance);

}

function toggleAiVoiceReplies(){

const isOn = localStorage.getItem("aiVoiceReplies") === "on";
const next = isOn ? "off" : "on";

localStorage.setItem("aiVoiceReplies", next);

document.getElementById("aiVoiceToggle").innerText =
"🔊 Read replies aloud: " + (next === "on" ? "On" : "Off");

if(next === "off" && "speechSynthesis" in window){
window.speechSynthesis.cancel();
}

}

let voiceRecognition = null;
let voiceListening = false;

function toggleVoiceInput(){

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognitionAPI){
showToast("Voice input isn't supported in this browser");
return;
}

if(voiceListening && voiceRecognition){
voiceRecognition.stop();
return;
}

voiceRecognition = new SpeechRecognitionAPI();
voiceRecognition.lang = "en-US";
voiceRecognition.interimResults = false;
voiceRecognition.maxAlternatives = 1;

const micBtn = document.getElementById("aiMicBtn");

voiceRecognition.onstart = () => {
voiceListening = true;
micBtn.innerText = "🔴";
micBtn.title = "Listening... tap to stop";
};

voiceRecognition.onresult = (event) => {
const transcript = event.results[0][0].transcript;
const input = document.getElementById("userQuestion");
input.value = input.value ? input.value + " " + transcript : transcript;
};

voiceRecognition.onerror = () => {
showToast("Couldn't hear that — try again");
};

voiceRecognition.onend = () => {
voiceListening = false;
micBtn.innerText = "🎤";
micBtn.title = "Ask by voice";
};

voiceRecognition.start();

}

// ---- AI greeting when the app opens: a short, genuinely AI-written
// hello (not canned text) that the person can reply to immediately.
// Fires once per browser session, guarded by sessionStorage, so it
// doesn't nag every time someone taps Back to the dashboard.

async function showAIGreetingCard(){

if(sessionStorage.getItem("aiGreetingShown")) return;
sessionStorage.setItem("aiGreetingShown", "1");

const card = document.getElementById("aiGreetingCard");
const textEl = document.getElementById("aiGreetingText");

if(!card || !textEl) return;

const name = getSavedStudentName();
const role = localStorage.getItem("studentRole") || "Student";

// Friendly fallback shown immediately — upgraded below if the AI call succeeds.
textEl.innerText = "👋 Hi " + name + "! Ready to learn something today?";
card.classList.remove("hidden");

// Auto-dismiss after 5s, but only if they haven't started typing a reply.
setTimeout(() => {
const input = document.getElementById("aiGreetingInput");
if(input && !input.value.trim()){
dismissAIGreetingCard();
}
}, 5000);

try{

const apiKey = getAiApiKey();

const response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
{
method: "POST",
headers: { "content-type": "application/json" },
body: JSON.stringify({
contents: [{
role: "user",
parts: [{ text: "Write ONE short, warm sentence (max 18 words, one emoji at most) greeting " + name + ", a " + role + " opening their study app called Adeka Academy Hub. Just the sentence, nothing else." }]
}]
})
}
);

const data = await response.json();
const candidate = data.candidates && data.candidates[0];
const line = candidate && candidate.content && candidate.content.parts
? candidate.content.parts.map((part) => part.text || "").join(" ").trim()
: "";

if(line && !card.classList.contains("hidden")){
textEl.innerText = line;
}

}catch(error){
// Network/key issue — the friendly fallback greeting stays as-is.
}

}

function dismissAIGreetingCard(){

document.getElementById("aiGreetingCard").classList.add("hidden");

}

function sendFromGreetingCard(){

const question = document.getElementById("aiGreetingInput").value.trim();

dismissAIGreetingCard();

if(!question) return;

openAITutor();
document.getElementById("userQuestion").value = question;
askAI();

}

function saveAiApiKey(){

const key = document.getElementById("aiApiKeyInput").value.trim();

if(!key){
showToast("Enter a key first");
return;
}

localStorage.setItem("aiApiKey", key);
document.getElementById("aiApiKeyInput").value = "";
updateAiKeyStatus();
showToast("AI key saved on this device");

}

function clearAiApiKey(){

localStorage.removeItem("aiApiKey");
updateAiKeyStatus();
showToast("AI key removed");

}

function updateAiKeyStatus(){

const el = document.getElementById("aiKeyStatus");

if(!el){
return;
}

el.innerText = localStorage.getItem("aiApiKey")
? "Status: ✅ Using your personal key on this device"
: "Status: ✅ Active (shared class key) — add your own above to use it instead";

}

function openMeetingCenter(){

hideAllSections();

document
.getElementById("meetingSection")
.classList.remove("hidden");

showBackButton();

}

function openAudioLessons(){

hideAllSections();

document
.getElementById("audioSection")
.classList.remove("hidden");

showBackButton();

}

function openSettings(){

hideAllSections();

document
.getElementById("settingsSection")
.classList.remove("hidden");

closeMenu();
showBackButton();

const rawName = localStorage.getItem("studentName");
const currentName = (rawName && rawName !== "undefined" && rawName !== "null") ? rawName : "";

document.getElementById("currentNameDisplay").innerText =
currentName || "Not set";

document.getElementById("fullNameSettings").value =
currentName;

const currentPhone = localStorage.getItem("studentPhone");

document.getElementById("currentPhoneDisplay").innerText =
currentPhone || "Not set";

document.getElementById("phoneNumberSettings").value =
currentPhone || "";

updateAiKeyStatus();

document.getElementById("roleSettingsSelect").value =
localStorage.getItem("studentRole") || "Student";

}

async function saveRoleSetting(){

const role = document.getElementById("roleSettingsSelect").value;

localStorage.setItem("studentRole", role);

try{

const user = window.auth.currentUser;

if(user){
await window.setDoc(
window.doc(window.db, "user", user.uid),
{ role: role },
{ merge: true }
);
}

}catch(error){

console.log("Couldn't save role to Firestore:", error);

}

updateMiniProfile();
showToast("Role updated");

}

async function updateFullName(){

const fullName =
document.getElementById("fullNameSettings").value.trim();

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

if(!fullName){
showToast("Enter a name first");
return;
}

try{

await window.setDoc(
window.doc(window.db, "user", user.uid),
{ fullName: fullName },
{ merge: true }
);

localStorage.setItem("studentName", fullName);

document.getElementById("currentNameDisplay").innerText = fullName;
document.getElementById("profileName").innerText = fullName;

updateMiniProfile();
showToast("Name updated");

}catch(error){

showToast("Couldn't save name — try again");

}

}

async function updatePhoneNumber(){

const phoneNumber =
document.getElementById("phoneNumberSettings").value.trim();

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

if(!phoneNumber){
showToast("Enter a phone number first");
return;
}

try{

await window.setDoc(
window.doc(window.db, "user", user.uid),
{ phoneNumber: phoneNumber },
{ merge: true }
);

localStorage.setItem("studentPhone", phoneNumber);

document.getElementById("currentPhoneDisplay").innerText =
phoneNumber;

document.getElementById("message").innerText =
"Phone number saved!";

setTimeout(() => {
document.getElementById("message").innerText = "";
}, 3000);

}catch(error){

showToast(error.message);

}

}

// ---- Quiz Challenge ----
// A small offline question bank, organized by education level and
// subject. "Offline" because the questions live right here in the code
// — no internet or AI call is needed to take a quiz. Scores are saved
// to Firestore so the leaderboard is genuinely global across students.

// QUIZ_DATA loaded from quiz-data.js

let quizLevel = null;
let quizSubject = null;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

// ---- GES Learning Materials ----
// Official curriculum PDFs published by Ghana's NaCCA (National Council
// for Curriculum & Assessment) and hosted on their own domains. This is
// a starter set, not the full catalogue — add more objects to the
// arrays below any time (subject, title, url) and they'll show up
// automatically, no other code changes needed.

const GES_MATERIALS = {

Primary: [
{ subject: "Mathematics", title: "Mathematics Curriculum (Lower Primary B1–B3)", url: "https://nacca.gov.gh/wp-content/uploads/2019/04/MATHS-LOWER-PRIMARY-B1-B3.pdf", years: [1, 2, 3] },
{ subject: "Mathematics", title: "Mathematics Syllabus (Primary 1–6)", url: "https://nacca.gov.gh/wp-content/uploads/2019/04/Mathematics-Syllabus-Primary-1-6-.pdf", years: [1, 2, 3, 4, 5, 6] },
{ subject: "English Language", title: "English Curriculum (B4–B6)", url: "https://nacca.gov.gh/wp-content/uploads/2019/06/ENGLISH-B4-B6.pdf", years: [4, 5, 6] }
],

JHS: [
{ subject: "Science", title: "Science Curriculum (JHS 1–3)", url: "https://nacca.gov.gh/wp-content/uploads/2022/10/Science-Curriculum.pdf", years: [1, 2, 3] },
{ subject: "Social Studies", title: "Social Studies Curriculum, CCP (JHS 1–3)", url: "https://www.nacca.gov.gh/wp-content/uploads/2024/04/Social-Studies_CCP_JHS-1-3_Revised-1.pdf", years: [1, 2, 3] },
{ subject: "Mathematics", title: "Mathematics Curriculum, CCP", url: "https://nacca.gov.gh/wp-content/uploads/2023/06/MATHEMATICS.pdf", years: [1, 2, 3] },
{ subject: "English Language", title: "English Language Curriculum, CCP", url: "https://nacca.gov.gh/wp-content/uploads/2023/06/ENGLISH-LANGUAGE.pdf", years: [1, 2, 3] }
],

SHS: [
{ subject: "English Language", title: "English Language Curriculum (SHS 1–3)", url: "https://curriculumresources.edu.gh/wp-content/uploads/2024/11/English-Language-Curriculum.pdf", years: [1, 2, 3] },
{ subject: "Mathematics", title: "Mathematics Curriculum (SHS 1–3)", url: "https://curriculumresources.edu.gh/wp-content/uploads/2024/11/Mathematics-Curriculum.pdf", years: [1, 2, 3] },
{ subject: "Literature-in-English", title: "Literature-in-English Curriculum (SHS 1–3)", url: "https://nacca.gov.gh/wp-content/uploads/2025/04/Literature-in-English-Curriculum.pdf", years: [1, 2, 3] },
{ subject: "Computing", title: "Computing Curriculum (SHS 1–3)", url: "https://nacca.gov.gh/wp-content/uploads/2025/04/Computing-Curriculum.pdf", years: [1, 2, 3] },
{ subject: "Government", title: "Government Curriculum (SHS 1–3)", url: "https://curriculumresources.edu.gh/wp-content/uploads/2024/11/Government-Curriculum.pdf", years: [1, 2, 3] }
]

};

// How many year-tabs to show per level — Primary runs B1–B6, JHS/SHS run 1–3.
const GES_YEAR_COUNT = { Primary: 6, JHS: 3, SHS: 3 };

let currentGESLevel = "Primary";
let currentGESYear = 1;

// ---- Search: quick access to Google, YouTube, or Wikipedia without
// leaving the app. Opens results in a new tab — no API key, no cost.

// ---- My Files: category-tabbed access to whatever's on the phone.
// A website can never freely browse a phone's storage the way a native
// app can — Android only ever grants a picker, one file at a time. This
// gives that picker distinct categories instead of one generic button,
// and previews what's picked right in the app. Saved email attachments
// land in Documents/Downloads like anything else, so no separate email
// integration is needed to reach them.

// ---- Office suite: a simple document editor and spreadsheet, saved
// to the account, printable (browser's own Print → Save as PDF), and
// exportable. Word export uses a well-known trick — HTML saved with
// a Word MIME type opens fine in Word/Google Docs, no library needed.
// Spreadsheet export is plain CSV, which Excel/Sheets both open natively.

let officeMode = "doc";
let officeSheetData = [];
let currentOfficeFileId = null;

function openOffice(){

hideAllSections();

document.getElementById("officeSection").classList.remove("hidden");

showBackButton();

if(officeSheetData.length === 0){
newOfficeFile();
}

switchOfficeMode(officeMode);
loadOfficeFilesList();

}

function switchOfficeMode(mode){

officeMode = mode;

document.getElementById("officeDocPanel").classList.toggle("hidden", mode !== "doc");
document.getElementById("officeSheetPanel").classList.toggle("hidden", mode !== "sheet");

document.getElementById("officeTabDoc").style.background = (mode === "doc") ? "#ffd700" : "";
document.getElementById("officeTabDoc").style.color = (mode === "doc") ? "#111" : "";
document.getElementById("officeTabSheet").style.background = (mode === "sheet") ? "#ffd700" : "";
document.getElementById("officeTabSheet").style.color = (mode === "sheet") ? "#111" : "";

}

function newOfficeFile(){

currentOfficeFileId = null;
document.getElementById("officeTitleInput").value = "";
document.getElementById("officeDocEditor").innerHTML = "";

officeSheetData = [];
for(let r = 0; r < 8; r++){
officeSheetData.push(new Array(5).fill(""));
}
renderSheetTable();

}

function renderSheetTable(){

const table = document.getElementById("officeSheetTable");
let html = "";

officeSheetData.forEach((row, r) => {
html += "<tr>";
row.forEach((cell, c) => {
html += `<td contenteditable="true" data-row="${r}" data-col="${c}" oninput="updateSheetCell(this)" style="border:1px solid #ccc;padding:8px;min-width:70px;">${escapeHtml(cell)}</td>`;
});
html += "</tr>";
});

table.innerHTML = html;

}

function updateSheetCell(el){

const r = Number(el.dataset.row);
const c = Number(el.dataset.col);
officeSheetData[r][c] = el.innerText;

}

function addSheetRow(){

const cols = officeSheetData[0] ? officeSheetData[0].length : 5;
officeSheetData.push(new Array(cols).fill(""));
renderSheetTable();

}

function addSheetColumn(){

officeSheetData.forEach((row) => row.push(""));
renderSheetTable();

}

async function saveOfficeFile(){

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

const title = document.getElementById("officeTitleInput").value.trim() || "Untitled";

const data = {
uid: user.uid,
type: officeMode,
title: title,
updatedAt: new Date()
};

if(officeMode === "doc"){
data.content = document.getElementById("officeDocEditor").innerHTML;
}else{
data.sheetData = JSON.stringify(officeSheetData);
}

try{

if(currentOfficeFileId){

await window.updateDoc(
window.doc(window.db, "officeFiles", currentOfficeFileId),
data
);

}else{

const docRef = await window.addDoc(
window.collection(window.db, "officeFiles"),
data
);

currentOfficeFileId = docRef.id;

}

showToast("Saved");
loadOfficeFilesList();

}catch(error){

showToast(error.message);

}

}

async function loadOfficeFilesList(){

const user = window.auth.currentUser;

if(!user) return;

const q = window.query(
window.collection(window.db, "officeFiles"),
window.where("uid", "==", user.uid)
);

const querySnapshot = await window.getDocs(q);

let html = "";

querySnapshot.forEach((docSnap) => {

const data = docSnap.data();
const icon = data.type === "sheet" ? "📊" : "📝";

html += `
<div class="box" style="text-align:left;display:flex;align-items:center;gap:12px;margin-bottom:10px;">
<div style="font-size:1.4rem;">${icon}</div>
<div style="flex:1;min-width:0;cursor:pointer;" onclick="loadOfficeFile('${docSnap.id}')">
<h3 style="margin-top:0;font-size:1rem;">${escapeHtml(data.title || "Untitled")}</h3>
<p style="opacity:.7;font-size:.8rem;">${data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleString() : ""}</p>
</div>
<button class="btn-danger" style="width:auto;padding:8px 14px;margin:0;" onclick="deleteOfficeFile('${docSnap.id}')">🗑️</button>
</div>
`;

});

document.getElementById("officeFilesList").innerHTML =
html || "<p style='opacity:.7;'>No saved files yet.</p>";

}

async function loadOfficeFile(id){

const docSnap = await window.getDoc(window.doc(window.db, "officeFiles", id));

if(!docSnap.exists()) return;

const data = docSnap.data();

currentOfficeFileId = id;
document.getElementById("officeTitleInput").value = data.title || "";

if(data.type === "sheet"){

officeSheetData = JSON.parse(data.sheetData || "[]");
if(officeSheetData.length === 0){
officeSheetData = [new Array(5).fill("")];
}
switchOfficeMode("sheet");
renderSheetTable();

}else{

document.getElementById("officeDocEditor").innerHTML = data.content || "";
switchOfficeMode("doc");

}

}

async function deleteOfficeFile(id){

await window.deleteDoc(window.doc(window.db, "officeFiles", id));

if(currentOfficeFileId === id){
newOfficeFile();
}

loadOfficeFilesList();

}

function printOfficeFile(){

window.print();

}

function openSaveAsModal(){

document.getElementById("saveAsDocOptions").classList.toggle("hidden", officeMode !== "doc");
document.getElementById("saveAsSheetOptions").classList.toggle("hidden", officeMode !== "sheet");

document.getElementById("saveAsModal").classList.add("show");

}

function closeSaveAsModal(){

document.getElementById("saveAsModal").classList.remove("show");

}

function downloadBlob(blob, filename){

const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = filename;
link.click();

}

function exportAsWord(){

const title = document.getElementById("officeTitleInput").value.trim() || "Untitled";
const htmlContent = document.getElementById("officeDocEditor").innerHTML;

const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + escapeHtml(title) + "</title></head><body>";
const footer = "</body></html>";

const blob = new Blob(["\ufeff", header + htmlContent + footer], { type: "application/msword" });

downloadBlob(blob, title + ".doc");
closeSaveAsModal();

}

function exportAsText(){

const title = document.getElementById("officeTitleInput").value.trim() || "Untitled";
const plainText = document.getElementById("officeDocEditor").innerText;

const blob = new Blob([plainText], { type: "text/plain" });

downloadBlob(blob, title + ".txt");
closeSaveAsModal();

}

function exportAsCSV(){

const title = document.getElementById("officeTitleInput").value.trim() || "Untitled";

const csvRows = officeSheetData.map((row) =>
row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")
);

const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });

downloadBlob(blob, title + ".csv");
closeSaveAsModal();

}

function openMyFiles(){

hideAllSections();

document.getElementById("filesSection").classList.remove("hidden");

document.getElementById("myFilesViewer").innerHTML = "";

showBackButton();

}

function handleMyFilesPick(event){

const file = event.target.files[0];

if(!file) return;

const viewer = document.getElementById("myFilesViewer");
const url = URL.createObjectURL(file);

viewer.innerHTML = "";

const info = document.createElement("p");
info.style.opacity = ".8";
info.style.fontSize = ".85rem";
info.style.margin = "16px 0 10px";
info.innerText = "📎 " + file.name + " (" + Math.round(file.size / 1024) + " KB)";
viewer.appendChild(info);

if(file.type.startsWith("image/")){

const img = document.createElement("img");
img.src = url;
img.style.maxWidth = "100%";
img.style.borderRadius = "10px";
viewer.appendChild(img);

}else if(file.type.startsWith("video/")){

const video = document.createElement("video");
video.src = url;
video.controls = true;
video.style.maxWidth = "100%";
video.style.borderRadius = "10px";
viewer.appendChild(video);

}else if(file.type === "text/plain"){

const reader = new FileReader();

reader.onload = () => {
const pre = document.createElement("pre");
pre.style.whiteSpace = "pre-wrap";
pre.style.background = "rgba(0,0,0,.2)";
pre.style.padding = "12px";
pre.style.borderRadius = "8px";
pre.style.maxHeight = "50vh";
pre.style.overflowY = "auto";
pre.innerText = reader.result;
viewer.appendChild(pre);
};

reader.readAsText(file);

}else{

const openBtn = document.createElement("button");
openBtn.style.width = "auto";
openBtn.style.padding = "14px 20px";
openBtn.style.margin = "0";
openBtn.innerText = "Open " + file.name;
openBtn.onclick = () => window.open(url, "_blank");
viewer.appendChild(openBtn);

}

}

function openSearch(){

hideAllSections();

document.getElementById("searchSection").classList.remove("hidden");

showBackButton();

document.getElementById("searchQueryInput").focus();

}

function runSearch(engine){

const query = document.getElementById("searchQueryInput").value.trim();

if(!query){
showToast("Type something to search first");
return;
}

const encoded = encodeURIComponent(query);

const urls = {
google: "https://www.google.com/search?q=" + encoded,
youtube: "https://www.youtube.com/results?search_query=" + encoded,
wikipedia: "https://en.wikipedia.org/wiki/Special:Search?search=" + encoded
};

window.open(urls[engine], "_blank", "noopener");

}

function openLearningHub(){

hideAllSections();

document.getElementById("learningHubSection").classList.remove("hidden");

showBackButton();

}

function openToolsHub(){

hideAllSections();

document.getElementById("toolsHubSection").classList.remove("hidden");

showBackButton();

}

function openPrivacyPolicy(){

hideAllSections();

document.getElementById("privacySection").classList.remove("hidden");

showBackButton();

}

function openGES(){

hideAllSections();

document.getElementById("gesSection").classList.remove("hidden");

showBackButton();

selectGESLevel(currentGESLevel);

}

function selectGESLevel(level){

currentGESLevel = level;
currentGESYear = 1;

["Primary", "JHS", "SHS"].forEach((lvl) => {
document.getElementById("gesTab" + lvl).style.background =
(lvl === level) ? "#ffd700" : "";
document.getElementById("gesTab" + lvl).style.color =
(lvl === level) ? "#111" : "";
});

const yearCount = GES_YEAR_COUNT[level] || 3;
const yearTabsEl = document.getElementById("gesYearTabs");

let yearButtons = "";
for(let y = 1; y <= yearCount; y++){
yearButtons += `<button class="btn-secondary gesYearBtn" style="width:auto;padding:9px 16px;margin:0;font-size:.85rem;" onclick="selectGESYear(${y})" data-year="${y}">Year ${y}</button>`;
}
yearTabsEl.innerHTML = yearButtons;

renderGESYearHighlight();
renderGESList();

}

function selectGESYear(year){

currentGESYear = year;
renderGESYearHighlight();
renderGESList();

}

function renderGESYearHighlight(){

document.querySelectorAll(".gesYearBtn").forEach((btn) => {
const isActive = Number(btn.dataset.year) === currentGESYear;
btn.style.background = isActive ? "#ffd700" : "";
btn.style.color = isActive ? "#111" : "";
});

}

function renderGESList(){

const listEl = document.getElementById("gesMaterialsList");
const items = (GES_MATERIALS[currentGESLevel] || []).filter(
(item) => item.years.includes(currentGESYear)
);

if(items.length === 0){
listEl.innerHTML = "<p style='opacity:.7;'>No materials added for this year yet.</p>";
return;
}

listEl.innerHTML = items.map((item) => `
<div class="box" style="text-align:left;display:flex;align-items:center;gap:14px;margin-bottom:12px;">
<div style="width:44px;height:44px;border-radius:10px;background:rgba(255,215,0,.18);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;">📄</div>
<div style="flex:1;min-width:0;">
<h3 style="margin-top:0;font-size:1rem;">${escapeHtml(item.subject)}</h3>
<p style="opacity:.75;font-size:.85rem;">${escapeHtml(item.title)}</p>
</div>
<a href="${item.url}" target="_blank" rel="noopener" style="text-decoration:none;">
<button class="btn-secondary" style="width:auto;padding:10px 16px;margin:0;">Open</button>
</a>
</div>
`).join("");

}

function openQuiz(){

hideAllSections();

document.getElementById("quizSection").classList.remove("hidden");

showQuizScreen("quizLevelChoice");
showBackButton();

cleanupOldQuizScores();

}

// Clears out quiz scores older than 2 days so each leaderboard
// effectively resets itself every couple of days, keeping it fresh.
// Same free, client-triggered approach as the chat auto-delete —
// Firestore's built-in auto-delete needs a paid plan.
const QUIZ_SCORE_LIFETIME_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

async function cleanupOldQuizScores(){

try{

const cutoff = new Date(Date.now() - QUIZ_SCORE_LIFETIME_MS);

const q = window.query(
window.collection(window.db, "quizScores"),
window.where("createdAt", "<", cutoff)
);

const querySnapshot = await window.getDocs(q);

for(const docSnap of querySnapshot.docs){
await window.deleteDoc(
window.doc(window.db, "quizScores", docSnap.id)
);
}

}catch(error){

console.log("Quiz score cleanup error:", error);

}

}

let leaderboardRefreshInterval = null;
const LEADERBOARD_REFRESH_MS = 30000; // refresh every 30 seconds while open

function showQuizScreen(screenId){

if(screenId !== "quizLeaderboard" && leaderboardRefreshInterval){
clearInterval(leaderboardRefreshInterval);
leaderboardRefreshInterval = null;
}

const screens = ["quizLevelChoice","quizSubjectChoice","quizPlay","quizResults","quizLeaderboard"];

screens.forEach((id) => {

if(id === screenId){
document.getElementById(id).classList.remove("hidden");
}else{
document.getElementById(id).classList.add("hidden");
}

});

}

function chooseQuizLevel(level){

quizLevel = level;

const subjects = QUIZ_DATA[level].subjects;

let html = "";

Object.keys(subjects).forEach((subjectName) => {

html += `<button onclick="startQuiz('${subjectName}')">${escapeHtml(subjectName)} (${subjects[subjectName].length} Qs)</button>`;

});

document.getElementById("quizSubjectList").innerHTML = html;

showQuizScreen("quizSubjectChoice");

}

function startQuiz(subjectName){

quizSubject = subjectName;
quizQuestions = QUIZ_DATA[quizLevel].subjects[subjectName];
quizIndex = 0;
quizScore = 0;

renderQuizQuestion();

showQuizScreen("quizPlay");

}

function renderQuizQuestion(){

const question = quizQuestions[quizIndex];

document.getElementById("quizProgress").innerText =
quizSubject + " — Question " + (quizIndex + 1) + " of " + quizQuestions.length;

document.getElementById("quizQuestionText").innerText = question.q;

let html = "";

question.options.forEach((option, i) => {

html += `<button onclick="answerQuiz(${i})">${escapeHtml(option)}</button>`;

});

document.getElementById("quizOptions").innerHTML = html;

}

function answerQuiz(selectedIndex){

const question = quizQuestions[quizIndex];

if(selectedIndex === question.answer){
quizScore++;
}

quizIndex++;

if(quizIndex < quizQuestions.length){
renderQuizQuestion();
}else{
finishQuiz();
}

}

async function finishQuiz(){

document.getElementById("quizScoreText").innerHTML =
"You scored <strong>" + quizScore + " / " + quizQuestions.length + "</strong> on " + escapeHtml(quizSubject) + "!";

showQuizScreen("quizResults");

const user = window.auth.currentUser;

if(!user) return;

const name = getSavedStudentName();

try{

await window.addDoc(
window.collection(window.db, "quizScores"),
{
uid: user.uid,
name: name,
level: quizLevel,
subject: quizSubject,
score: quizScore,
total: quizQuestions.length,
createdAt: new Date()
}
);

}catch(error){

console.log("Could not save quiz score:", error);

}

}

function restartCurrentQuiz(){

quizIndex = 0;
quizScore = 0;

renderQuizQuestion();

showQuizScreen("quizPlay");

}

async function showQuizLeaderboard(){

document.getElementById("leaderboardSubjectName").innerText = quizSubject;

showQuizScreen("quizLeaderboard");

await loadLeaderboardData();

if(leaderboardRefreshInterval){
clearInterval(leaderboardRefreshInterval);
}

leaderboardRefreshInterval = setInterval(loadLeaderboardData, LEADERBOARD_REFRESH_MS);

}

async function loadLeaderboardData(){

document.getElementById("leaderboardList").innerHTML = "Loading...";

try{

// Filtering by subject only (no orderBy combined with it) avoids
// needing a special Firestore composite index — we just sort the
// small result set ourselves once it arrives.
const q = window.query(
window.collection(window.db, "quizScores"),
window.where("subject", "==", quizSubject)
);

const querySnapshot = await window.getDocs(q);

let scores = [];

const now = Date.now();

querySnapshot.forEach((docSnap) => {
const data = docSnap.data();
// Only show scores that are still within the 2-day window
const age = now - (data.createdAt ? data.createdAt.seconds * 1000 : 0);
if(age < QUIZ_SCORE_LIFETIME_MS){
scores.push(data);
}
});

scores.sort((a, b) => b.score - a.score);
scores = scores.slice(0, 10);

// Calculate time until next reset (oldest score's expiry)
let resetCountdown = "";

if(scores.length > 0){

const oldest = querySnapshot.docs
.map((d) => d.data())
.filter((d) => d.createdAt)
.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)[0];

if(oldest && oldest.createdAt){

const msUntilReset = (oldest.createdAt.seconds * 1000 + QUIZ_SCORE_LIFETIME_MS) - now;

if(msUntilReset > 0){

const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
const mins = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

resetCountdown = `<p style="opacity:.55;font-size:.75rem;margin-bottom:12px;">⏰ Resets in ${hours}h ${mins}m</p>`;

}

}

}

let rows = resetCountdown;
let rank = 1;

const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
const medalBg = {
1: "rgba(255,215,0,.18)",
2: "rgba(192,192,192,.18)",
3: "rgba(205,127,50,.18)"
};
const medalBorder = {
1: "rgba(255,215,0,.5)",
2: "rgba(192,192,192,.5)",
3: "rgba(205,127,50,.5)"
};

scores.forEach((data) => {

const badge = medals[rank] || ("#" + rank);
const bg = medalBg[rank] || "rgba(255,255,255,.1)";
const border = medalBorder[rank] || "rgba(255,255,255,.15)";
const pct = data.total ? Math.round((data.score / data.total) * 100) : 0;
const level = data.level ? `<small style="opacity:.55;"> · ${escapeHtml(data.level)}</small>` : "";

rows += `
<div style="display:flex;justify-content:space-between;align-items:center;background:${bg};border:1px solid ${border};padding:10px;margin-top:8px;border-radius:10px;">
<span>${badge} ${escapeHtml(data.name || "Student")}${level}</span>
<span><strong>${data.score}/${data.total}</strong> <small style="opacity:.7;">${pct}%</small></span>
</div>
`;

rank++;

});

document.getElementById("leaderboardList").innerHTML =
rows || "<p>No scores yet — be the first!</p>";

}catch(error){

document.getElementById("leaderboardList").innerHTML =
"<p>Couldn't load the leaderboard right now.</p>";

console.log(error);

}

}

// ---- Direct Messages & Groups ----
// Lets two students find each other by email and chat privately, or
// create a group with several people. Built on the same Firestore
// real-time pattern as Class Chat, just with separate conversation
// "rooms" instead of one shared room.

let pendingGroupMembers = []; // {uid, name, email} collected while building a new group
let currentConversationId = null;
let threadUnsubscribe = null;
let conversationListUnsubscribe = null;
let lastLoadedConversations = []; // cache so we can safely look up a title by ID (avoids putting user-typed names into onclick attributes)
let contactPicCache = {}; // uid -> profilePicture data URL (or null if none/unavailable), avoids re-fetching on every snapshot

// A separate listener that runs for the whole session (started at
// login, like Class Chat), purely so DM/group notifications work no
// matter which screen you're currently on — not just while the
// Messages section happens to be open.
let globalDmUnsubscribe = null;
let isInitialGlobalDmLoad = true;

function startGlobalDmListener(){

if(globalDmUnsubscribe) return;

const user = window.auth.currentUser;

if(!user) return;

isInitialGlobalDmLoad = true;

const q = window.query(
window.collection(window.db, "conversations"),
window.where("participants", "array-contains", user.uid)
);

globalDmUnsubscribe = window.onSnapshot(q, (querySnapshot) => {

if(isInitialGlobalDmLoad){
isInitialGlobalDmLoad = false;
return;
}

querySnapshot.docChanges().forEach((change) => {

if(change.type !== "added" && change.type !== "modified") return;

const data = change.doc.data();

if(!data.lastMessageSenderUid || data.lastMessageSenderUid === user.uid) return;

const threadIsOpenAndFocused =
currentConversationId === change.doc.id &&
!document.getElementById("messagesSection").classList.contains("hidden") &&
document.hasFocus();

if(threadIsOpenAndFocused) return;

let title;

if(data.type === "group"){
title = "👥 " + (data.groupName || "Group");
}else{
title = (data.participantNames && data.participantNames[data.lastMessageSenderUid]) || "New message";
}

showAppNotification(title, data.lastMessage || "New message");

});

}, (error) => {

console.log("Global DM listener error:", error);

});

}

function stopGlobalDmListener(){

if(globalDmUnsubscribe){
globalDmUnsubscribe();
globalDmUnsubscribe = null;
}

}

function openMessages(){

hideAllSections();

document.getElementById("messagesSection").classList.remove("hidden");

showBackButton();

showMsgScreen("conversationListView");
loadConversationList();

}

function showMsgScreen(screenId){

const screens = ["conversationListView","newChatSearchView","newGroupSetupView","chatThreadView"];

if(screenId !== "chatThreadView" && threadUnsubscribe){
threadUnsubscribe();
threadUnsubscribe = null;
}

screens.forEach((id) => {

if(id === screenId){
document.getElementById(id).classList.remove("hidden");
}else{
document.getElementById(id).classList.add("hidden");
}

});

}

function backToConversationList(){

showMsgScreen("conversationListView");
loadConversationList();

}

function showNewChatSearch(){

document.getElementById("searchEmailInput").value = "";
document.getElementById("searchStatus").innerText = "";

showMsgScreen("newChatSearchView");

}

function showNewGroupSetup(){

pendingGroupMembers = [];

document.getElementById("groupNameInput").value = "";
document.getElementById("groupMemberEmailInput").value = "";
document.getElementById("groupStatus").innerText = "";

renderGroupMembersList();

showMsgScreen("newGroupSetupView");

}

function renderGroupMembersList(){

let html = "";

pendingGroupMembers.forEach((member, i) => {

html += `
<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.1);padding:8px 12px;margin-top:6px;border-radius:8px;">
<span>${escapeHtml(member.name)} (${escapeHtml(member.email)})</span>
<button class="btn-danger" style="width:auto;margin:0;padding:4px 10px;" onclick="removeGroupMember(${i})">✕</button>
</div>
`;

});

document.getElementById("groupMembersList").innerHTML = html;

}

function removeGroupMember(index){

pendingGroupMembers.splice(index, 1);

renderGroupMembersList();

}

// Looks up a user document by email OR phone number. Returns
// {uid, name, email} or null. Tries an exact email match first, then
// falls back to phone number if no email match is found.
async function findUserByContact(contact){

const trimmed = contact.trim();

let q = window.query(
window.collection(window.db, "user"),
window.where("email", "==", trimmed.toLowerCase())
);

let querySnapshot = await window.getDocs(q);

if(querySnapshot.empty){

q = window.query(
window.collection(window.db, "user"),
window.where("phoneNumber", "==", trimmed)
);

querySnapshot = await window.getDocs(q);

}

if(querySnapshot.empty){
return null;
}

const docSnap = querySnapshot.docs[0];
const data = docSnap.data();

return { uid: docSnap.id, name: data.fullName, email: data.email };

}

async function addGroupMember(){

const contact = document.getElementById("groupMemberEmailInput").value.trim();

if(!contact){
return;
}

const currentUser = window.auth.currentUser;
const myPhone = localStorage.getItem("studentPhone") || "";

if(currentUser && (
contact.toLowerCase() === (currentUser.email || "").toLowerCase() ||
(myPhone && contact === myPhone)
)){
document.getElementById("groupStatus").innerText = "That's you — you're already included automatically.";
return;
}

if(pendingGroupMembers.some((m) => m.email.toLowerCase() === contact.toLowerCase())){
document.getElementById("groupStatus").innerText = "That person is already added.";
return;
}

document.getElementById("groupStatus").innerText = "Searching...";

const found = await findUserByContact(contact);

if(!found){
document.getElementById("groupStatus").innerText =
"No Adeka Academy Hub account found with that email or phone number.";
return;
}

pendingGroupMembers.push(found);

document.getElementById("groupMemberEmailInput").value = "";
document.getElementById("groupStatus").innerText = "Added " + found.name + "!";

renderGroupMembersList();

}

async function createGroup(){

const groupName = document.getElementById("groupNameInput").value.trim();

if(!groupName){
showToast("Enter a group name first");
return;
}

if(pendingGroupMembers.length === 0){
showToast("Add at least one member first");
return;
}

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

const myName = getSavedStudentName();

const participantUids = [user.uid, ...pendingGroupMembers.map((m) => m.uid)];

const participantNames = {};
participantNames[user.uid] = myName;
pendingGroupMembers.forEach((m) => { participantNames[m.uid] = m.name; });

try{

const docRef = await window.addDoc(
window.collection(window.db, "conversations"),
{
type: "group",
groupName: groupName,
participants: participantUids,
participantNames: participantNames,
createdBy: user.uid,
createdAt: new Date(),
lastMessage: "Group created",
lastMessageAt: new Date(),
lastMessageSenderUid: user.uid
}
);

openThread(docRef.id, "👥 " + groupName);

}catch(error){

showToast(error.message);

}

}

async function searchUserAndStartChat(){

const contact = document.getElementById("searchEmailInput").value.trim();

if(!contact){
return;
}

const currentUser = window.auth.currentUser;

if(!currentUser){
showToast("Please login first");
return;
}

const myPhone = localStorage.getItem("studentPhone") || "";

if(contact.toLowerCase() === (currentUser.email || "").toLowerCase() ||
(myPhone && contact === myPhone)){
document.getElementById("searchStatus").innerText = "You can't message yourself.";
return;
}

document.getElementById("searchStatus").innerText = "Searching...";

const found = await findUserByContact(contact);

if(!found){
document.getElementById("searchStatus").innerText =
"No Adeka Academy Hub account found with that email or phone number.";
return;
}

document.getElementById("searchStatus").innerText = "Found " + found.name + " — opening chat...";

const myName = getSavedStudentName();

// A deterministic ID for direct chats (based on both UIDs, sorted) means
// the same two people always land in the same conversation instead of
// creating a new duplicate one every time.
const directId = "dm_" + [currentUser.uid, found.uid].sort().join("_");

const participantNames = {};
participantNames[currentUser.uid] = myName;
participantNames[found.uid] = found.name;

try{

await window.setDoc(
window.doc(window.db, "conversations", directId),
{
type: "direct",
participants: [currentUser.uid, found.uid],
participantNames: participantNames,
createdAt: new Date(),
lastMessage: "",
lastMessageAt: new Date()
},
{ merge: true }
);

openThread(directId, found.name, found.uid);

}catch(error){

showToast(error.message);

}

}

let currentThreadOtherUid = null; // null for groups; the other person's uid for direct chats

async function openThread(conversationId, title, otherUid){

currentConversationId = conversationId;
currentThreadOtherUid = otherUid || null;

const nickname = otherUid ? localStorage.getItem("contactNickname_" + otherUid) : null;

document.getElementById("chatThreadTitle").innerText = nickname || title;
document.getElementById("threadMessages").innerHTML = "";

const picEl = document.getElementById("threadHeaderPic");
const editBtn = document.getElementById("threadEditNameBtn");

if(otherUid){

editBtn.classList.remove("hidden");
picEl.style.display = "none";

try{

const otherDoc = await window.getDoc(window.doc(window.db, "user", otherUid));

if(otherDoc.exists() && otherDoc.data().profilePicture){
picEl.src = otherDoc.data().profilePicture;
picEl.style.display = "block";
}

}catch(error){

console.log("Couldn't load contact picture:", error);

}

}else{

editBtn.classList.add("hidden");
picEl.style.display = "none";

}

showMsgScreen("chatThreadView");

cleanupOldThreadMessages(conversationId);

if(threadUnsubscribe){
threadUnsubscribe();
threadUnsubscribe = null;
}

const q = window.query(
window.collection(window.db, "conversations", conversationId, "messages"),
window.orderBy("createdAt", "asc"),
window.limit(100)
);

threadUnsubscribe = window.onSnapshot(q, (querySnapshot) => {

const currentUid = window.auth.currentUser ? window.auth.currentUser.uid : null;

let html = "";
lastLoadedThreadMessages = {};

querySnapshot.forEach((docSnap) => {

const data = docSnap.data();

lastLoadedThreadMessages[docSnap.id] = data;

html += renderMessageBubble("thread", docSnap.id, data, currentUid);

});

const messagesDiv = document.getElementById("threadMessages");
messagesDiv.innerHTML = html;
messagesDiv.scrollTop = messagesDiv.scrollHeight;

}, (error) => {

console.log("Thread listener error:", error);

});

}

// Safe click handler for the conversation list: only ever passes the
// Firestore document ID through the onclick attribute (never a
// user-typed name), then looks the title up from memory. This avoids
// any risk of someone's name/group name breaking or hijacking the
// inline JS the way putting raw text into an onclick string could.
function openThreadById(conversationId){

const convo = lastLoadedConversations.find((c) => c.id === conversationId);

if(!convo) return;

const user = window.auth.currentUser;
let title;
let otherUid = null;

if(convo.type === "group"){
title = "👥 " + (convo.groupName || "Group");
}else{
otherUid = convo.participants.find((uid) => uid !== user.uid);
title = (convo.participantNames && convo.participantNames[otherUid]) || "Direct Chat";
}

openThread(conversationId, title, otherUid);

}

async function sendThreadMessage(){

const input = document.getElementById("threadInput");
const text = input.value.trim();

if(!text || !currentConversationId) return;

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

const name = getSavedStudentName();

try{

if(activeEdit && activeEdit.scope === "thread"){

await window.updateDoc(
window.doc(window.db, "conversations", currentConversationId, "messages", activeEdit.docId),
{ text: text, edited: true }
);

cancelComposerContext("thread");
return;

}

const messageData = {
uid: user.uid,
name: name,
text: text,
createdAt: new Date()
};

if(activeReply && activeReply.scope === "thread"){
messageData.replyToName = activeReply.name;
messageData.replyToText = activeReply.text;
}

await window.addDoc(
window.collection(window.db, "conversations", currentConversationId, "messages"),
messageData
);

await window.updateDoc(
window.doc(window.db, "conversations", currentConversationId),
{
lastMessage: text,
lastMessageAt: new Date(),
lastMessageSenderUid: user.uid
}
);

input.value = "";
cancelComposerContext("thread");

}catch(error){

showToast(error.message);

}

}

function loadConversationList(){

const user = window.auth.currentUser;

if(!user) return;

if(conversationListUnsubscribe){
conversationListUnsubscribe();
conversationListUnsubscribe = null;
}

const q = window.query(
window.collection(window.db, "conversations"),
window.where("participants", "array-contains", user.uid)
);

conversationListUnsubscribe = window.onSnapshot(q, (querySnapshot) => {

let conversations = [];

querySnapshot.forEach((docSnap) => {
conversations.push(Object.assign({ id: docSnap.id }, docSnap.data()));
});

// Sorting here (instead of in the query) avoids needing a special
// Firestore composite index for array-contains + orderBy together.
conversations.sort((a, b) => {
const aTime = a.lastMessageAt ? a.lastMessageAt.seconds : 0;
const bTime = b.lastMessageAt ? b.lastMessageAt.seconds : 0;
return bTime - aTime;
});

lastLoadedConversations = conversations;

let html = "";
const uidsToFetch = [];

conversations.forEach((convo) => {

let title;
let otherUid = null;
let avatarHtml;

if(convo.type === "group"){
title = "👥 " + (convo.groupName || "Group");
avatarHtml = `<div class="convoAvatar convoAvatarGroup">👥</div>`;
}else{
otherUid = convo.participants.find((uid) => uid !== user.uid);
const nickname = localStorage.getItem("contactNickname_" + otherUid);
title = nickname || (convo.participantNames && convo.participantNames[otherUid]) || "Direct Chat";

const cachedPic = contactPicCache[otherUid];
if(cachedPic){
avatarHtml = `<img class="convoAvatar" src="${cachedPic}">`;
}else{
avatarHtml = `<div class="convoAvatar convoAvatarInitial" id="convoAvatar_${otherUid}">${escapeHtml(title.charAt(0).toUpperCase())}</div>`;
if(cachedPic === undefined) uidsToFetch.push(otherUid);
}
}

const preview = convo.lastMessage
? convo.lastMessage.slice(0, 40)
: "No messages yet";

html += `
<div class="box" style="text-align:left;display:flex;align-items:center;gap:14px;" onclick="openThreadById('${convo.id}')">
${avatarHtml}
<div style="flex:1;min-width:0;">
<h3 style="margin-top:0;">${escapeHtml(title)}</h3>
<p style="opacity:.75;">${escapeHtml(preview)}</p>
</div>
</div>
`;

});

document.getElementById("conversationList").innerHTML =
html || "<p style='opacity:.7;margin-top:15px;'>No conversations yet — start one above!</p>";

// Fetch and fill in real profile pictures for any direct-chat contacts
// not already cached, without blocking the initial (fast) render above.
uidsToFetch.forEach(async (uid) => {
try{
const otherDoc = await window.getDoc(window.doc(window.db, "user", uid));
const pic = (otherDoc.exists() && otherDoc.data().profilePicture) || null;
contactPicCache[uid] = pic;
if(pic){
const el = document.getElementById("convoAvatar_" + uid);
if(el){
const img = document.createElement("img");
img.className = "convoAvatar";
img.src = pic;
el.replaceWith(img);
}
}
}catch(error){
console.log("Couldn't load contact avatar:", error);
}
});

}, (error) => {

console.log("Conversation list error:", error);
document.getElementById("conversationList").innerHTML =
"<p>Couldn't load conversations right now.</p>";

});

}

 function updateCharCount(){

const text =
document.getElementById("noteText").value;

document.getElementById("charCount").innerText =
text.length;

const words =
text.trim() === ""
? 0
: text.trim().split(/\s+/).length;

document.getElementById("wordCount").innerText =
words;

   localStorage.setItem(
"draftNote",
text
);

}

function openNotes(){

hideAllSections();

document
.getElementById("notesSection")
.classList.remove("hidden");

  loadNotes();
loadDraft();
showBackButton();

}

  function loadDraft(){

const draft =
localStorage.getItem("draftNote");

if(draft){

document.getElementById("noteText").value =
draft;

updateCharCount();

}

}

// Holds the active Jitsi call instances so we can dispose of them cleanly
// (leaving a call) instead of letting multiple calls pile up in memory.
let meetingApi = null;
let audioApi = null;

function joinMeeting(){

const code =
document.getElementById("meetingCode").value.trim();

if(!code){
showToast("Enter a room name first");
return;
}

if(meetingApi){
meetingApi.dispose();
meetingApi = null;
}

const studentName =
localStorage.getItem("studentName") || "Guest";

document.getElementById("jitsiMeetingContainer").classList.remove("hidden");
document.getElementById("leaveMeetingBtn").classList.remove("hidden");

meetingApi = new JitsiMeetExternalAPI("meet.jit.si", {
roomName: "AdekaAcademyHub-" + code,
parentNode: document.getElementById("jitsiMeetingContainer"),
width: "100%",
height: 480,
userInfo: { displayName: studentName },
configOverwrite: { prejoinPageEnabled: false }
});

}

function leaveMeeting(){

if(meetingApi){
meetingApi.dispose();
meetingApi = null;
}

document.getElementById("jitsiMeetingContainer").classList.add("hidden");
document.getElementById("jitsiMeetingContainer").innerHTML = "";
document.getElementById("leaveMeetingBtn").classList.add("hidden");

}

function joinAudioRoom(){

const code =
document.getElementById("audioRoomCode").value.trim();

if(!code){
showToast("Enter a room name first");
return;
}

if(audioApi){
audioApi.dispose();
audioApi = null;
}

const studentName =
localStorage.getItem("studentName") || "Guest";

document.getElementById("jitsiAudioContainer").classList.remove("hidden");
document.getElementById("leaveAudioBtn").classList.remove("hidden");

audioApi = new JitsiMeetExternalAPI("meet.jit.si", {
roomName: "AdekaAcademyHubAudio-" + code,
parentNode: document.getElementById("jitsiAudioContainer"),
width: "100%",
height: 480,
userInfo: { displayName: studentName },
configOverwrite: {
prejoinPageEnabled: false,
startAudioOnly: true,
startWithVideoMuted: true
}
});

}

function leaveAudioRoom(){

if(audioApi){
audioApi.dispose();
audioApi = null;
}

document.getElementById("jitsiAudioContainer").classList.add("hidden");
document.getElementById("jitsiAudioContainer").innerHTML = "";
document.getElementById("leaveAudioBtn").classList.add("hidden");

}

 async function saveNote(){

const note =
document.getElementById("noteText").value;

const user =
window.auth.currentUser;

if(!user){

showToast("Please login first");
return;

}

if(!note.trim()){

showToast("Note is empty");
return;

}

try{

await window.addDoc(
window.collection(window.db, "notes"),
{
uid: user.uid,
note: note,
createdAt: new Date()
}
);
  const alreadyEarned = !!localStorage.getItem("firstNoteBadge");

localStorage.setItem(
"firstNoteBadge",
"earned"
);

if(!alreadyEarned){
playBadgeSound();
}

document.getElementById("noteText").value = "";
  localStorage.removeItem("draftNote");

loadNotes();
}catch(error){

showToast(error.message);

}

}

// ---- Dashboard greeting, study streak & daily quote ----
// A small "learning platform" touch — nothing here needs the internet,
// it's all computed from localStorage and the current date.

const DAILY_QUOTES = [
"Small steps every day lead to big results.",
"You don't have to be perfect, just consistent.",
"Every question you ask makes you smarter.",
"Mistakes are proof that you're trying.",
"Believe in yourself — you're capable of amazing things.",
"Discipline today, success tomorrow.",
"Learning never exhausts the mind.",
"Stay curious. Stay growing."
];

function getQuoteOfTheDay(){

const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
return DAILY_QUOTES[dayIndex % DAILY_QUOTES.length];

}

function updateStudyStreak(){

const today = new Date().toDateString();
const lastVisit = localStorage.getItem("lastVisitDate");
let streak = parseInt(localStorage.getItem("studyStreak") || "0", 10);

if(lastVisit !== today){

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

if(lastVisit === yesterday.toDateString()){
streak++;
}else{
streak = 1;
}

localStorage.setItem("lastVisitDate", today);
localStorage.setItem("studyStreak", streak.toString());

}

return streak;

}

function renderGreeting(){

const name = getSavedStudentName();
const streak = updateStudyStreak();
const quote = getQuoteOfTheDay();

const toast = document.getElementById("welcomeToast");

if(!toast) return;

document.getElementById("welcomeToastName").innerText =
"👋 Welcome back, " + name + "!";

document.getElementById("welcomeToastStreak").innerText =
"🔥 " + streak + " day" + (streak === 1 ? "" : "s") + " study streak";

document.getElementById("welcomeToastQuote").innerText =
"💡 " + quote;

// Show the toast — slide down from top and fade in
toast.style.display = "block";

requestAnimationFrame(() => {
requestAnimationFrame(() => {
toast.style.opacity = "1";
toast.style.transform = "translateX(-50%) translateY(0)";
});
});

// Fade out and slide back up after 3.5 seconds
clearTimeout(window._welcomeToastTimer);
window._welcomeToastTimer = setTimeout(() => {
toast.style.opacity = "0";
toast.style.transform = "translateX(-50%) translateY(-20px)";
setTimeout(() => {
toast.style.display = "none";
}, 450);
}, 3500);

}

// Stops any Firestore listeners or intervals that might still be running
// in the background after leaving a screen or logging out. Without this,
// listeners from Messages or the quiz leaderboard would keep running
// (and using up Firestore reads) even after navigating away.
function stopAllBackgroundListeners(){

if(conversationListUnsubscribe){
conversationListUnsubscribe();
conversationListUnsubscribe = null;
}

if(threadUnsubscribe){
threadUnsubscribe();
threadUnsubscribe = null;
}

if(leaderboardRefreshInterval){
clearInterval(leaderboardRefreshInterval);
leaderboardRefreshInterval = null;
}

}

function backToDashboard(){

hideAllSections();
document.getElementById("dashboardHome").classList.remove("hidden");
closeMenu();
hideBackButton();
leaveMeeting();
leaveAudioRoom();
renderGreeting();
setTimeout(showAIGreetingCard, 1200);
stopAllBackgroundListeners();

}

 async function loadNotes(){

const user = window.auth.currentUser;

if(!user) return;

const q = window.query(
window.collection(window.db, "notes"),
window.where("uid", "==", user.uid)
);

const querySnapshot =
await window.getDocs(q);

const totalCount = querySnapshot.size;
let shownCount = 0;
let html = "";
   const search =
document.getElementById("searchNotes")
.value
.toLowerCase();

querySnapshot.forEach((docSnap) => {

  if(
!docSnap.data().note
.toLowerCase()
.includes(search)
){
return;
}
  shownCount++;

html += `
<div style="
background:rgba(255,255,255,.1);
padding:10px;
margin-top:10px;
border-radius:10px;
">

<p>${docSnap.data().note}</p>

<small>
${docSnap.data().createdAt
? new Date(
docSnap.data().createdAt.seconds * 1000
).toLocaleString()
: ""}
</small>

<button class="btn-secondary" onclick="editNote('${docSnap.id}', \`${docSnap.data().note}\`)">
Edit
</button>

<button class="btn-danger" onclick="deleteNote('${docSnap.id}')">
Delete
</button>

</div>
`;

});

document.getElementById("noteCount").innerText =
shownCount;
document.getElementById("totalNotes").innerText =
totalCount;
document.getElementById("savedNotes").innerHTML =
html;

}

  async function deleteNote(noteId){

await window.deleteDoc(
window.doc(window.db, "notes", noteId)
);

loadNotes();

}

function editNote(noteId, currentNote){

showPromptModal("Edit your note:", currentNote, async (newNote) => {

await window.updateDoc(
window.doc(window.db, "notes", noteId),
{
note: newNote
}
);

loadNotes();

});

}

  function toggleTheme(){

const isLight =
document.getElementById("themeSwitch").checked;

if(isLight){

document.body.classList.add("lightTheme");

localStorage.setItem(
"theme",
"light"
);

}else{

document.body.classList.remove("lightTheme");

localStorage.setItem(
"theme",
"dark"
);

}

}

  function openBadges(){

hideAllSections();

document.getElementById("badgesSection")
.classList.remove("hidden");

  closeMenu();
showBackButton();

let html =
`<div class="box"><div style="width:54px;height:54px;border-radius:50%;background:rgba(255,215,0,.25);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 12px;">🎉</div><h3>Account Created</h3></div>`;

if(localStorage.getItem("profileBadge")){

html +=
`<div class="box"><div style="width:54px;height:54px;border-radius:50%;background:rgba(96,165,250,.25);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 12px;">📸</div><h3>Profile Master</h3></div>`;

}

if(localStorage.getItem("firstNoteBadge")){

html +=
`<div class="box"><div style="width:54px;height:54px;border-radius:50%;background:rgba(45,212,191,.25);display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 12px;">📝</div><h3>First Note Created</h3></div>`;

}

    document.getElementById("badgesList").innerHTML =
html;

}

  function loadTheme(){

const theme =
localStorage.getItem("theme");

if(theme === "light"){

document.body.classList.add(
"lightTheme"
);

document.getElementById("themeSwitch").checked = true;

}

}

  function loadTextSizePref(){

const size =
localStorage.getItem("textSize") || "normal";

setTextSize(size, false);

}

function setTextSize(size, save){

document.body.classList.remove(
"text-small",
"text-normal",
"text-large"
);

document.body.classList.add("text-" + size);

if(save !== false){

localStorage.setItem("textSize", size);

}

}

  function loadSoundPref(){

const soundOn =
localStorage.getItem("badgeSound") === "on";

document.getElementById("soundSwitch").checked = soundOn;

}

function toggleBadgeSound(){

const isOn =
document.getElementById("soundSwitch").checked;

localStorage.setItem(
"badgeSound",
isOn ? "on" : "off"
);

if(isOn){
playBadgeSound();
}

}

  // A short, cheerful two-note chime built with the Web Audio API —
  // no sound file needed.
  function playBadgeSound(){

if(localStorage.getItem("badgeSound") !== "on"){
return;
}

try{

const ctx = new (window.AudioContext || window.webkitAudioContext)();
const now = ctx.currentTime;

[523.25, 783.99].forEach((freq, i) => {

const osc = ctx.createOscillator();
const gain = ctx.createGain();

osc.type = "sine";
osc.frequency.value = freq;

gain.gain.setValueAtTime(0.001, now + i * 0.15);
gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.02);
gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);

osc.connect(gain);
gain.connect(ctx.destination);

osc.start(now + i * 0.15);
osc.stop(now + i * 0.15 + 0.3);

});

}catch(error){

console.log("Sound playback not supported:", error);

}

}

  // Fetches the user's own notes and reads them out loud using the
  // browser's built-in text-to-speech (no extra setup needed).
  async function readNotesAloud(){

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

if(!("speechSynthesis" in window)){
showToast("Sorry, your browser doesn't support reading text aloud.");
return;
}

const q = window.query(
window.collection(window.db, "notes"),
window.where("uid", "==", user.uid)
);

const querySnapshot = await window.getDocs(q);

if(querySnapshot.empty){
showToast("You don't have any notes saved yet.");
return;
}

let fullText = "";

querySnapshot.forEach((docSnap) => {
fullText += docSnap.data().note + ". ";
});

window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(fullText);
window.speechSynthesis.speak(utterance);

}

function stopReadingNotes(){

if("speechSynthesis" in window){
window.speechSynthesis.cancel();
}

}

  function openTasks(){

hideAllSections();

document
.getElementById("tasksSection")
.classList.remove("hidden");

  closeMenu();
showBackButton();

loadTasks();

}

function addTask(){

const task =
document.getElementById("taskInput").value;

if(!task) return;

let tasks =
JSON.parse(
localStorage.getItem("tasks")
|| "[]"
);

tasks.push(task);

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

document.getElementById("taskInput").value =
"";

loadTasks();

}

function loadTasks(){

let tasks =
JSON.parse(
localStorage.getItem("tasks")
|| "[]"
);

let html = "";

tasks.forEach((task,index)=>{

html += `
<div style="
background:rgba(255,255,255,.1);
padding:10px;
margin-top:10px;
border-radius:10px;
">

${task}

<button class="btn-danger" style="width:auto;margin-top:0;" onclick="deleteTask(${index})">
Delete
</button>

</div>
`;

});

document.getElementById("taskList").innerHTML =
html;

}

function deleteTask(index){

let tasks =
JSON.parse(
localStorage.getItem("tasks")
|| "[]"
);

tasks.splice(index,1);

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

loadTasks();

}

  async function downloadNotes(){

const user = window.auth.currentUser;

if(!user){
showToast("Please login first");
return;
}

const q = window.query(
window.collection(window.db,"notes"),
window.where("uid","==",user.uid)
);

const querySnapshot =
await window.getDocs(q);

let text = "";

querySnapshot.forEach((docSnap)=>{

text += docSnap.data().note + "\n\n";

});

const blob = new Blob(
[text],
{type:"text/plain"}
);

const a =
document.createElement("a");

a.href =
URL.createObjectURL(blob);

a.download =
"MyNotes.txt";

a.click();

}

  function deleteAllNotes(){

showConfirmModal("Delete ALL your notes?", "Delete All", async () => {

const user = window.auth.currentUser;

if(!user) return;

const q = window.query(
window.collection(window.db,"notes"),
window.where("uid","==",user.uid)
);

const querySnapshot =
await window.getDocs(q);

for(const docSnap of querySnapshot.docs){

await window.deleteDoc(
window.doc(
window.db,
"notes",
docSnap.id
)
);

}

loadNotes();

});

}

  async function resetPassword(){

const email =
document.getElementById("email").value;

if(!email){
showToast("Enter your email first");
return;
}

try{

await window.sendPasswordResetEmail(
window.auth,
email
);

showToast("Password reset email sent!");

}catch(error){

showToast(error.message);

}

}

// IMPORTANT: firebase-config.js loads as a module, which executes AFTER
// this regular script finishes parsing. So any code that touches
// window.auth must wait for DOMContentLoaded, otherwise window.auth /
// window.onAuthStateChanged won't exist yet and this would throw an
// error (which used to silently break the "remember me" + theme code
// that ran right after it).
window.addEventListener("DOMContentLoaded", () => {

// Safety net: the chat bubble/panel should never be visible on the
// login screen. This guarantees a clean state on every fresh page load.
hideChatBubble();
hideQuickAccessButtons();

// Firebase persists auth sessions automatically. If the user was
// already logged in (e.g. they closed the app and came back), this
// fires with their user object immediately and we restore the dashboard
// without asking them to log in again.
window.onAuthStateChanged(window.auth, async (user) => {

if(user){

// Fetch the latest user data from Firestore so we always have
// their current name and picture — even if localStorage is stale.
try{

const docSnap = await window.getDoc(
window.doc(window.db, "user", user.uid)
);

if(docSnap.exists()){

const data = docSnap.data();

localStorage.setItem("studentName", data.fullName || "");
localStorage.setItem("studentEmail", data.email || "");
localStorage.setItem("studentPhone", data.phoneNumber || "");
localStorage.setItem("studentRole", data.role || "Student");

document.getElementById("profileName").innerText = data.fullName || "";
document.getElementById("profileEmail").innerText = data.email || "";

if(data.profilePicture){
document.getElementById("profileImage").src = data.profilePicture;
document.getElementById("profileStatus").innerText = "Yes";
localStorage.setItem("profilePicture", data.profilePicture);
}else{
const savedPic = localStorage.getItem("profilePicture");
if(savedPic){
document.getElementById("profileImage").src = savedPic;
document.getElementById("profileStatus").innerText = "Yes";
}
}

}

}catch(error){

// Firestore offline or error — fall back to localStorage cache
const savedPic = localStorage.getItem("profilePicture");
if(savedPic){
document.getElementById("profileImage").src = savedPic;
document.getElementById("profileStatus").innerText = "Yes";
}

document.getElementById("profileName").innerText =
localStorage.getItem("studentName") || "";
document.getElementById("profileEmail").innerText =
localStorage.getItem("studentEmail") || "";

}

// Show the dashboard (not the login screen)
document.getElementById("auth").style.display = "none";
document.getElementById("dashboard").classList.remove("hidden");
/* profileSection removed */
document.getElementById("dashboardHome").classList.remove("hidden");

document.getElementById("currentDate").innerText =
new Date().toDateString();

showChatBubble();
showLogoutButton();
showQuickAccessButtons();
renderGreeting();
setTimeout(showAIGreetingCard, 1200);
startGlobalDmListener();

if(localStorage.getItem("classChatVerified") === "yes"){
startChatListener();
}

updateMiniProfile();

}

});

const rememberedEmail = localStorage.getItem("rememberedEmail");
const rememberedName = localStorage.getItem("rememberedName");

if(rememberedEmail){
document.getElementById("email").value = rememberedEmail;
document.getElementById("rememberMe").checked = true;
}

if(rememberedName){
document.getElementById("fullName").value = rememberedName;
}

loadTheme();
loadTextSizePref();
loadSoundPref();
loadWallpaperPref();
loadAutoDeletePref();

attachSwipeHandlers("chatMessages", "classChat");
attachSwipeHandlers("threadMessages", "thread");
loadNotificationPref();

});

// ---- Mini profile chip ----

// A bad value ("undefined"/"null" as literal text) can get stuck in
// localStorage from older code that lacked a fallback — once saved,
// no later code fix can undo it, since it's just data sitting on the
// device. This helper detects and quietly repairs that specific case
// every time the name is read, self-healing it going forward.
function getSavedStudentName(){

const raw = localStorage.getItem("studentName");

if(!raw || raw === "undefined" || raw === "null"){
localStorage.removeItem("studentName");
return "Student";
}

return raw;

}

function updateMiniProfile(){

const name = getSavedStudentName();
const role = localStorage.getItem("studentRole") || "Student";
const pic = localStorage.getItem("profilePicture");

document.getElementById("miniProfileName").innerText = name;

if(pic){
document.getElementById("miniProfilePic").src = pic;
document.getElementById("switcherPic").src = pic;
}

document.getElementById("switcherName").innerText = name;
document.getElementById("switcherRole").innerText = role;
document.getElementById("switcherEmail").innerText =
localStorage.getItem("studentEmail") || "";

document.getElementById("miniProfile").classList.remove("hidden");

}

function hideMiniProfile(){

document.getElementById("miniProfile").classList.add("hidden");

}

function openAccountSwitcher(){

document.getElementById("accountSwitcherModal").classList.add("show");

}

function closeAccountSwitcher(){

document.getElementById("accountSwitcherModal").classList.remove("show");

}

// "Change Account" — logs out the current user silently and shows the
// login form so someone else can sign in on the same device.
async function switchAccount(){

closeAccountSwitcher();

try{

await window.signOut(window.auth);

}catch(error){

console.log("Switch account error:", error);

}

// Clear session data but keep preferences (theme, text size etc.)
localStorage.removeItem("studentName");
localStorage.removeItem("studentEmail");
localStorage.removeItem("studentPhone");
localStorage.removeItem("classChatVerified");
localStorage.removeItem("profilePicture");

document.getElementById("fullName").value = "";
document.getElementById("email").value = "";
document.getElementById("password").value = "";
document.getElementById("profileName").innerText = "";
document.getElementById("profileEmail").innerText = "";

document.getElementById("profileImage").src =
"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23ffd700'/><circle cx='60' cy='46' r='22' fill='%23062a54'/><path d='M16 112 Q60 74 104 112 Z' fill='%23062a54'/></svg>";

document.getElementById("dashboard").classList.add("hidden");
/* profileSection removed */
document.getElementById("auth").style.display = "block";

hideAllSections();
hideBackButton();
hideLogoutButton();
hideQuickAccessButtons();
hideMiniProfile();
leaveMeeting();
leaveAudioRoom();
hideChatBubble();
stopChatListener();
stopAllBackgroundListeners();

}

