// ==========================
// FIREBASE CONFIG
// ==========================

const firebaseConfig = {
    apiKey: "AIzaSyAWPpuC-KSG5o8aN2ymuVXMF3TZ2PnKLJ0",
    authDomain: "victorportfolio-b4214.firebaseapp.com",
    projectId: "victorportfolio-b4214",
    storageBucket: "victorportfolio-b4214.firebasestorage.app",
    messagingSenderId: "985398449984",
    appId: "1:985398449984:web:75618c0d0b83cc7e918ca5",
    measurementId: "G-C7VMZ0CGJX"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// ==========================
// VISITOR ID
// ==========================

let visitorId =
localStorage.getItem("visitorId");

if(!visitorId){

    visitorId =
    "visitor_" +
    Math.random().toString(36).substring(2) +
    Date.now();

    localStorage.setItem(
        "visitorId",
        visitorId
    );

}

// ==========================
// PAGE VISIT
// ==========================

db.collection("visits").add({

    visitorId: visitorId,
    page: window.location.pathname,
    timestamp: new Date(),
    userAgent: navigator.userAgent

});

// ==========================
// ACTIVE SECTION TRACKING
// ==========================

const sections =
document.querySelectorAll("section, .card");

let activeSection = null;

let sectionStartTime = null;

let isPageVisible = true;

let isUserActive = true;

let lastActivityTime = Date.now();

const sectionTimes = {};

// ==========================
// USER ACTIVITY DETECTION
// ==========================

function updateActivity(){

    lastActivityTime = Date.now();

    isUserActive = true;

}

window.addEventListener("mousemove", updateActivity);

window.addEventListener("scroll", updateActivity);

window.addEventListener("keydown", updateActivity);

window.addEventListener("click", updateActivity);

// ==========================
// IDLE DETECTION
// ==========================

setInterval(() => {

    const now = Date.now();

    if(now - lastActivityTime > 10000){

        isUserActive = false;

    }

}, 1000);

// ==========================
// TAB VISIBILITY DETECTION
// ==========================

document.addEventListener(
    "visibilitychange",
    () => {

        isPageVisible =
        !document.hidden;

    }
);

// ==========================
// FIND ACTIVE SECTION
// ==========================

function getCurrentSection(){

    let bestSection = null;

    let bestVisibility = 0;

    sections.forEach(section => {

        const rect =
        section.getBoundingClientRect();

        const visibleHeight =
        Math.min(
            rect.bottom,
            window.innerHeight
        ) -
        Math.max(rect.top, 0);

        if(visibleHeight > bestVisibility){

            bestVisibility = visibleHeight;

            bestSection = section;

        }

    });

    return bestSection;

}

// ==========================
// MAIN READING TRACKER
// ==========================

setInterval(() => {

    if(!isPageVisible) return;

    if(!isUserActive) return;

    const currentSection =
    getCurrentSection();

    if(!currentSection) return;

    const sectionId =
    currentSection.id ||
    currentSection.querySelector("h3")?.innerText ||
    currentSection.querySelector("h2")?.innerText ||
    "Unknown Section";

    // SECTION CHANGED

    if(activeSection !== sectionId){

        // SAVE OLD SECTION TIME

        if(activeSection && sectionStartTime){

            const duration =
            Date.now() - sectionStartTime;

            sectionTimes[activeSection] =
            (sectionTimes[activeSection] || 0)
            + duration;

        }

        activeSection = sectionId;

        sectionStartTime = Date.now();

    }

}, 1000);

// ==========================
// SESSION TIME
// ==========================

const sessionStart = Date.now();

// ==========================
// SAVE ALL ANALYTICS
// ==========================

window.addEventListener(
    "beforeunload",
    async () => {

        // SAVE CURRENT SECTION

        if(activeSection && sectionStartTime){

            const duration =
            Date.now() - sectionStartTime;

            sectionTimes[activeSection] =
            (sectionTimes[activeSection] || 0)
            + duration;

        }

        // SAVE READING TIMES

        for(const [section,time]
        of Object.entries(sectionTimes)){

            await db.collection(
                "readingTime"
            ).add({

                visitorId: visitorId,
                section: section,
                milliseconds: time,
                seconds:
                Math.floor(time / 1000),
                timestamp: new Date()

            });

        }

        // SAVE SESSION

        const totalSession =
        Date.now() - sessionStart;

        await db.collection(
            "sessionTimes"
        ).add({

            visitorId: visitorId,
            milliseconds: totalSession,
            seconds:
            Math.floor(totalSession / 1000),
            timestamp: new Date()

        });

    }
);

// ==========================
// DOWNLOAD TRACKING
// ==========================

function trackDownload(fileName){

    db.collection("downloads").add({

        visitorId: visitorId,
        file: fileName,
        timestamp: new Date()

    });

}

// ==========================
// TRACK LINK CLICKS
// ==========================

document.querySelectorAll("a")
.forEach(link => {

    link.addEventListener("click", () => {

        db.collection("clicks").add({

            visitorId: visitorId,
            text: link.innerText,
            href: link.href,
            timestamp: new Date()

        });

    });

});

// ==========================
// DEVICE TRACKING
// ==========================

const deviceType =
window.innerWidth <= 768
? "Mobile"
: "Desktop";

db.collection("devices").add({

    visitorId: visitorId,
    type: deviceType,
    timestamp: new Date()

});

console.log(
    "Advanced Analytics Enabled"
);
