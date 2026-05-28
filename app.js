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


// ==========================
// INITIALIZE FIREBASE
// ==========================

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// ==========================
// UNIQUE VISITOR ID
// ==========================

let visitorId = localStorage.getItem("visitorId");

if (!visitorId) {

    visitorId =
    "visitor_" +
    Math.random().toString(36).substring(2) +
    Date.now();

    localStorage.setItem("visitorId", visitorId);

}

// ==========================
// TRACK PAGE VISIT
// ==========================

db.collection("visits").add({

    visitorId: visitorId,
    page: window.location.pathname,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight

});

// ==========================
// TRACK VISIT COUNTER
// ==========================

const visitCounter =
localStorage.getItem("visitCount");

if (!visitCounter) {

    localStorage.setItem("visitCount", 1);

} else {

    localStorage.setItem(
        "visitCount",
        parseInt(visitCounter) + 1
    );

}

// ==========================
// TRACK DOWNLOADS
// ==========================

function trackDownload(fileName) {

    db.collection("downloads").add({

        visitorId: visitorId,
        file: fileName,
        timestamp: new Date()

    });

}

// ==========================
// TRACK SECTION READING TIME
// ==========================

let currentSection = null;
let sectionStartTime = Date.now();

const readingTimes = {};

window.addEventListener("scroll", () => {

    const sections =
    document.querySelectorAll(".card, section");

    sections.forEach(section => {

        const rect =
        section.getBoundingClientRect();

        if (
            rect.top <= 200 &&
            rect.bottom >= 200
        ) {

            const sectionId =
            section.id ||
            section.querySelector("h3")?.innerText ||
            "Unknown Section";

            if (currentSection !== sectionId) {

                const now = Date.now();

                if (currentSection) {

                    const duration =
                    now - sectionStartTime;

                    readingTimes[currentSection] =
                    (readingTimes[currentSection] || 0)
                    + duration;

                }

                currentSection = sectionId;
                sectionStartTime = now;

            }

        }

    });

});

// ==========================
// TRACK TOTAL TIME ON SITE
// ==========================

const pageEnterTime = Date.now();

// ==========================
// SAVE ANALYTICS BEFORE EXIT
// ==========================

window.addEventListener("beforeunload", () => {

    const totalTime =
    Date.now() - pageEnterTime;

    db.collection("sessionTimes").add({

        visitorId: visitorId,
        milliseconds: totalTime,
        timestamp: new Date()

    });

    Object.entries(readingTimes)
    .forEach(([section, time]) => {

        db.collection("readingTime").add({

            visitorId: visitorId,
            section: section,
            milliseconds: time,
            timestamp: new Date()

        });

    });

});

// ==========================
// TRACK BUTTON CLICKS
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
// TRACK DEVICE TYPE
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

// ==========================
// CONSOLE SUCCESS
// ==========================

console.log(
    "Analytics Tracking Enabled"
);