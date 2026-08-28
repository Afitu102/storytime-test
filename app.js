// ======================================
// STORYTIME APP V2 
// One JavaScript for all pages
// ======================================

// Global Variables
let currentAudio = null;
let currentStory = null;

// Detect current page
const currentPage =
window.location.pathname
.split("/")
.pop();

// ======================================
// THEME MANAGER
// ======================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    document.body.setAttribute(
        "data-theme",
        savedTheme
    );

}

function toggleTheme() {

    const currentTheme =
        document.body.getAttribute("data-theme");

    const newTheme =
        currentTheme === "dark"
        ? "light"
        : "dark";

    document.body.setAttribute(
        "data-theme",
        newTheme
    );

    localStorage.setItem(
        "theme",
        newTheme
    );

}

document.addEventListener(
    "DOMContentLoaded",
    loadTheme
);

// ======================================
// THEME BUTTON
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const themeBtn =
        document.getElementById("themeToggle");

    if (!themeBtn) return;

    function updateThemeButton() {

        const theme =
            document.body.getAttribute("data-theme");

        if (theme === "dark") {

            themeBtn.innerHTML =
                "🌙 Dark Mode";

        } else {

            themeBtn.innerHTML =
                "☀️ Light Mode";

        }

    }

    updateThemeButton();

    themeBtn.addEventListener("click", () => {

        toggleTheme();

        updateThemeButton();

    });

});


// ======================================
// STORAGE ENGINE V6
// ======================================

// ---------- STORY PROGRESS ----------

function getAllProgress() {

    return JSON.parse(

        localStorage.getItem("storytime_progress")

    ) || {};

}

function saveProgress(story) {

    const progress = getAllProgress();

    progress[story.title] = story;

    localStorage.setItem(

        "storytime_progress",

        JSON.stringify(progress)

    );

}

function getProgress(title) {

    const progress = getAllProgress();

    return progress[title] || null;

}

// ---------- CONTINUE LISTENING ----------

function saveContinueStory(title) {

    localStorage.setItem(

        "storytime_continue",

        title

    );

}

function getContinueStory() {

    const title =

        localStorage.getItem("storytime_continue");

    if (!title) return null;

    return getProgress(title);

}

// ---------- RECENTLY PLAYED ----------

function saveRecentlyPlayed(title) {

    let recent = JSON.parse(

        localStorage.getItem("storytime_recent")

    ) || [];

    recent = recent.filter(

        item => item !== title

    );

    recent.unshift(title);

    recent = recent.slice(0, 2);

    localStorage.setItem(

        "storytime_recent",

        JSON.stringify(recent)

    );

}

function getRecentlyPlayed() {

    const recent = JSON.parse(

        localStorage.getItem("storytime_recent")

    ) || [];

    return recent

        .map(title => getProgress(title))

        .filter(Boolean);

}
    
// ======================================
// AUDIO ENGINE V6 (PART A)
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const storyCards =
        document.querySelectorAll(".story-card");

    // Ignore pages without stories
    if (storyCards.length === 0) return;

    storyCards.forEach(card => {

        const audio =
            card.querySelector(".audio-player");

        const playBtn =
            card.querySelector(".play-btn");

        const pauseBtn =
            card.querySelector(".pause-btn");

        const timeDisplay =
            card.querySelector(".time");

        const title =
            card.querySelector("h2").textContent;

        const category =
            card.dataset.category;

        const page =
            card.dataset.page;

        const index =
            [...storyCards].indexOf(card);

        // PART B starts here...
        // =============================
          // PLAY
        // =============================

playBtn.addEventListener("click", () => {

    // Stop previous audio
    if (currentAudio && currentAudio !== audio) {

        currentAudio.pause();

        document
            .querySelectorAll(".play-btn")
            .forEach(btn => {

                btn.textContent = "▶ Play";

            });

    }

    currentAudio = audio;
    currentStory = {

        title,
        category,
        page,
        index

    };

     // Hide Continue Listening card if user starts manually

const continueCard =
    document.getElementById("continueCard");

if (continueCard) {

    continueCard.style.opacity = "0";

    setTimeout(() => {

        continueCard.style.display = "none";

    }, 300);

   }

  localStorage.setItem(
    "storytime_continue",
    title
);
    
    const progress = getProgress(title);

if (progress) {

    audio.addEventListener("loadedmetadata", () => {

        audio.currentTime = progress.time;

        audio.play();

    }, { once:true });

    audio.addEventListener("playing", () => {

        playBtn.textContent = "⏸ Playing";

    }, { once:true });

    audio.load();

} else {

    audio.play();

audio.addEventListener("playing", () => {

    playBtn.textContent = "⏸ Playing";

}, { once:true });
 
}

});

// =============================
// PAUSE
// =============================

pauseBtn.addEventListener("click", () => {

    audio.pause();

    playBtn.textContent =
        "▶ Play";

});

// =============================
// SAVE PROGRESS
// =============================

audio.addEventListener("timeupdate", () => {

    if (!currentStory) return;

    const mins =
        Math.floor(audio.currentTime / 60);

    const secs =
        Math.floor(audio.currentTime % 60);

    // Update timer
    timeDisplay.textContent =
        mins + ":" +
        (secs < 10 ? "0" + secs : secs);

    // Story object
    const story = {

        title,
        category,
        page,
        index,
        time: audio.currentTime

    };

    // Save progress
    saveProgress(story);

    // Make this the Continue story
    saveContinueStory(title);

    // Update Recently Played
    saveRecentlyPlayed(title);

    // Update Continue Card live
    const continueTitle =
        document.getElementById("continueTitle");

    const continueTime =
        document.getElementById("continueTime");

    if (continueTitle && continueTime) {

        continueTitle.textContent =
            title;

        continueTime.textContent =
            "Continue from " +
            mins + ":" +
            (secs < 10 ? "0" + secs : secs)
    
    }
   });    
    
    // =============================
// FINISHED
// =============================

audio.addEventListener("ended", () => {

    playBtn.textContent =
        "▶ Play";

    if (currentAudio === audio) {

        currentAudio = null;

    }

});    
    });

});

function audioResumeStory(story) {

    const cards =
        document.querySelectorAll(".story-card");

    const card =
        cards[story.index];

    // Scroll to the story first
card.scrollIntoView({

    behavior: "smooth",

    block: "center"

});
  
    if (!card) return;

    const audio =
        card.querySelector(".audio-player");

    const playBtn =
        card.querySelector(".play-btn");

    // Leave the button as "Play"
    if (playBtn) {

        playBtn.textContent = "▶ Play";

    }

    currentAudio = audio;
    currentStory = story;

    audio.addEventListener("loadedmetadata", () => {

        audio.currentTime = story.time;

        audio.play();

    }, { once: true });

    audio.addEventListener("playing", () => {

    if (playBtn) {

        playBtn.textContent = "⏸ Playing";

    }

    // Scroll to the story that is now playing
    card.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}, { once: true });
    
    audio.load();

}

// ======================================
// CONTINUE LISTENING MANAGER V6
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const continueCard =
        document.getElementById("continueCard");

    const continueTitle =
        document.getElementById("continueTitle");

    const continueTime =
        document.getElementById("continueTime");

    const continueBtn =
        document.getElementById("continueBtn");

    if (
        !continueCard ||
        !continueTitle ||
        !continueTime ||
        !continueBtn
    ) return;

    const story =
        getContinueStory();

    if (!story) {

        continueCard.style.display = "none";

        return;

    }

    continueCard.style.display = "block";

    continueTitle.textContent =
        story.title;

    const mins =
        Math.floor(story.time / 60);

    const secs =
        Math.floor(story.time % 60);

    continueTime.textContent =
        "Continue from " +
        mins + ":" +
        (secs < 10 ? "0" + secs : secs);
  
    continueBtn.addEventListener("click", () => {

    continueCard.style.opacity = "0";

    setTimeout(() => {

        continueCard.style.display = "none";

    }, 300);

    sessionStorage.setItem(
        "storytime_resume",
        "true"
    );

    if (currentPage !== story.page) {

        window.location.href =
            story.page;

    } else {

        audioResumeStory(story);

    }

});
    
});

// ======================================
// RECENTLY PLAYED MANAGER V6
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const recentContainer =
        document.getElementById("recentStories");

    if (!recentContainer) return;

    const recent =
        getRecentlyPlayed();

    recentContainer.innerHTML = "";

    if (recent.length === 0) return;

    recent.forEach(story => {

        const item =
            document.createElement("div");

        item.className =
            "recent-item";

        item.innerHTML = `
            <h3>${story.title}</h3>
            <p>${story.category}</p>
        `;

        item.addEventListener("click", () => {

    // Make this the current Continue story
    localStorage.setItem(
        "storytime_continue",
        story.title
    );

    // If story is on another page, go there
    if (currentPage !== story.page) {

        window.location.href = story.page;

        return;

    }

    // Stay on this page
    // Update the Continue Listening card only

    const continueTitle =
        document.getElementById("continueTitle");

    const continueTime =
        document.getElementById("continueTime");

    const continueCard =
        document.getElementById("continueCard");

    if (continueCard)
        continueCard.style.display = "block";

    if (continueTitle)
        continueTitle.textContent = story.title;

    if (continueTime) {

        const mins = Math.floor(story.time / 60);
        const secs = Math.floor(story.time % 60);

        continueTime.textContent =
            "Continue from " +
            mins + ":" +
            (secs < 10 ? "0" + secs : secs);

   }
             

});
       
        recentContainer.appendChild(item);

    });

  });      

// ======================================
// AUTO RESUME MANAGER V6
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    if (
        sessionStorage.getItem("storytime_resume") !== "true"
    ) return;

    sessionStorage.removeItem("storytime_resume");

    const story =
        getContinueStory();

    if (!story) return;

    if (currentPage !== story.page) return;

    setTimeout(() => {

        audioResumeStory(story);

    }, 300);

});


// ======================================
// NEWLY ADDED MANAGER V1
// ======================================

const storyPages = [

    "folktales.html",
    "animalstories.html",
    "fairytales.html",
    "authors.html",
  

];

document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("newStories");

    if (!container) return;

    let allStories = [];

    for (const page of storyPages) {

        try {

            const response = await fetch(page);

            const html = await response.text();

            const parser = new DOMParser();

            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );

            const stories =
                doc.querySelectorAll(
                    '.story-card[data-new="true"]'
                );

            stories.forEach(card => {

                allStories.push({

                    title:
                        card.querySelector("h2").textContent,

                    category:
                        card.dataset.category,

                    page:
                        card.dataset.page,

                    added:
                        card.dataset.added

                });

            });

        } catch (err) {

            console.log(page + " not found.");

        }

    }

  // Sort newest first
allStories.sort((a, b) => {

    return new Date(b.added) - new Date(a.added);

});

// Keep only stories added within 7 days

const today = new Date();

allStories = allStories.filter(story => {

    const addedDate = new Date(story.added);

    const daysOld =
        (today - addedDate) / (1000 * 60 * 60 * 24);

    return daysOld <= 7;

});

// Show only the newest five

allStories = allStories.slice(0, 5);
// Display them
allStories.forEach(story => {

    const card = document.createElement("div");

    card.className = "new-story-card";

    card.innerHTML = `
        <h3>${story.title}</h3>
        <p>${story.category}</p>
        <span class="badge">NEW</span>
    `;

    card.addEventListener("click", () => {

        window.location.href =
            story.page +
            "?story=" +
            encodeURIComponent(story.title);

    });

    container.appendChild(card);

});

});

// ======================================
// NEWLY ADDED SCROLL MANAGER
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);

    const storyTitle = params.get("story");

    if (!storyTitle) return;

    const cards = document.querySelectorAll(".story-card");

    cards.forEach(card => {

        const title =
            card.querySelector("h2").textContent.trim();

        if (title === storyTitle) {

            // Scroll smoothly to the story
            card.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

             // Make this story the active one

            const playBtn =
           card.querySelector(".play-btn");

             if (playBtn) {

            playBtn.focus();

}
            
            // Highlight the story briefly
            card.classList.add("new-story-highlight");
            card.style.transition =
                "0.5s";

            setTimeout(() => {

                card.classList.remove("new-story-highlight");

            }, 3000);

        }

    });

});


/* ==========================
   STORY CHAPTER READER
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const chapters = document.querySelectorAll(".chapter");

    if (chapters.length === 0) return;

    const prevBtn = document.getElementById("prevChapter");
    const nextBtn = document.getElementById("nextChapter");

    const storyID = document.title.replace(/\s+/g, "_");

    // Load saved chapter (convert chapter number back to index)
    let currentChapter =
        (parseInt(localStorage.getItem(storyID)) || 1) - 1;

    function showChapter(index){

        chapters.forEach((chapter,i)=>{

            chapter.classList.toggle("active", i===index);

        });

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

        // Save chapter number (1,2,3...)
        localStorage.setItem(storyID, index + 1);

        // Update Recently Read immediately
        if(typeof Reader !== "undefined"){
            Reader.saveStory();
        }

        prevBtn.style.visibility =
            index===0 ? "hidden" : "visible";

        nextBtn.style.display =
            index===chapters.length-1 ? "none" : "inline-block";

    }

// Make sure saved chapter is within range
currentChapter = Math.max(
    0,
    Math.min(currentChapter, chapters.length - 1)
);

showChapter(currentChapter);

nextBtn.addEventListener("click", () => {

    if (currentChapter < chapters.length - 1) {

        currentChapter++;

        showChapter(currentChapter);

    }

});


    prevBtn.addEventListener("click",()=>{

        if(currentChapter>0){

            currentChapter--;

            showChapter(currentChapter);

        }

    });

});


/* ======================================
   STORYTIME READER ENGINE
====================================== */

const Reader = {

saveStory(){

const title = document.body.dataset.storyTitle || document.title;
const image = document.body.dataset.storyImage || "";
const category = document.body.dataset.storyCategory || "";
const page = window.location.pathname.split("/").pop();
const storyID =
document.title.replace(/\s+/g,"_");

const chapter =
parseInt(localStorage.getItem(storyID)) || 1;
let recent=
JSON.parse(localStorage.getItem("recentRead"))||[];

recent = [{

title,

image,

category,

page,

chapter,

time: Date.now()

}];

localStorage.setItem(

"recentRead",

JSON.stringify(recent)

);

},

loadRecent(){

const box=document.getElementById("recentReadStories");

if(!box)return;

const recent=

JSON.parse(localStorage.getItem("recentRead"))||[];

if(recent.length===0){

box.innerHTML="<p>No stories read yet.</p>";

return;

}

box.innerHTML="";

recent.forEach(story=>{

box.innerHTML+=`

<a href="${story.page}"

class="recent-card">

<img src="${story.image}"

style="width:100%;height:130px;object-fit:cover;border-radius:15px;">

<h3>${story.title}</h3>

<p>${story.category}</p>

<p>Continue from Chapter ${story.chapter}</p>

</a>

`;

});

}

};

document.addEventListener("DOMContentLoaded",()=>{

Reader.loadRecent();

});

/* ======================================
   AUTO DETECT STORY PAGE
====================================== */

document.addEventListener("DOMContentLoaded", () => {

    // If this page is a story page...
    if (document.body.dataset.storyTitle) {

        Reader.saveStory();

    }

});




/* =====================================================
   STORYTIME
   YOUTUBE VIDEO PAGE
   VIDEO FUNCTIONALITY ONLY

   IMPORTANT:
   This code does NOT save videos to Recently Read.
   It does NOT control the StoryTime theme.
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const videoCards =
        document.querySelectorAll(".video-card");


    /* =================================================
       OPEN VIDEO
    ================================================= */

    videoCards.forEach(function (card) {

        card.addEventListener("click", function () {

            /* Stop other videos first */
            stopAllOtherVideos(card);


            /* Don't create another player
               if this video is already open */
            if (
                card.querySelector(
                    ".youtube-player-container"
                )
            ) {
                return;
            }


            /* Get YouTube ID */
            const videoId =
                card.getAttribute("data-video-id");


            if (!videoId) {
                console.warn(
                    "YouTube video ID is missing."
                );

                return;
            }


            /* Get thumbnail */
            const thumbnail =
                card.querySelector(".video-thumbnail");


            if (!thumbnail) {
                return;
            }


            /* Create player container */
            const playerContainer =
                document.createElement("div");

            playerContainer.className =
                "youtube-player-container";


            /* Create iframe */
            const iframe =
                document.createElement("iframe");


            iframe.src =
                "https://www.youtube-nocookie.com/embed/"
                + videoId
                + "?autoplay=1&rel=0&enablejsapi=1";


            iframe.title =
                "StoryTime African Folktales Video";


            iframe.setAttribute(
                "allow",
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            );


            iframe.setAttribute(
                "allowfullscreen",
                ""
            );


            iframe.setAttribute(
                "loading",
                "lazy"
            );


            /* Put iframe inside player */
            playerContainer.appendChild(
                iframe
            );


            /* Replace thumbnail */
            thumbnail.innerHTML = "";

            thumbnail.appendChild(
                playerContainer
            );

        });

    });


    /* =================================================
       STOP OTHER VIDEOS
    ================================================= */

    function stopAllOtherVideos(currentCard) {

        const players =
            document.querySelectorAll(
                ".youtube-player-container"
            );


        players.forEach(function (player) {

            const card =
                player.closest(".video-card");


            if (card === currentCard) {
                return;
            }


            const iframe =
                player.querySelector("iframe");


            if (iframe) {

                iframe.contentWindow.postMessage(
                    JSON.stringify({
                        event: "command",
                        func: "pauseVideo",
                        args: []
                    }),
                    "*"
                );

            }

        });

    }


    /* =================================================
       PAUSE VIDEOS WHEN PAGE IS HIDDEN
    ================================================= */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState === "hidden"
            ) {

                const players =
                    document.querySelectorAll(
                        ".youtube-player-container iframe"
                    );


                players.forEach(function (iframe) {

                    iframe.contentWindow.postMessage(
                        JSON.stringify({
                            event: "command",
                            func: "pauseVideo",
                            args: []
                        }),
                        "*"
                    );

                });

            }

        }
    );

});
